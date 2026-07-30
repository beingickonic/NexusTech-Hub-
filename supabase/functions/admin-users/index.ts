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
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error("Missing Authorization header")

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    // Initialize user client to verify token and permissions
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    const { data: { user }, error: userError } = await userClient.auth.getUser()
    if (userError || !user) throw new Error("Unauthorized")

    // Check if user is Admin, Manager, or super_admin
    const { data: profile } = await userClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = profile && ['Admin', 'Manager', 'super_admin'].includes(profile.role)
    const isAdminEmail = user?.email === 'admin@gmail.com'
    
    if (!isAdmin && !isAdminEmail) {
      throw new Error("Forbidden: Admin access required")
    }

    // Initialize service client for bypassing RLS and accessing auth admin API
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch auth users
    const { data: authData, error: authError } = await serviceClient.auth.admin.listUsers()
    if (authError) throw authError

    // Fetch profiles
    const { data: profilesData, error: profilesError } = await serviceClient
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      
    if (profilesError) throw profilesError

    // Create a lookup map for auth users by ID
    const authUsersMap = new Map(authData.users.map(u => [u.id, u]))

    // Merge profiles with auth data
    const mergedCustomers = profilesData.map(p => {
      const authUser = authUsersMap.get(p.id)
      return {
        ...p,
        email: authUser?.email || 'Email missing in Auth',
        last_sign_in_at: authUser?.last_sign_in_at || null,
        created_at: p.created_at || authUser?.created_at
      }
    })

    return new Response(
      JSON.stringify({ success: true, customers: mergedCustomers }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    const message = error instanceof Error
      ? error.message
      : (error as { message?: string; details?: string; hint?: string })?.message
        || (error as { details?: string })?.details
        || (error as { hint?: string })?.hint
        || JSON.stringify(error)
        || 'Unknown error'
        
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
