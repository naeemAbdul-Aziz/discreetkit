import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(supabaseUrl, serviceKey);

async function checkStorage() {
  console.log('🔍 Checking Storage Configuration...');

  // 1. Check Buckets
  const { data: buckets, error } = await supabase.storage.listBuckets();
  
  if (error) {
    console.error('❌ Error listing buckets:', error);
    return;
  }

  const presBucket = buckets.find(b => b.id === 'prescriptions');
  
  if (!presBucket) {
    console.error('❌ "prescriptions" bucket NOT found!');
    console.log('Available buckets:', buckets.map(b => b.id));
  } else {
    console.log('✅ "prescriptions" bucket found.');
    console.log('   Public:', presBucket.public);
    console.log('   Allowed Mime Types:', presBucket.allowed_mime_types);
    console.log('   File Size Limit:', presBucket.file_size_limit);
  }

  // 2. Test Upload (as Service Role - confirms bucket writeability)
  const testFile = Buffer.from('failed validation test content');
  // Use a valid extension and ensure content-type header if possible, but upload() guesses from ext or file object.
  // We will simulate a png by naming it .png and passing type option.
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('prescriptions')
    .upload('test_admin_upload.png', testFile, { 
        upsert: true,
        contentType: 'image/png'
    });

  if (uploadError) {
    console.error('❌ Service Role Upload Failed:', uploadError);
  } else {
    console.log('✅ Service Role Upload Successful:', uploadData);
    // Cleanup
    await supabase.storage.from('prescriptions').remove(['test_admin_upload.txt']);
  }
}

checkStorage();
