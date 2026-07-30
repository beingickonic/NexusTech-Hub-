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

    const { orderId, paymentId, amount, currency, email, name, phone, returnUrl } = await req.json()

    if (!orderId || !paymentId || !amount || !email) {
      throw new Error("Missing required parameters")
    }

    const flutterwaveKey = Deno.env.get('FLUTTERWAVE_SECRET_KEY') ?? ''
    const redirectUrl = returnUrl || (Deno.env.get('APP_URL') ? `${Deno.env.get('APP_URL')}/payment/status` : 'http://localhost:5173/payment/status')
    
    // Generate a unique transaction reference
    const tx_ref = `NEXUS-${Date.now()}-${orderId}`

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    const payload = {
      tx_ref,
      amount,
      currency: currency || 'USD',
      redirect_url: redirectUrl,
      payment_options: "card, mobilemoney, ussd",
      customer: {
        email,
        phonenumber: phone || "",
        name: name || "Nexus Customer"
      },
      customizations: {
        title: "NexusTech Hub",
        description: `Payment for Order #${orderId}`,
        logo: "https://nexustechhub.com/logo.png"
      }
    }

    const response = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${flutterwaveKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })

    const result = await response.json()

    if (result.status !== "success") {
      throw new Error(result.message || "Failed to initiate Flutterwave payment")
    }

    // Update payment record with the tx_ref so we can match it later
    await supabase
      .from('payments')
      .update({ 
        transaction_reference: tx_ref,
        status: 'processing'
      })
      .eq('id', paymentId)

    await supabase.from('payment_logs').insert({
      payment_id: paymentId,
      provider: 'flutterwave',
      event_type: 'initiate',
      payload: result
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        payment_link: result.data.link,
        tx_ref 
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
