import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = (process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY)!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Checking database tables...");
  
  try {
    const { data: orders, error: oErr } = await supabase.from('orders').select('*').limit(1);
    console.log("Orders sample:", orders, "Error:", oErr);

    const { data: events, error: eErr } = await supabase.from('order_events').select('*').limit(1);
    console.log("Events sample:", events, "Error:", eErr);

    const { data: refills, error: rErr } = await supabase.from('medication_refill_subscriptions').select('*').limit(1);
    console.log("Refills sample:", refills, "Error:", rErr);

    const { data: pharmacies, error: pErr } = await supabase.from('pharmacies').select('*').limit(1);
    console.log("Pharmacies sample:", pharmacies, "Error:", pErr);
  } catch (err) {
    console.error("Diagnostic failed:", err);
  }
}

run();
