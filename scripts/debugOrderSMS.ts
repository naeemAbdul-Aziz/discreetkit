import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { sendOrderConfirmationSMS } from '../src/lib/actions';

// Setup simpler Supabase client for script
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugLatestOrderSMS() {
    console.log('🔍 Fetching latest order...');

    const { data: order, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error || !order) {
        console.error('❌ Failed to fetch latest order:', error);
        return;
    }

    console.log(`✅ Found Order: ${order.code}`);
    console.log(`📞 Phone Masked: "${order.phone_masked}"`);
    console.log(`STATUS: ${order.status}`);

    if (!order.phone_masked) {
        console.error('❌ ERROR: phone_masked is missing or empty!');
        return;
    }

    console.log('🚀 Attempting to send confirmation SMS manually...');

    try {
        // We import the action, which usually runs server-side.
        // In this script context, we hope 'use server' doesn't break it if we use tsx.
        // If it does, we might need to copy the logic.
        // Let's try calling it first.
        await sendOrderConfirmationSMS(order.id);
        console.log('✅ sendOrderConfirmationSMS execution finished (check console for internal logs).');
    } catch (err) {
        console.error('❌ Exception calling sendOrderConfirmationSMS:', err);
    }
}

debugLatestOrderSMS();
