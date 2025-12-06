import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = (process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY)!
const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Links pharmacy user accounts to pharmacy records in the database
 * This fixes the issue where pharmacy users can't see their dashboard
 */
async function linkPharmacyUsers() {
    console.log('🔗 Linking pharmacy users to pharmacy records...\n')

    // Map of pharmacy emails to pharmacy names from seed.sql
    const pharmacyMappings = [
        { email: 'beybeepharmacy@gmail.com', pharmacyName: 'Legon Campus Pharmacy' },
        // Add more mappings as needed when you create more pharmacy users
    ]

    for (const { email, pharmacyName } of pharmacyMappings) {
        try {
            // 1. Get user ID using admin API
            const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()

            if (listError) {
                console.log(`❌ Error listing users: ${listError.message}`)
                continue
            }

            const userData = users.find(u => u.email === email)

            if (!userData) {
                console.log(`❌ User not found: ${email}`)
                continue
            }

            console.log(`✅ Found user: ${email} (${userData.id})`)

            // 2. Get pharmacy record
            const { data: pharmacyData, error: pharmacyError } = await supabase
                .from('pharmacies')
                .select('id, name, user_id')
                .eq('name', pharmacyName)
                .maybeSingle()

            if (pharmacyError || !pharmacyData) {
                console.log(`❌ Pharmacy not found: ${pharmacyName}`)
                console.log(`   Error: ${pharmacyError?.message || 'No pharmacy data'}`)
                continue
            }

            console.log(`✅ Found pharmacy: ${pharmacyName} (ID: ${pharmacyData.id})`)

            // 3. Check if already linked
            if (pharmacyData.user_id === userData.id) {
                console.log(`ℹ️  Already linked: ${email} → ${pharmacyName}`)
                console.log('')
                continue
            }

            // 4. Update pharmacy record with user_id
            const { error: updateError } = await supabase
                .from('pharmacies')
                .update({ user_id: userData.id })
                .eq('id', pharmacyData.id)

            if (updateError) {
                console.log(`❌ Failed to link: ${email} → ${pharmacyName}`)
                console.log(`   Error: ${updateError.message}`)
                continue
            }

            console.log(`✅ Successfully linked: ${email} → ${pharmacyName}`)
            console.log('')
        } catch (error) {
            console.error(`❌ Error processing ${email}:`, error)
            console.log('')
        }
    }

    console.log('✅ Pharmacy user linking complete!')
}

linkPharmacyUsers().catch(console.error)
