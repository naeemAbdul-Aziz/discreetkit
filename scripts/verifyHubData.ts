import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyData() {
  console.log('--- VERIFYING HUB DATA ---');
  
  // 1. Check UGMC Pharmacy
  const { data: hub } = await supabase
    .from('pharmacies')
    .select('*')
    .eq('name', 'University of Ghana Medical Centre (UGMC)')
    .single();

  if (!hub) {
    console.log('Hub not found!');
  } else {
    console.log('Hub Found:', hub.name, 'ID:', hub.id, 'User Link:', hub.user_id, 'isHub:', hub.is_partner_hub);
    
    // 2. Check Subscriptions for this Hub
    const { count: subs } = await supabase
      .from('medication_refill_subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('pharmacy_id', hub.id);
    
    console.log('Active Subscriptions for Hub:', subs);

    // 3. Check Orders for this Hub
    const { count: orders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('pharmacy_id', hub.id);

    console.log('Total Orders for Hub:', orders);

    // 4. Check Logs for this Hub
    const { count: logs } = await supabase
      .from('refill_logs')
      .select('*', { count: 'exact', head: true })
      .eq('pharmacy_id', hub.id);

    console.log('Total Refill Logs for Hub:', logs);
  }
}

verifyData();
