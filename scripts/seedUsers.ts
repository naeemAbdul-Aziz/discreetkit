import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// Use server-side service role key
const supabaseKey = (process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY)!;
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

/**
 * Automatically link pharmacy user to a pharmacy based on email pattern
 * Searches for pharmacy name in email (e.g., beybeepharmacy@gmail.com → BeyBee Pharmacy)
 */
async function autoLinkPharmacy(userId: string, email: string): Promise<void> {
  try {
    // Extract potential pharmacy name from email (before @)
    const emailPrefix = email.split('@')[0].toLowerCase()

    // Common patterns: "pharmacyname@...", "pharmacynamepharmacy@..."
    const searchTerm = emailPrefix.replace('pharmacy', '').trim()

    if (!searchTerm) {
      console.log(`   ⚠️  Cannot auto-link ${email}: no identifiable pharmacy name in email`)
      return
    }

    // Search for pharmacy with similar name
    const { data: pharmacies, error } = await supabase
      .from('pharmacies')
      .select('id, name, user_id')
      .ilike('name', `%${searchTerm}%`)

    if (error) {
      console.error(`   ❌ Error searching pharmacies:`, error)
      return
    }

    if (!pharmacies || pharmacies.length === 0) {
      console.log(`   ⚠️  No pharmacy found matching "${searchTerm}" for ${email}`)
      console.log(`   💡 Create pharmacy via admin panel, then run: npx tsx scripts/linkPharmacyUsers.ts`)
      return
    }

    // If multiple matches, use the first unlinked one, or the first one
    const targetPharmacy = pharmacies.find(p => !p.user_id) || pharmacies[0]

    if (targetPharmacy.user_id && targetPharmacy.user_id !== userId) {
      console.log(`   ⚠️  Pharmacy "${targetPharmacy.name}" already linked to another user`)
      return
    }

    if (targetPharmacy.user_id === userId) {
      console.log(`   ✅ Already linked to "${targetPharmacy.name}"`)
      return
    }

    // Link the pharmacy
    const { error: updateError } = await supabase
      .from('pharmacies')
      .update({ user_id: userId })
      .eq('id', targetPharmacy.id)

    if (updateError) {
      console.error(`   ❌ Error linking pharmacy:`, updateError)
      return
    }

    console.log(`   🔗 Auto-linked to pharmacy: "${targetPharmacy.name}"`)
  } catch (err) {
    console.error(`   ❌ Auto-link error:`, err)
  }
}

async function main() {
  console.log('🌱 Seeding users...\n')

  // Admin
  const adminEmail = 'naeemabdulaziz202@gmail.com'
  const adminPassword = 'DiscreetKitAdmin2k25'
  const adminRoleId = await ensureRole('admin')
  const adminUserId = await ensureUser(adminEmail, adminPassword)
  await ensureUserRole(adminUserId, adminRoleId)
  console.log(`✅ Admin: ${adminEmail}`)

  // Pharmacies (add/edit as needed)
  const pharmacies = [
    { email: 'beybeepharmacy@gmail.com', password: 'DiscreetKitAdmin2k25' },
  ]

  const pharmacyRoleId = await ensureRole('pharmacy')

  console.log('\n📦 Creating pharmacy users...')
  for (const { email, password } of pharmacies) {
    const userId = await ensureUser(email, password)
    await ensureUserRole(userId, pharmacyRoleId)
    console.log(`✅ Pharmacy user: ${email}`)

    // Automatically link to pharmacy
    await autoLinkPharmacy(userId, email)
  }

  console.log('\n✨ Seeding complete!')
}

main().catch(console.error)

