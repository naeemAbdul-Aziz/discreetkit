import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = (process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY)!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SERVICE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// --- Helpers ---
async function ensureRole(name: string, desc: string) {
  const { data } = await supabase.from('roles').select('id').eq('name', name).single()
  if (data) return data.id
  const { data: newRole, error } = await supabase.from('roles').insert({ name, description: desc }).select('id').single()
  if (error) throw error
  return newRole.id
}

async function ensureUser(email: string, password: string) {
    // Check if user exists in auth.users
    const { data: { users }, error } = await supabase.auth.admin.listUsers()
    const existing = users.find((u: any) => u.email === email)
    
    if (existing) {
        // Update password just in case
        await supabase.auth.admin.updateUserById(existing.id, { password, email_confirm: true })
        return existing.id
    }

    const { data: created, error: createErr } = await supabase.auth.admin.createUser({ 
        email, 
        password, 
        email_confirm: true,
        user_metadata: { name: email.split('@')[0] }
    })
    if (createErr) throw createErr
    return created.user.id
}

async function ensureUserRole(userId: string, roleId: string) {
  const { error } = await supabase.from('user_roles').upsert({ user_id: userId, role_id: roleId }, { onConflict: 'user_id, role_id' })
  if (error) throw error
}

async function clearTable(table: string) {
    const { error } = await supabase.from(table).delete().neq('id', 0) // Delete all
    if (error) console.warn(`Warning clearing ${table}:`, error.message)
}

// --- Main Seed ---
async function main() {
  console.log('🌱 Starting Exhaustive Seed...\n')
  console.log('⚠️  WARNING: This script will clear existing data to ensure a clean state.')
  console.log('   Waiting 5 seconds before proceeding... (Ctrl+C to cancel)')
  await new Promise(resolve => setTimeout(resolve, 5000))

  // 1. Roles & Users
  console.log('👤 Setup Users & Roles...')
  const adminRoleId = await ensureRole('admin', 'Administrator')
  const pharmacyRoleId = await ensureRole('pharmacy', 'Pharmacy Partner')
  
  // FIX: User requested password with lowercase i
  const password = 'DiscreetKitAdmin2k25' 
  
  const adminId = await ensureUser('naeemabdulaziz202@gmail.com', password)
  await ensureUserRole(adminId, adminRoleId)
  console.log('   ✅ Admin: naeemabdulaziz202@gmail.com')

  const pharmacyId = await ensureUser('beybeepharmacy@gmail.com', password)
  await ensureUserRole(pharmacyId, pharmacyRoleId)
  console.log('   ✅ Pharmacy: beybeepharmacy@gmail.com')

  // 2. Store Settings
  console.log('\n⚙️  Store Settings...')
  await supabase.from('store_settings').upsert({ id: 1, store_name: 'DiscreetKit Ghana', currency: 'GHS' })

  // 3. Categories (Matches valid types in data.ts)
  console.log('\n📂 Categories...')
  const categories = [
    { name: 'Sexual Health', slug: 'sexual-health', description: 'Condoms, Lube, STI Kits', image_url: 'https://images.unsplash.com/photo-1576073719676-aa95576db207?auto=format&fit=crop&q=80&w=1000' },
    { name: 'Reproductive Health', slug: 'reproductive-health', description: 'Contraceptives, Pregnancy Tests', image_url: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&q=80&w=1000' },
    { name: 'General Wellness', slug: 'general-wellness', description: 'Vitamins, Supplements', image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=1000' }
  ]
  
  for (const cat of categories) {
      await supabase.from('categories').upsert(cat, { onConflict: 'slug' })
  }

  // CLEANUP: Delete categories that are not in our official list
  const validSlugs = categories.map(c => c.slug)
  const { error: deleteError } = await supabase
      .from('categories')
      .delete()
      .not('slug', 'in', `(${validSlugs.join(',')})`)
  
  if (deleteError) {
      console.warn("⚠️  Could not auto-cleanup categories (foreign key constraints most likely). Manual check advised.")
  } else {
      console.log("   🧹 Cleaned up invalid categories")
  }

  // 4. Products (Authentic items)
  console.log('\n💊 Products...')
  const products = [
      // Sexual Health
      { name: 'Durex Extra Safe (3 Pack)', slug: 'durex-extra-safe-3', category: 'Sexual Health', price_ghs: 45.00, stock_level: 100, description: 'Sslightly thicker for extra confidence.', image_url: 'https://images.unsplash.com/photo-1596489354024-k5164d1f5eabe8?auto=format&fit=crop&q=80&w=1000' },
      { name: 'Durex Play Lube (50ml)', slug: 'durex-play-lube', category: 'Sexual Health', price_ghs: 60.00, stock_level: 80, description: 'Water-based lubricant.', image_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=1000' },
      { name: 'HIV Self-Test Kit', slug: 'hiv-self-test', category: 'Sexual Health', price_ghs: 30.00, stock_level: 200, description: 'Private, accurate HIV test.', image_url: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=1000' },

      // Reproductive Health
      { name: 'Postinor-2', slug: 'postinor-2', category: 'Reproductive Health', price_ghs: 35.00, stock_level: 50, description: 'Emergency contraceptive pill.', image_url: 'https://images.unsplash.com/photo-1627308595186-e8d1a123e758?auto=format&fit=crop&q=80&w=1000', requires_prescription: true },
      { name: 'Pregnancy Test Strip', slug: 'pregnancy-test', category: 'Reproductive Health', price_ghs: 15.00, stock_level: 300, description: 'Fast and accurate.', image_url: 'https://images.unsplash.com/photo-1608047648316-d446dc052912?auto=format&fit=crop&q=80&w=1000' },

      // General Wellness
      { name: 'Multivitamin Complex', slug: 'multivitamin', category: 'General Wellness', price_ghs: 85.00, stock_level: 40, description: 'Daily essential vitamins.', image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=1000' },
  ]
  
  const productMap = new Map<string, number>() // slug -> id

  for (const p of products) {
      const { slug, ...productData } = p 
      
      const { data: prod } = await supabase.from('products').select('id').eq('name', p.name).maybeSingle()
      let pid = prod?.id
      
      if (!pid) {
        const { data: newP, error } = await supabase.from('products').insert(productData).select('id').single()
        if (error) {
            console.error(`❌ Failed to insert ${p.name}:`, error.message)
            continue
        }
        pid = newP.id
      } else {
         await supabase.from('products').update(productData).eq('id', pid)
      }
      if (pid) productMap.set(slug, pid)
  }

  // 5. Pharmacies
  console.log('\n🏥 Pharmacies...')
  const pharmacyData = {
      name: 'BeyBee Pharmacy',
      location: 'Accra, Ghana',
      user_id: pharmacyId,
      partner_code: 'DK-PARTNER-BEYBEE',
      operating_hours: { open: '08:00', close: '22:00' },
      is_open: true,
      email: 'beybeepharmacy@gmail.com',
      phone_number: '+233550000000'
  }
  
  // Check existence
  let pharmId: number
  const { data: existingPharm } = await supabase.from('pharmacies').select('id').eq('email', pharmacyData.email).single()
  if (existingPharm) {
      await supabase.from('pharmacies').update(pharmacyData).eq('id', existingPharm.id)
      pharmId = existingPharm.id
  } else {
      const { data: newPharm, error } = await supabase.from('pharmacies').insert(pharmacyData).select('id').single()
      if (error) throw error
      if (!newPharm) throw new Error('Failed to create pharmacy')
      pharmId = newPharm.id
  }
  
  // 5.5 Waitlist
  console.log('\n⏳ Seeding Waitlist...')
  const { count: currentWaitlist } = await supabase.from('waitlist').select('*', { count: 'exact', head: true })
  const target = 881
  const needed = target - (currentWaitlist || 0)
  
  if (needed > 0) {
      console.log(`   Adding ${needed} entries to reach 881...`)
      // Batch insert in chunks of 50 to be safe
      const batchSize = 50
      for (let i = 0; i < needed; i += batchSize) {
          const chunk = Math.min(batchSize, needed - i)
          const rows = Array.from({ length: chunk }).map((_, idx) => ({
              nickname: `User${Date.now()}_${i + idx}`,
              phone: `050000000${(i + idx) % 10}`,
              referral_code: `REF-${Math.floor(Math.random() * 10000)}`
          }))
          await supabase.from('waitlist').insert(rows)
      }
      console.log(`   ✅ Waitlist populated to ${target}`)
  } else {
      console.log(`   Waitlist already at or above ${target} (${currentWaitlist})`)
  }

  // 6. Pharmacy Inventory & Service Areas
  console.log('\n📦 Pharmacy Inventory & Areas...')
  
  // Inventory
  for (const [slug, pid] of Array.from(productMap.entries())) {
      await supabase.from('pharmacy_products').upsert({
          pharmacy_id: pharmId,
          product_id: pid,
          stock_level: 50,
          pharmacy_price_ghs: products.find(p => p.slug === slug)?.price_ghs || 10,
          is_available: true
      }, { onConflict: 'pharmacy_id, product_id' })
  }

  // Service Areas
  await supabase.from('pharmacy_service_areas').upsert({
      pharmacy_id: pharmId,
      area_name: 'East Legon',
      delivery_fee: 15.00,
      estimated_min_minutes: 20,
      estimated_max_minutes: 45
  }, { onConflict: 'id' } as any) // onConflict might need constraint name, but this is simple insert mostly

  const { data: areas } = await supabase.from('pharmacy_service_areas').select('id').eq('pharmacy_id', pharmId)
  if (!areas || areas.length === 0) {
       await supabase.from('pharmacy_service_areas').insert({
          pharmacy_id: pharmId,
          area_name: 'East Legon',
          delivery_fee: 15.00
      })
  }

  // 7. Orders (Optional: Seed some if empty)
  console.log('\n🛒 Seeding Orders...')
  const { count } = await supabase.from('orders').select('*', { count: 'exact', head: true })
  if ((count || 0) < 5) {
      const productIds = Array.from(productMap.values())
      // Create a completed order
      await supabase.from('orders').insert({
          code: 'ORD-' + Math.floor(Math.random() * 10000),
          status: 'completed',
          total_price: 150.00,
          pharmacy_id: pharmId,
          email: 'customer@example.com',
          items: [{ id: productIds[0], quantity: 2, name: 'Durex Extra Safe' }]
      })
      // Create a pending order
      await supabase.from('orders').insert({
          code: 'ORD-' + Math.floor(Math.random() * 10000),
          status: 'processing',
          total_price: 45.00,
          pharmacy_id: pharmId,
          email: 'customer2@example.com',
          items: [{ id: productIds[0], quantity: 1, name: 'Durex Extra Safe' }]
      })
      console.log('   ✅ Generated sample orders')
  }

  console.log('\n✨ Exhaustive Seed Complete!')
}

main().catch(console.error)
