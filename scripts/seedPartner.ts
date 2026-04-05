import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function seedPartner() {
  console.log('--- SEEDING UGMC PARTNER HUB USER ---');

  const email = 'ugmc@gmail.com';
  const password = 'DiscreetKitAdmin2k25';
  const pharmacyName = 'University of Ghana Medical Centre (UGMC)';

  // 1. Create User
  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name: 'UGMC Hub Admin' }
  });

  if (userError) {
    if (userError.message.includes('already registered')) {
        console.log('User already exists, proceeding to linkage.');
    } else {
        console.error('Error creating user:', userError.message);
        return;
    }
  }

  const user = userData.user || (await supabase.from('auth.users').select('id').eq('email', email).single()).data;
  const userId = userData.user?.id;

  if (!userId) {
      // Fallback if user existed
      const { data: existingUser } = await supabase.auth.admin.listUsers();
      const found = existingUser.users.find(u => u.email === email);
      if (!found) {
          console.error('Could not find user ID');
          return;
      }
      (global as any).userId = found.id;
  } else {
      (global as any).userId = userId;
  }

  const finalUserId = (global as any).userId;
  console.log(`User ID: ${finalUserId}`);

  // 2. Assign 'pharmacy' role
  const { data: role } = await supabase.from('roles').select('id').eq('name', 'pharmacy').single();
  if (role) {
    await supabase.from('user_roles').upsert({
      user_id: finalUserId,
      role_id: role.id
    }, { onConflict: 'user_id, role_id' });
    console.log('Role "pharmacy" assigned.');
  }

  // 3. Link to UGMC Pharmacy
  const { data: pharmacy, error: phError } = await supabase
    .from('pharmacies')
    .update({ user_id: finalUserId, is_partner_hub: true })
    .eq('name', pharmacyName)
    .select()
    .single();

  if (phError) {
    console.error('Error linking pharmacy:', phError.message);
  } else {
    console.log(`Linked to Pharmacy Hub: ${pharmacy.name} (Code: ${pharmacy.partner_code})`);
  }

  console.log('--- SEEDING COMPLETE ---');
}

seedPartner();
