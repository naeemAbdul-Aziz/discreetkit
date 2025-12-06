import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = (process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY)!

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing environment variables')
    console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY are set in .env.local')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function linkBeyBeePharmacy() {
    try {
        console.log('🔍 Checking BeyBee Pharmacy link status...\n')

        // 1. Find BeyBee user
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()

        if (listError) {
            console.error('❌ Error listing users:', listError)
            return
        }

        const beyBeeUser = users.find(u => u.email === 'beybeepharmacy@gmail.com')

        if (!beyBeeUser) {
            console.log('⚠️  BeyBee user (beybeepharmacy@gmail.com) not found')
            console.log('   Create the user first via signup or seedUsers script')
            return
        }

        console.log(`✅ Found BeyBee user: ${beyBeeUser.email} (ID: ${beyBeeUser.id})`)

        // 2. Find BeyBee Pharmacy
        const { data: pharmacy, error: pharmacyError } = await supabase
            .from('pharmacies')
            .select('*')
            .ilike('name', '%beybee%')
            .single()

        if (pharmacyError || !pharmacy) {
            console.log('⚠️  BeyBee Pharmacy not found in database')
            console.log('   Create it via admin panel first')
            return
        }

        console.log(`✅ Found BeyBee Pharmacy: ${pharmacy.name} (ID: ${pharmacy.id})`)

        // 3. Check if already linked
        if (pharmacy.user_id === beyBeeUser.id) {
            console.log('\n✨ Already linked! No action needed.')
            console.log(`   Pharmacy "${pharmacy.name}" is linked to ${beyBeeUser.email}`)
            return
        }

        if (pharmacy.user_id) {
            console.log(`\n⚠️  Pharmacy is already linked to another user (ID: ${pharmacy.user_id})`)
            console.log('   Unlinking previous user...')
        }

        // 4. Link the pharmacy to the user
        const { error: updateError } = await supabase
            .from('pharmacies')
            .update({ user_id: beyBeeUser.id })
            .eq('id', pharmacy.id)

        if (updateError) {
            console.error('❌ Error linking pharmacy:', updateError)
            return
        }

        console.log('\n🎉 Successfully linked!')
        console.log(`   Pharmacy: ${pharmacy.name}`)
        console.log(`   User: ${beyBeeUser.email}`)
        console.log(`   User ID: ${beyBeeUser.id}`)
        console.log('\n✅ BeyBee can now log in and access their dashboard')

    } catch (error) {
        console.error('❌ Unexpected error:', error)
    }
}

linkBeyBeePharmacy()
