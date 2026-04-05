import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);
async function inspectTable() {
  console.log('--- INSPECTING PHARMACIES SCHEMA ---');
  const { data, error } = await supabase.rpc('inspect_table_columns', { table_name: 'pharmacies' });
  if (error) {
    console.log('RPC failed, trying raw query fallback...');
    const { data: raw, error: rawError } = await supabase
      .from('pharmacies')
      .select('*')
      .limit(1);
    if (raw && raw.length > 0) {
      console.log('Columns found:', Object.keys(raw[0]));
    }
  } else {
    console.log('Columns:', data);
  }
}
inspectTable();
