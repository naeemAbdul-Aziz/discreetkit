
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

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

    if (!data) return;

    const distinct = [...new Set(data.map((p: any) => p.category))];
    console.log('Distinct Categories:', distinct);
}

listCategories();
