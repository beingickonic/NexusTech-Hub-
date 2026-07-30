import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { verifyUser } from '../shared/auth.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Authenticate user
    const { user } = await verifyUser(req)

    const { orderId, paymentId, amount, currency, returnUrl } = await req.json()

    if (!orderId || !paymentId || !amount) {
      throw new Error("Missing required parameters")
    }

    const isProd = Deno.env.get('PAYPAL_ENV') === 'production'
    const baseUrl = isProd ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com"
    
    const clientId = Deno.env.get('PAYPAL_CLIENT_ID') ?? ''
    const clientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET') ?? ''
    const auth = btoa(`${clientId}:${clientSecret}`)

    // 1. Get access token
    const authResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: "grant_type=client_credentials"
    })

    const { access_token } = await authResponse.json()

    // 2. Create Order
    const payload = {
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: `NEXUS-${orderId}`,
          amount: {
            currency_code: currency || "USD",
            value: parseFloat(amount).toFixed(2)
          }
        }
      ],
      application_context: {
        return_url: returnUrl || (Deno.env.get('APP_URL') ? `${Deno.env.get('APP_URL')}/payment/status` : 'http://localhost:5173/payment/status'),
        cancel_url: returnUrl || (Deno.env.get('APP_URL') ? `${Deno.env.get('APP_URL')}/payment/status` : 'http://localhost:5173/payment/status')
      }
    }

    const orderResponse = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })

    const orderData = await orderResponse.json()

    if (orderData.error || !orderData.id) {
      throw new Error(orderData.message || "Failed to create PayPal order")
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Update payment record with paypal order id
    await supabase
      .from('payments')
      .update({ 
        transaction_reference: orderData.id,
        status: 'processing'
      })
      .eq('id', paymentId)

    await supabase.from('payment_logs').insert({
      payment_id: paymentId,
      provider: 'paypal',
      event_type: 'order_created',
      payload: orderData
    })

    const approveLink = orderData.links.find(link => link.rel === 'approve')?.href

    return new Response(
      JSON.stringify({ 
        success: true, 
        id: orderData.id,
        approve_link: approveLink
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
