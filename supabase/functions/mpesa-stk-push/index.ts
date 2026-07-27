import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper to generate Safaricom OAuth Token
async function getMpesaToken(consumerKey: string, consumerSecret: string) {
  const auth = btoa(`${consumerKey}:${consumerSecret}`)
  const response = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
    headers: { Authorization: `Basic ${auth}` }
  })
  if (!response.ok) throw new Error('Failed to fetch M-Pesa token')
  const data = await response.json()
  return data.access_token
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { orderId, amount, phoneNumber, paymentId } = await req.json()

    // 1. Validate inputs
    if (!orderId || !amount || !phoneNumber || !paymentId) {
      throw new Error("Missing required fields: orderId, amount, phoneNumber, or paymentId")
    }

    // Format phone number to 254...
    let formattedPhone = phoneNumber.replace(/\s+/g, '')
    if (formattedPhone.startsWith('0')) formattedPhone = '254' + formattedPhone.slice(1)
    if (formattedPhone.startsWith('+')) formattedPhone = formattedPhone.slice(1)

    // ... (Credentials logic remains the same)
    const consumerKey = Deno.env.get('MPESA_CONSUMER_KEY')
    const consumerSecret = Deno.env.get('MPESA_CONSUMER_SECRET')
    const passkey = Deno.env.get('MPESA_PASSKEY')
    const shortcode = Deno.env.get('MPESA_SHORTCODE') || '174379' 
    const callbackUrl = Deno.env.get('MPESA_CALLBACK_URL') 

    if (!consumerKey || !consumerSecret || !passkey || !callbackUrl) {
      throw new Error("M-Pesa credentials not configured in Supabase Secrets")
    }

    const token = await getMpesaToken(consumerKey, consumerSecret)
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14)
    const password = btoa(`${shortcode}${passkey}${timestamp}`)

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    // Need Service Role to bypass RLS to update payment if needed, though Anon works if user has RLS UPDATE
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

    // PHASE 3: PAYMENT VALIDATION - Never trust frontend data
    const { data: dbOrder, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('total_amount, payment_status')
      .eq('id', orderId)
      .single()

    if (orderError || !dbOrder) {
      throw new Error("Validation Failed: Order does not exist.")
    }

    if (dbOrder.payment_status === 'paid') {
      throw new Error("Validation Failed: Order is already paid.")
    }

    // Ignore client amount, use DB amount
    const validatedAmount = Math.ceil(dbOrder.total_amount)

    const stkPayload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: validatedAmount,
      PartyA: formattedPhone,
      PartyB: shortcode,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackUrl,
      AccountReference: `Order ${orderId.split('-')[0]}`,
      TransactionDesc: "NexusTech Hub Order Payment"
    }

    const stkResponse = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(stkPayload)
    })

    const stkData = await stkResponse.json()

    if (stkData.errorCode) {
      throw new Error(`Safaricom Error: ${stkData.errorMessage}`)
    }

    // 7. Update the existing Payment intent in database with the transaction_reference
    const { error: dbError } = await supabaseAdmin
      .from('payments')
      .update({ transaction_reference: stkData.CheckoutRequestID })
      .eq('id', paymentId)

    if (dbError) throw dbError

    return new Response(JSON.stringify({ success: true, stkData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('STK Push Error:', error.message)
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
