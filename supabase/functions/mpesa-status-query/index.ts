import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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
    const { checkoutRequestId } = await req.json()

    if (!checkoutRequestId) {
      throw new Error("Missing checkoutRequestId")
    }

    const consumerKey = Deno.env.get('MPESA_CONSUMER_KEY')
    const consumerSecret = Deno.env.get('MPESA_CONSUMER_SECRET')
    const passkey = Deno.env.get('MPESA_PASSKEY')
    const shortcode = Deno.env.get('MPESA_SHORTCODE') || '174379' 

    if (!consumerKey || !consumerSecret || !passkey) {
      throw new Error("M-Pesa credentials not configured")
    }

    const token = await getMpesaToken(consumerKey, consumerSecret)
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14)
    const password = btoa(`${shortcode}${passkey}${timestamp}`)

    const payload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId
    }

    const response = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    // Log the manual query attempt
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Data from Safaricom:
    // errorCode / errorMessage if it failed completely
    // ResultCode: "0" if successful, "1032" if cancelled, etc.
    
    let dbReconciliationMessage = "Query successful, but no local updates required."

    if (data.ResultCode === "0") {
      // It was successful. Let's check if our DB thinks it's still pending
      const { data: payment } = await supabaseAdmin
        .from('payments')
        .select('*')
        .eq('transaction_reference', checkoutRequestId)
        .single()
        
      if (payment && payment.status !== 'paid') {
        // The callback was missed! Force process it.
        // Safaricom query doesn't give us the phone or receipt in the exact same format as the callback
        // We'll have to simulate the callback RPC
        const { error: rpcError } = await supabaseAdmin.rpc('process_mpesa_callback', {
          p_checkout_request_id: checkoutRequestId,
          p_merchant_request_id: data.MerchantRequestID || "MANUAL_QUERY",
          p_result_code: parseInt(data.ResultCode, 10),
          p_result_desc: data.ResultDesc,
          p_amount: payment.amount, // We have to trust our DB amount since Query API doesn't return it
          p_receipt: null, // We don't get the receipt here
          p_phone: null,
          p_raw_payload: data
        })

        if (!rpcError) {
          dbReconciliationMessage = "Missed callback detected. Payment forced to paid successfully."
        } else {
          dbReconciliationMessage = "Missed callback detected but reconciliation failed: " + rpcError.message
        }
      }
    } else if (data.ResultCode) {
      // It failed (e.g. 1032 cancelled)
      const { data: payment } = await supabaseAdmin
        .from('payments')
        .select('*')
        .eq('transaction_reference', checkoutRequestId)
        .single()
        
      if (payment && payment.status === 'pending') {
         await supabaseAdmin.rpc('process_mpesa_callback', {
          p_checkout_request_id: checkoutRequestId,
          p_merchant_request_id: data.MerchantRequestID || "MANUAL_QUERY",
          p_result_code: parseInt(data.ResultCode, 10),
          p_result_desc: data.ResultDesc,
          p_amount: payment.amount, 
          p_receipt: null, 
          p_phone: null,
          p_raw_payload: data
        })
        dbReconciliationMessage = "Missed failed callback detected. Payment marked as failed."
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      safaricom_data: data,
      reconciliation: dbReconciliationMessage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Status Query Error:', error.message)
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
