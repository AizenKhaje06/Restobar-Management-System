import { createClient } from "@/lib/supabase/server"

/**
 * Get authenticated event customer
 * Returns customer data if authenticated, null otherwise
 */
export async function getAuthenticatedCustomer() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: customer, error } = await supabase
    .from("event_customers")
    .select("*")
    .eq("auth_id", user.id)
    .single()

  if (error || !customer) return null

  return customer
}

/**
 * Check if user is authenticated (has valid session)
 */
export async function isAuthenticated() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return !!user
}

/**
 * Require authentication - throw error if not authenticated
 * Use in server components/actions that require auth
 */
export async function requireAuth() {
  const customer = await getAuthenticatedCustomer()
  if (!customer) {
    throw new Error("Authentication required")
  }
  return customer
}
