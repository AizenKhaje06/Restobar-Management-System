"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { checkRateLimit, createRateLimitError, resetRateLimit, RATE_LIMITS } from "@/lib/rate-limit"
import { headers } from "next/headers"

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}

/**
 * Sign in with username OR email
 * - If identifier contains '@', treat as email
 * - If no '@', treat as username and lookup email from profiles
 */
export async function signInWithUsernameOrEmail(identifier: string, password: string) {
  const supabase = await createClient()
  
  // ✅ NEW: Rate limiting for login attempts
  const headersList = await headers()
  const clientIp = headersList.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1'
  
  const rateLimit = checkRateLimit({
    identifier: clientIp,
    action: 'login',
    maxAttempts: RATE_LIMITS.LOGIN.maxAttempts,
    windowMs: RATE_LIMITS.LOGIN.windowMs,
  })

  if (!rateLimit.allowed) {
    console.log('[signIn] Rate limit hit for IP:', clientIp)
    return { error: createRateLimitError(rateLimit.retryAfter!) }
  }
  
  let email = identifier.trim()
  
  // If no '@' symbol, assume it's a username
  if (!identifier.includes('@')) {
    // Lookup email from profiles table using username
    // Note: This query must work without authentication (public access)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, id')
      .eq('username', identifier.toLowerCase().trim())
      .limit(1)
      .maybeSingle()
    
    console.log('[signIn] Username lookup:', {
      username: identifier.toLowerCase().trim(),
      found: !!profile,
      email: profile?.email,
      profileId: profile?.id,
      error: profileError,
    })
    
    if (!profile?.email) {
      console.log('[signIn] No profile found for username')
      return { error: 'Invalid username or password' }
    }
    
    email = profile.email
  }
  
  console.log('[signIn] Attempting login with email:', email)
  
  // Sign in with email + password
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) {
    console.log('[signIn] Login failed:', error.message)
    return { error: 'Invalid username or password' }
  }
  
  // ✅ NEW: Reset rate limit on successful login
  resetRateLimit('login', clientIp)
  
  console.log('[signIn] Login successful:', data.user?.id)
  
  return { success: true, user: data.user }
}
