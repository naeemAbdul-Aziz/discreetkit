import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);
async function checkColumn() {
  console.log('--- CHECKING SCHEMA FOR VALIDATION BLOCKER ---');
  const { data, error } = await supabase
    .from('medication_refill_subscriptions')
    .select('hospital_refill_code')
    .limit(1);
  
  if (error) {
    if (error.message.includes('column "hospital_refill_code" does not exist')) {
        console.error('CRITICAL: "hospital_refill_code" column is MISSING. Please run the SQL migration.');
    } else {
        console.error('DB Error:', error.message);
    }
  } else {
    console.log('SUCCESS: Column exists. The issue might be regex or data.');
  }
}
checkColumn();
