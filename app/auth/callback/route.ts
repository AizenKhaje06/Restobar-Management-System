import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    
    // Exchange code for session
    const { data: { session }, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (sessionError) {
      console.error('OAuth callback error:', sessionError)
      return NextResponse.redirect(`${origin}/events/login?error=oauth_failed`)
    }

    if (session?.user) {
      // Check if customer profile exists
      const { data: existingCustomer } = await supabase
        .from('event_customers')
        .select('id')
        .eq('auth_id', session.user.id)
        .single()

      // Create customer profile if doesn't exist
      if (!existingCustomer) {
        const { error: insertError } = await supabase
          .from('event_customers')
          .insert({
            auth_id: session.user.id,
            email: session.user.email!,
            full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'Google User',
            phone: session.user.user_metadata?.phone || '',
            is_verified: true, // Auto-verify Google users
          })

        if (insertError) {
          console.error('Failed to create customer profile:', insertError)
          return NextResponse.redirect(`${origin}/events/login?error=profile_creation_failed`)
        }
      }

      // Redirect to events dashboard on success
      return NextResponse.redirect(`${origin}/events/dashboard`)
    }
  }

  // Redirect to login on any error
  return NextResponse.redirect(`${origin}/events/login?error=oauth_failed`)
}
