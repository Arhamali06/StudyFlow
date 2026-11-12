import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
}

function json(body: Record<string, string>, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders })
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405)

  const authorization = request.headers.get('Authorization')
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1]
  if (!token) return json({ error: 'Authentication is required.' }, 401)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const secretKeys = Deno.env.get('SUPABASE_SECRET_KEYS')
  if (!supabaseUrl || !secretKeys) return json({ error: 'The account deletion service is not configured.' }, 500)

  let secretKey: string | undefined
  try {
    const parsedKeys = JSON.parse(secretKeys) as { default?: unknown }
    if (typeof parsedKeys.default === 'string') secretKey = parsedKeys.default
  } catch {
    return json({ error: 'The account deletion service is not configured.' }, 500)
  }
  if (!secretKey) return json({ error: 'The account deletion service is not configured.' }, 500)

  const admin = createClient(supabaseUrl, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const { data: { user }, error: userError } = await admin.auth.getUser(token)
  if (userError || !user) return json({ error: 'Authentication is required.' }, 401)

  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id)
  if (deleteError) return json({ error: 'Unable to delete your account.' }, 500)

  return json({ message: 'Account deleted.' })
})
