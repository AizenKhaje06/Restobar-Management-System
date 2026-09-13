/**
 * Supabase Admin Client
 * 
 * WARNING: This client has FULL database access.
 * - Only use on the server side (never in browser code)
 * - Only use for admin operations (staff creation, etc.)
 * - Never expose service role key to client
 */

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    "Missing Supabase credentials. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local"
  )
}

/**
 * Create an admin Supabase client with service role privileges.
 * 
 * Capabilities:
 * - Bypass Row Level Security (RLS)
 * - Create users without email confirmation
 * - Full database read/write access
 * 
 * Use ONLY for:
 * - Staff account creation
 * - Admin-only operations
 * - Server-side actions
 */
export const createAdminClient = () => {
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
