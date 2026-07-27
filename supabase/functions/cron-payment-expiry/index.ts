import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Helper to interact securely with Supabase as Service Role
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' 
)

serve(async (req) => {
  // Only allow POST or allow GET if triggered by cron
  // We can secure it with a basic secret if it's called over HTTP
  const authHeader = req.headers.get('Authorization')
  const expectedToken = Deno.env.get('CRON_SECRET')

  if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    // Call the RPC function defined in migration 005
    // Default timeout is 30 minutes, but let's pass 15 minutes for strict expiration
    const { data: expiredCount, error } = await supabaseAdmin.rpc('expire_pending_payments', {
      p_minutes_timeout: 15
    })

    if (error) {
      console.error('Error expiring payments:', error)
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      })
    }

    return new Response(JSON.stringify({ success: true, expired: expiredCount }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error) {
    console.error('Execution error:', error)
    return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    })
  }
})
