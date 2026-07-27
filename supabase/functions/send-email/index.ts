import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { record, type } = await req.json()

    // We only want to send an email when a NEW ticket is created
    if (type !== 'INSERT' || !record) {
      return new Response(JSON.stringify({ message: "Not an insert event" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const { name, email, subject, message, priority, id } = record
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

    if (!RESEND_API_KEY) {
      console.error('Missing RESEND_API_KEY environment variable')
      return new Response(JSON.stringify({ error: "Email configuration missing" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    // Send email using Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Nexus TechHub Support <support@nexustechhub.com>',
        to: email || 'admin@nexustechhub.com', // fallback to admin if guest didn't provide email
        subject: `Ticket Received: ${subject}`,
        html: `
          <div style="font-family: sans-serif; max-w-xl; margin: 0 auto;">
            <h2>We've received your request!</h2>
            <p>Hi ${name || 'Customer'},</p>
            <p>Thank you for contacting Nexus TechHub support. We have successfully received your ticket <strong>#${id}</strong>.</p>
            <p><strong>Priority:</strong> ${priority}</p>
            <p><strong>Your Message:</strong></p>
            <blockquote style="border-left: 4px solid #f97316; padding-left: 10px; color: #4b5563;">
              ${message}
            </blockquote>
            <p>Our team will review your message and respond as soon as possible.</p>
            <br/>
            <p>Best regards,<br/>Nexus TechHub Team</p>
          </div>
        `
      })
    })

    const responseData = await res.json()

    return new Response(JSON.stringify({ success: true, resendResponse: responseData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
