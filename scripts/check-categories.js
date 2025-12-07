const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' }); // Try local first
require('dotenv').config(); // Fallback to .env

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function listCategories() {
    const { data, error } = await supabase
        .from('products')
        .select('category');

    if (error) {
        console.error('Error:', error);
        return;
    }

    const distinct = [...new Set(data.map(p => p.category))];
    console.log('Distinct Categories:', distinct);
}

listCategories();
