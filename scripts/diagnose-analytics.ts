/**
 * Diagnostic script to pinpoint why admin revenue shows ₵0
 * Run with: npx ts-node scripts/diagnose-analytics.ts
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_KEY!;

async function diagnose() {
    console.log('\n=== ADMIN ANALYTICS DIAGNOSTICS ===\n');
    
    if (!supabaseUrl || !serviceKey) {
        console.error('❌ Missing env vars: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY');
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    });

    // 1. All orders and their statuses
    console.log('1. ORDER STATUS BREAKDOWN:');
    const { data: allOrders, error: allErr } = await supabase
        .from('orders')
        .select('status, total_price_ghs, subtotal_ghs, created_at')
        .order('created_at', { ascending: false });
    
    if (allErr) {
        console.error('   ❌ Query error:', allErr.message);
    } else {
        const statusCounts: Record<string, { count: number, revenue: number }> = {};
        allOrders?.forEach(o => {
            const s = o.status || 'NULL';
            if (!statusCounts[s]) statusCounts[s] = { count: 0, revenue: 0 };
            statusCounts[s].count++;
            statusCounts[s].revenue += Number(o.total_price_ghs) || 0;
        });
        console.table(statusCounts);
    }

    // 2. Revenue query — same as dashboard
    console.log('\n2. REVENUE QUERY (neq cancelled, neq pending_payment):');
    const { data: revenueData, error: revErr } = await supabase
        .from('orders')
        .select('total_price_ghs, status')
        .neq('status', 'cancelled')
        .neq('status', 'pending_payment');

    if (revErr) {
        console.error('   ❌ Revenue query error:', revErr.message);
    } else {
        const total = revenueData?.reduce((acc, r) => acc + (Number(r.total_price_ghs) || 0), 0) || 0;
        console.log(`   Rows returned: ${revenueData?.length}`);
        console.log(`   Total Revenue: ₵${total}`);
        console.log('   Sample rows:', revenueData?.slice(0, 3));
    }

    // 3. Check if schema has total_price_ghs at all
    console.log('\n3. FIRST 3 ORDERS (raw):');
    const { data: rawOrders, error: rawErr } = await supabase
        .from('orders')
        .select('id, code, status, total_price_ghs, subtotal_ghs, created_at')
        .limit(3);
    
    if (rawErr) {
        console.error('   ❌ Raw query error:', rawErr.message);
    } else {
        console.log(JSON.stringify(rawOrders, null, 2));
    }

    console.log('\n=== END DIAGNOSTICS ===\n');
}

diagnose().catch(console.error);
