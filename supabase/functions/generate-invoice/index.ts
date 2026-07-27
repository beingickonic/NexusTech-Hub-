import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { PDFDocument, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { orderId } = await req.json()

    // 1. Fetch Order Data from Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: order, error } = await supabaseClient
      .from('orders')
      .select('*, order_items(*, products(title))')
      .eq('id', orderId)
      .single()

    if (error) throw error

    // 2. Generate PDF
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage()
    const { width, height } = page.getSize()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    
    page.drawText(`NexusTech Hub - Commercial Invoice`, { x: 50, y: height - 50, size: 20, font })
    page.drawText(`Order ID: ${order.id}`, { x: 50, y: height - 80, size: 12, font })
    page.drawText(`Status: ${order.status}`, { x: 50, y: height - 100, size: 12, font })
    page.drawText(`Total Amount: KES ${order.total_amount}`, { x: 50, y: height - 120, size: 12, font })

    let y = height - 160;
    page.drawText(`Items:`, { x: 50, y, size: 14, font })
    y -= 20;

    if (order.order_items) {
      for (const item of order.order_items) {
        page.drawText(`- ${item.products?.title} (x${item.quantity}) - KES ${item.price}`, { x: 60, y, size: 12, font })
        y -= 20;
      }
    }

    const pdfBytes = await pdfDoc.save()

    // 3. Upload to Supabase Storage
    const fileName = `invoice_${order.id}_${Date.now()}.pdf`
    const { data: uploadData, error: uploadError } = await supabaseClient
      .storage
      .from('invoices')
      .upload(fileName, pdfBytes, { contentType: 'application/pdf' })

    if (uploadError) {
        // If bucket doesn't exist or RLS fails, we can just return the PDF stream directly or log it
        throw uploadError;
    }

    const { data: publicUrlData } = supabaseClient.storage.from('invoices').getPublicUrl(fileName)

    // 4. Save metadata to invoices table
    await supabaseClient.from('invoices').insert({
      order_id: order.id,
      invoice_number: `INV-${order.id}`,
      pdf_url: publicUrlData.publicUrl
    })

    return new Response(JSON.stringify({ url: publicUrlData.publicUrl }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
