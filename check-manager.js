require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkManager() {
  console.log('Checking manager account...\n')
  
  // Check profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, is_active')
    .eq('email', 'manager@test.com')
    .maybeSingle()

  if (profileError) {
    console.log('❌ Error checking profile:', profileError.message)
    return
  }

  if (!profile) {
    console.log('❌ Manager profile not found in profiles table')
    console.log('   Please run the SQL script in Supabase SQL Editor:')
    console.log('   supabase/create_test_manager.sql')
    return
  }

  console.log('✅ Manager profile found:')
  console.log(JSON.stringify(profile, null, 2))
  console.log('')

  // Check auth user
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers()
  
  if (authError) {
    console.log('❌ Error checking auth users:', authError.message)
    return
  }

  const authUser = users.find(u => u.email === 'manager@test.com')
  
  if (!authUser) {
    console.log('❌ Manager auth user not found')
    console.log('   Please run the SQL script in Supabase SQL Editor')
    return
  }

  console.log('✅ Manager auth user found:')
  console.log(`   ID: ${authUser.id}`)
  console.log(`   Email: ${authUser.email}`)
  console.log(`   Email Confirmed: ${authUser.email_confirmed_at ? 'Yes' : 'No'}`)
  console.log('')

  if (profile.role === 'landing_page_manager') {
    console.log('✅ Role is correct: landing_page_manager')
  } else {
    console.log(`❌ Role is incorrect: ${profile.role}`)
    console.log('   Expected: landing_page_manager')
  }
}

checkManager().catch(console.error)
