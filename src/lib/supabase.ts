
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

let supabase: ReturnType<typeof createClient>;

if (
  supabaseUrl &&
  supabaseUrl !== 'YOUR_SUPABASE_URL_HERE' &&
  supabaseAnonKey &&
  supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY_HERE'
) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // Provide a dummy client or handle the absence of credentials gracefully.
  // This prevents the app from crashing if env vars are not set.
  // Note: Any feature requiring Supabase will not work.
  console.warn('Supabase credentials are not set. Database features will be unavailable.');
  supabase = {
    from: () => {
      throw new Error('Supabase client is not configured. Please check your .env file.');
    },
    // Add mocks for other Supabase methods if needed to prevent runtime errors elsewhere
  } as any;
}


export { supabase };
