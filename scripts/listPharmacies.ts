import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = (process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY)!
const supabase = createClient(supabaseUrl, supabaseKey)

async function listPharmacies() {
    console.log('📋 Listing all pharmacies in database...\n')

    const { data: pharmacies, error } = await supabase
        .from('pharmacies')
        .select('*')
        .order('id', { ascending: true })

    if (error) {
        console.error('❌ Error fetching pharmacies:', error.message)
        return
    }

    if (!pharmacies || pharmacies.length === 0) {
        console.log('⚠️  No pharmacies found in database')
        return
    }

    console.log(`Found ${pharmacies.length} pharmacies:\n`)
    pharmacies.forEach((p, index) => {
        console.log(`${index + 1}. ${p.name}`)
        console.log(`   ID: ${p.id}`)
        console.log(`   Location: ${p.location}`)
        console.log(`   Email: ${p.email || 'N/A'}`)
        console.log(`   User ID: ${p.user_id || 'NOT LINKED'}`)
        console.log('')
    })
}

listPharmacies().catch(console.error)
