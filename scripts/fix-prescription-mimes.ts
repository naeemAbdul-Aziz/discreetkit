import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = (process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY)!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SERVICE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
    console.log("🛠 Updating prescriptions bucket allowed MIME types...")

    const allowedMimeTypes = [
        'image/jpeg', 
        'image/png', 
        'image/webp', 
        'image/gif', 
        'image/bmp', 
        'image/jpg', 
        'application/pdf'
    ];

    const { data, error } = await supabase
        .storage
        .updateBucket('prescriptions', {
            allowedMimeTypes: allowedMimeTypes,
            public: false
        })

    if (error) {
        console.error("❌ Failed to update bucket:", error)
        process.exit(1)
    }

    console.log("✅ Bucket updated successfully:", data)
}

run()
