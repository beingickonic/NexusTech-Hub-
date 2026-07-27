import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const payload = await req.json()
    console.log("M-Pesa Webhook Received:", JSON.stringify(payload))

    const result = payload?.Body?.stkCallback

    if (!result) {
      return new Response("Invalid payload", { status: 400 })
    }

    const url = new URL(req.url)
    const secret = url.searchParams.get('secret')
    const expectedSecret = Deno.env.get('MPESA_WEBHOOK_SECRET')
    if (expectedSecret && secret !== expectedSecret) {
      return new Response("Unauthorized", { status: 401 })
    }

    const checkoutRequestId = result.CheckoutRequestID
    const resultCode = result.ResultCode

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Find the payment
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('transaction_reference', checkoutRequestId)
      .single()

    if (paymentError || !payment) {
      console.error("Payment not found for checkoutRequestId:", checkoutRequestId)
      return new Response("Payment not found", { status: 404 })
    }

    if (payment.status === 'paid') {
      return new Response("Already processed", { status: 200 })
    }

    // Log the callback
    await supabase.from('payment_logs').insert({
      payment_id: payment.id,
      provider: 'mpesa',
      event_type: 'webhook_received',
      payload: result
    })

    if (resultCode === 0) {
      // Success
      const items = result.CallbackMetadata.Item
      const receiptItem = items.find((i: any) => i.Name === 'MpesaReceiptNumber')
      const receiptNumber = receiptItem ? receiptItem.Value : null

      // Update payment
      await supabase
        .from('payments')
        .update({ 
          status: 'paid', 
          transaction_reference: receiptNumber || checkoutRequestId 
        })
        .eq('id', payment.id)

      // Update order status
      await supabase
        .from('orders')
        .update({ status: 'Paid', payment_status: 'paid' })
        .eq('id', payment.order_id)
        
    } else {
      // Failed / Cancelled
      const isCancelled = resultCode === 1032
      const newStatus = isCancelled ? 'cancelled' : 'failed'
      
      await supabase
        .from('payments')
        .update({ status: newStatus })
        .eq('id', payment.id)
        
      // Also update order if needed (or leave as pending)
    }

    return new Response("OK", { status: 200 })
  } catch (error) {
    console.error("Webhook processing error:", error.message)
    return new Response("Internal Server Error", { status: 500 })
  }
})
