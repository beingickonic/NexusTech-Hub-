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
    const { paypalOrderId } = await req.json()

    if (!paypalOrderId) {
      throw new Error("Missing paypalOrderId")
    }

    const isProd = Deno.env.get('PAYPAL_ENV') === 'production'
    const baseUrl = isProd ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com"
    
    const clientId = Deno.env.get('PAYPAL_CLIENT_ID') ?? ''
    const clientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET') ?? ''
    const auth = btoa(`${clientId}:${clientSecret}`)

    // 1. Get token
    const authResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: "grant_type=client_credentials"
    })
    const { access_token } = await authResponse.json()

    // 2. Capture Order
    const captureResponse = await fetch(`${baseUrl}/v2/checkout/orders/${paypalOrderId}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json"
      }
    })

    const captureData = await captureResponse.json()

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Find the payment
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('transaction_reference', paypalOrderId)
      .single()

    if (paymentError || !payment) {
      throw new Error("Payment not found in database")
    }

    if (payment.status === 'paid') {
      return new Response(
        JSON.stringify({ success: true, message: "Already captured" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    await supabase.from('payment_logs').insert({
      payment_id: payment.id,
      provider: 'paypal',
      event_type: 'order_captured',
      payload: captureData
    })

    if (captureData.status === "COMPLETED") {
      await supabase.from('payments').update({ status: 'paid' }).eq('id', payment.id)
      await supabase.from('orders').update({ status: 'Paid', payment_status: 'paid' }).eq('id', payment.order_id)
      
      return new Response(
        JSON.stringify({ success: true, capture: captureData }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    } else {
      await supabase.from('payments').update({ status: 'failed' }).eq('id', payment.id)
      return new Response(
        JSON.stringify({ success: false, capture: captureData }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
