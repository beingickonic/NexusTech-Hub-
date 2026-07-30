import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export async function verifyUser(req: Request) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    throw new Error('Missing Authorization header')
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  const supabase = createClient(supabaseUrl, supabaseKey)

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    throw new Error('Unauthorized: Invalid JWT')
  }

  // Use service role to securely fetch the profile role
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  const supabaseService = createClient(supabaseUrl, serviceKey)
  
  const { data: profile } = await supabaseService
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return { user, role: profile?.role || 'Customer' }
}

export function verifyRole(role: string, allowedRoles: string[]) {
  if (!allowedRoles.includes(role)) {
    throw new Error('Forbidden: Insufficient privileges')
  }
}
