import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { orderId, paymentId, phoneNumber, amount } = await req.json()

    // Validate input
    if (!orderId || !paymentId || !phoneNumber || !amount) {
      throw new Error("Missing required parameters")
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Generate Daraja Auth Token
    const consumerKey = Deno.env.get('MPESA_CONSUMER_KEY') ?? ''
    const consumerSecret = Deno.env.get('MPESA_CONSUMER_SECRET') ?? ''
    const auth = btoa(`${consumerKey}:${consumerSecret}`)
    
    // Sandbox or Production URL
    const isProd = Deno.env.get('MPESA_ENV') === 'production'
    const authUrl = isProd 
      ? 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
      : 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
      
    const authResponse = await fetch(authUrl, {
      headers: { 'Authorization': `Basic ${auth}` }
    })
    
    if (!authResponse.ok) throw new Error("Failed to authenticate with M-Pesa")
    const { access_token } = await authResponse.json()

    // Initiate STK Push
    const stkUrl = isProd
      ? 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
      : 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'

    const shortCode = Deno.env.get('MPESA_SHORTCODE') ?? '174379'
    const passkey = Deno.env.get('MPESA_PASSKEY') ?? ''
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14)
    const password = btoa(`${shortCode}${passkey}${timestamp}`)
    
    const webhookSecret = Deno.env.get('MPESA_WEBHOOK_SECRET') ?? 'default_secret'
    const callbackUrl = `${supabaseUrl}/functions/v1/mpesa-webhook?secret=${webhookSecret}`

    const stkBody = {
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.ceil(amount), // Mpesa takes integers
      PartyA: phoneNumber,
      PartyB: shortCode,
      PhoneNumber: phoneNumber,
      CallBackURL: callbackUrl,
      AccountReference: `Order-${orderId}`,
      TransactionDesc: "Payment for Order"
    }

    const stkResponse = await fetch(stkUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(stkBody)
    })

    const stkResult = await stkResponse.json()

    if (stkResult.ResponseCode !== "0") {
      throw new Error(stkResult.errorMessage || "M-Pesa STK Push failed")
    }

    // Update payment record with checkoutRequestId
    await supabase
      .from('payments')
      .update({ 
        transaction_reference: stkResult.CheckoutRequestID,
        status: 'processing'
      })
      .eq('id', paymentId)

    // Log the request
    await supabase.from('payment_logs').insert({
      payment_id: paymentId,
      provider: 'mpesa',
      event_type: 'stk_push_initiated',
      payload: stkResult
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        checkout_request_id: stkResult.CheckoutRequestID 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
