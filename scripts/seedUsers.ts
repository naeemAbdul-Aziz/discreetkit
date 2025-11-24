import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function ensureRole(name: string): Promise<string> {
  const { data, error } = await supabase.from('roles').select('id').eq('name', name).single()
  if (error && error.code !== 'PGRST116') throw error
  if (data?.id) return data.id
  const { data: inserted, error: insertErr } = await supabase.from('roles').insert({ name }).select('id').single()
  if (insertErr || !inserted?.id) throw insertErr || new Error(`Failed to create role ${name}`)
  return inserted.id
}

async function ensureUser(email: string, password: string): Promise<string> {
  // Prefer direct query to auth.users (requires service role)
  const { data: existing, error: lookupErr } = await supabase
    .from('auth.users')
    .select('id,email')
    .eq('email', email)
    .maybeSingle()
  if (lookupErr && lookupErr.code !== 'PGRST116') throw lookupErr
  if (existing?.id) return existing.id
  // Create user via admin API
  const { data: created, error: createErr } = await supabase.auth.admin.createUser({ email, password, email_confirm: true })
  if (createErr || !created.user?.id) throw createErr || new Error(`Failed to create user ${email}`)
  return created.user.id
}

async function ensureUserRole(userId: string, roleId: string): Promise<void> {
  const { data, error } = await supabase.from('user_roles').select('id').eq('user_id', userId).eq('role_id', roleId).maybeSingle()
  if (error && error.code !== 'PGRST116') throw error
  if (data?.id) return
  const { error: insertErr } = await supabase.from('user_roles').insert({ user_id: userId, role_id: roleId })
  if (insertErr) throw insertErr
}

async function main() {
  // Admin
  const adminEmail = 'naeemabdulaziz202@gmail.com'
  const adminPassword = 'DiscreetKitAdmin2k25'
  const adminRoleId = await ensureRole('admin')
  const adminUserId = await ensureUser(adminEmail, adminPassword)
  await ensureUserRole(adminUserId, adminRoleId)

  // Pharmacies (add/edit as needed)
  const pharmacies = [
    { email: 'pharmacy1@example.com', password: 'PharmacyPass1' },
    { email: 'pharmacy2@example.com', password: 'PharmacyPass2' },
    // Add more pharmacies here
  ]
  const pharmacyRoleId = await ensureRole('pharmacy')
  for (const { email, password } of pharmacies) {
    const userId = await ensureUser(email, password)
    await ensureUserRole(userId, pharmacyRoleId)
  }

  console.log('Seeding complete.')
}

main().catch(console.error)
