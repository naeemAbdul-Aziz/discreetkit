import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);
async function debugPharmacies() {
  console.log('--- DEBUGGING PHARMACIES ---');
  const { data: all } = await supabase.from('pharmacies').select('*');
  console.log('Total Pharmacies:', all?.length || 0);
  all?.forEach(p => {
    console.log(`- ${p.name} | ID: ${p.id} | isHub: ${p.is_partner_hub} | userLink: ${p.user_id}`);
  });
}
debugPharmacies();
