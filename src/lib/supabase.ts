
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (
  !supabaseUrl ||
  supabaseUrl === 'YOUR_SUPABASE_URL_HERE' ||
  !supabaseAnonKey ||
  supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY_HERE'
) {
  throw new Error('Supabase URL and Anon Key must be provided and not be placeholders. Please update your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
