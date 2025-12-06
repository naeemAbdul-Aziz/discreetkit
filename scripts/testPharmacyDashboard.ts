import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = (process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY)!
const supabase = createClient(supabaseUrl, supabaseKey)

async function testPharmacyDashboard() {
    console.log('🧪 Testing pharmacy dashboard API logic...\n')

    const email = 'beybeepharmacy@gmail.com'

    // 1. Get user
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
    if (listError) {
        console.error('❌ Error listing users:', listError.message)
        return
    }

    const user = users.find(u => u.email === email)
    if (!user) {
        console.error('❌ User not found')
        return
    }

    console.log(`✅ Found user: ${user.email}`)
    console.log(`   User ID: ${user.id}\n`)

    // 2. Check roles
    const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role_id, roles(name)')
        .eq('user_id', user.id)

    console.log('📋 User roles:')
    if (rolesError) {
        console.error('   ❌ Error:', rolesError.message)
    } else if (!userRoles || userRoles.length === 0) {
        console.log('   ⚠️  No roles assigned')
    } else {
        userRoles.forEach(ur => {
            const roleName = (ur.roles as any)?.name || 'unknown'
            console.log(`   - ${roleName}`)
        })
    }
    console.log('')

    // 3. Get pharmacy record
    const { data: pharmacy, error: pharmacyError } = await supabase
        .from('pharmacies')
        .select('*')
        .eq('user_id', user.id)
        .single()

    console.log('🏥 Pharmacy record:')
    if (pharmacyError) {
        console.error('   ❌ Error:', pharmacyError.message)
        console.error('   Code:', pharmacyError.code)
    } else if (!pharmacy) {
        console.log('   ⚠️  No pharmacy found')
    } else {
        console.log(`   ✅ Found: ${pharmacy.name}`)
        console.log(`   ID: ${pharmacy.id}`)
        console.log(`   Location: ${pharmacy.location}`)
    }
    console.log('')

    // 4. Get orders for this pharmacy
    if (pharmacy) {
        const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('id, code, status, pharmacy_ack_status')
            .eq('pharmacy_id', pharmacy.id)
            .limit(5)

        console.log('📦 Orders:')
        if (ordersError) {
            console.error('   ❌ Error:', ordersError.message)
        } else if (!orders || orders.length === 0) {
            console.log('   ℹ️  No orders found')
        } else {
            console.log(`   Found ${orders.length} orders:`)
            orders.forEach(o => {
                console.log(`   - ${o.code}: ${o.status} (ack: ${o.pharmacy_ack_status})`)
            })
        }
    }
}

testPharmacyDashboard().catch(console.error)
