import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const nullableNumberFields = ['old_price', 'category_id']
const requiredNumberFields = ['price', 'stock']
const booleanFields = ['availability', 'featured', 'new_arrival']

const normalizeProductPayload = (payload: Record<string, unknown>) => {
  const normalized: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(payload || {})) {
    if (value === undefined || value === null) continue
    if (typeof value === 'string' && value.trim() === '') continue

    if (requiredNumberFields.includes(key) || nullableNumberFields.includes(key)) {
      const numberValue = Number(value)
      if (Number.isNaN(numberValue)) continue
      normalized[key] = numberValue
      continue
    }

    if (booleanFields.includes(key)) {
      normalized[key] = value === true || value === 'true'
      continue
    }

    normalized[key] = value
  }

  return normalized
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

    // Check if user is Admin or super_admin
    const { data: profile } = await userClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // Allow admin access if:
    // 1. User has Admin or Manager role in database, OR
    // 2. User email is admin@gmail.com
    const isAdmin = profile && ['Admin', 'Manager'].includes(profile.role)
    const isAdminEmail = user?.email === 'admin@gmail.com'
    
    if (!isAdmin && !isAdminEmail) {
      throw new Error("Forbidden: Admin access required")
    }

    // Initialize service client for bypassing RLS on products table
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey)

    const { action, payload, id, stock } = await req.json()
    const productPayload = payload ? normalizeProductPayload(payload) : {}

    let result
    let dbError

    switch (action) {
      case 'create_product': {
        // Ensure availability defaults to true for new products
        const createPayload = { availability: true, ...productPayload }
        ;({ data: result, error: dbError } = await serviceClient
          .from('products')
          .insert(createPayload)
          .select()
          .single())
        break;
      }

      case 'update_product':
        if (!id) throw new Error("Missing product ID");
        ({ data: result, error: dbError } = await serviceClient
          .from('products')
          .update(productPayload)
          .eq('id', id)
          .select()
          .single());
        break;

      case 'delete_product':
        if (!id) throw new Error("Missing product ID");
        ({ data: result, error: dbError } = await serviceClient
          .from('products')
          .delete()
          .eq('id', id));
        break;

      case 'update_stock':
        if (!id) throw new Error("Missing product ID");
        ({ data: result, error: dbError } = await serviceClient
          .from('products')
          .update({ stock })
          .eq('id', id)
          .select()
          .single());
        break;

      default:
        throw new Error("Invalid action")
    }

    if (dbError) throw dbError

    return new Response(
      JSON.stringify({ success: true, product: result }),
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
