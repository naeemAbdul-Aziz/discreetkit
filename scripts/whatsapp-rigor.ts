import { getSupabaseAdminClient } from '../src/lib/supabase';
import { getRedis } from '../src/lib/redis';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function runRigorCheck() {
    console.log('🔍 Running WhatsApp Rigor Check...\n');

    // 1. Environment Check
    const envs = [
        'TWILIO_ACCOUNT_SID',
        'TWILIO_AUTH_TOKEN',
        'TWILIO_PHONE_NUMBER',
        'UPSTASH_REDIS_REST_URL',
        'UPSTASH_REDIS_REST_TOKEN',
        'PAYSTACK_SECRET_KEY',
        'NEXT_PUBLIC_SUPABASE_URL',
        'SUPABASE_SERVICE_ROLE_KEY'
    ];

    console.log('--- Environment Variables ---');
    envs.forEach(env => {
        const val = process.env[env];
        if (val) {
            const masked = val.length > 8 ? `${val.substring(0, 4)}...${val.substring(val.length - 4)}` : '***';
            console.log(`✅ ${env}: ${masked}`);
        } else {
            console.log(`❌ ${env}: MISSING`);
        }
    });

    // 2. Redis Check
    console.log('\n--- Redis Connection ---');
    try {
        const redis = await getRedis();
        await redis.set('rigor_test', 'connected', { ex: 60 });
        const res = await redis.get('rigor_test');
        console.log(`✅ Redis: ${res === 'connected' ? 'Connected & Writable' : 'Data Mismatch'}`);
    } catch (e: any) {
        console.log(`❌ Redis: FAILED - ${e.message}`);
    }

    // 3. Supabase Check
    console.log('\n--- Supabase Connection ---');
    try {
        const supabase = getSupabaseAdminClient();
        const { data: products, error } = await supabase.from('products').select('count', { count: 'exact', head: true });
        if (error) throw error;
        console.log(`✅ Supabase: Connected (${products?.length || 0} products found)`);
        
        const { count, error: orderError } = await supabase.from('orders').select('*', { count: 'exact', head: true });
        if (orderError) throw orderError;
        console.log(`✅ Orders Table: Accessible (${count || 0} total)`);
    } catch (e: any) {
        console.log(`❌ Supabase: FAILED - ${e.message}`);
    }

    // 4. Pharmacy Assignment Check
    console.log('\n--- Assignment Logic Test ---');
    try {
        const { findBestPharmacyForOrder } = await import('../src/lib/order-assignment');
        const res = await findBestPharmacyForOrder([], 'WhatsApp');
        console.log(`ℹ️ WhatsApp Assignment: ${res.pharmacyId ? `SUCCESS (ID: ${res.pharmacyId})` : `Punt to Admin (${res.reason})`}`);
    } catch (e: any) {
        console.log(`❌ Assignment Test: ERROR - ${e.message}`);
    }

    console.log('\n--- Check Complete ---');
}

runRigorCheck().catch(console.error);
