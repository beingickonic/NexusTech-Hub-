import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    // Flutterwave sends signature in headers
    const signature = req.headers.get("verif-hash")
    const secretHash = Deno.env.get('FLUTTERWAVE_SECRET_HASH')

    if (!signature || signature !== secretHash) {
      return new Response("Unauthorized", { status: 401 })
    }

    const payload = await req.json()
    console.log("Flutterwave Webhook:", JSON.stringify(payload))

    if (payload.event !== "charge.completed") {
      return new Response("Event not handled", { status: 200 })
    }

    const tx_ref = payload.data.tx_ref
    const status = payload.data.status // e.g. "successful", "failed"

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Find payment
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('transaction_reference', tx_ref)
      .single()

    if (paymentError || !payment) {
      console.error("Payment not found for tx_ref:", tx_ref)
      return new Response("Payment not found", { status: 404 })
    }

    // Log the callback
    await supabase.from('payment_logs').insert({
      payment_id: payment.id,
      provider: 'flutterwave',
      event_type: 'webhook_received',
      payload: payload
    })

    if (status === "successful") {
      // Best practice: Call Flutterwave API to verify transaction ID
      const flutterwaveKey = Deno.env.get('FLUTTERWAVE_SECRET_KEY') ?? ''
      const verifyRes = await fetch(`https://api.flutterwave.com/v3/transactions/${payload.data.id}/verify`, {
        headers: { Authorization: `Bearer ${flutterwaveKey}` }
      })
      const verifyData = await verifyRes.json()

      if (verifyData.status === "success" && verifyData.data.status === "successful") {
         await supabase.from('payments').update({ status: 'paid' }).eq('id', payment.id)
         await supabase.from('orders').update({ status: 'Paid', payment_status: 'paid' }).eq('id', payment.order_id)
      } else {
         await supabase.from('payments').update({ status: 'failed' }).eq('id', payment.id)
      }
    } else {
      await supabase.from('payments').update({ status: 'failed' }).eq('id', payment.id)
    }

    return new Response("OK", { status: 200 })
  } catch (error) {
    console.error("Flutterwave Webhook Error:", error.message)
    return new Response("Internal Server Error", { status: 500 })
  }
})
