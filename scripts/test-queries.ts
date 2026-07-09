import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = (process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY)!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Testing individual Supabase queries...");
  
  const { data: oData, error: oErr } = await supabase
    .from('orders')
    .select('id, code, created_at, total_price_ghs, status, items, pharmacy_id, pharmacies(name)')
    .limit(5);
  console.log("Orders query success:", !!oData, "Error:", oErr);

  const { data: eData, error: eErr } = await supabase
    .from('order_events')
    .select('id, order_id, status, created_at, note, orders!order_id(code, pharmacy_id, pharmacies(name))')
    .limit(5);
  console.log("Events query success:", !!eData, "Error:", eErr);

  const { data: rData, error: rErr } = await supabase
    .from('medication_refill_subscriptions')
    .select('id, subscription_code, enrolled_at, product_id, pharmacy_id, status, products(name), pharmacies!medication_refill_subscriptions_pharmacy_id_fkey(name)')
    .limit(5);
  console.log("Refills query success:", !!rData, "Error:", rErr);
  if (rData && rData.length > 0) {
    console.log("Refills row sample:", rData[0]);
  }
}

run();
