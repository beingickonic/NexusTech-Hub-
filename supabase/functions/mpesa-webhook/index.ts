import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Helper to interact securely with Supabase as Service Role
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' // Bypasses RLS to write to callbacks and update payments
)

serve(async (req) => {
  try {
    const rawBody = await req.text()
    const payload = JSON.parse(rawBody)

    console.log('Received M-Pesa Callback:', JSON.stringify(payload, null, 2))

    // Parse Safaricom Callback Structure
    const body = payload.Body.stkCallback
    const merchantRequestId = body.MerchantRequestID
    const checkoutRequestId = body.CheckoutRequestID
    const resultCode = body.ResultCode
    const resultDesc = body.ResultDesc

    let amount = null, receipt = null, phone = null, transactionDate = null

    // Extract Item array if transaction was successful
    if (resultCode === 0 && body.CallbackMetadata && body.CallbackMetadata.Item) {
      const items = body.CallbackMetadata.Item
      amount = items.find((item: any) => item.Name === 'Amount')?.Value
      receipt = items.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value
      phone = items.find((item: any) => item.Name === 'PhoneNumber')?.Value
      
      const rawDate = items.find((item: any) => item.Name === 'TransactionDate')?.Value
      if (rawDate) {
        // Convert '20230521153022' to a valid timestamp or just save string
        transactionDate = rawDate.toString() 
      }
    }

    // PHASE 1 & 2: Idempotent Atomic Transaction via RPC
    const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc('process_mpesa_callback', {
      p_checkout_request_id: checkoutRequestId,
      p_merchant_request_id: merchantRequestId,
      p_result_code: resultCode,
      p_result_desc: resultDesc,
      p_amount: amount,
      p_receipt: receipt,
      p_phone: phone,
      p_raw_payload: payload
    })

    if (rpcError) {
      console.error('RPC Execution Failed:', rpcError)
      // Even if it fails, we return 200 to Safaricom if it's a constraint or processing error,
      // but if it's an internal server error, we should probably return 500 so Safaricom retries.
      // The RPC is designed to safely handle idempotency and throw on real critical failures.
    } else {
      console.log('RPC Execution Success:', rpcData)
    }

    // Safaricom expects a simple JSON response to acknowledge receipt
    return new Response(JSON.stringify({ "ResultCode": 0, "ResultDesc": "Success" }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return new Response(JSON.stringify({ "ResultCode": 1, "ResultDesc": "Internal Error" }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
