import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { generateTrackingCode } from '../src/lib/data';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function populateMockData() {
  console.log('--- POPULATING MOCK HUB DATA (PRIVACY FOCUS) ---');

  // 1. Get UGMC Hub
  const { data: hub } = await supabase
    .from('pharmacies')
    .select('id')
    .eq('name', 'University of Ghana Medical Centre (UGMC)')
    .single();

  if (!hub) {
    console.error('UGMC Hub not found. Please run SQL migration first.');
    return;
  }

  // 2. Get some products
  const { data: products } = await supabase
    .from('products')
    .select('id, name')
    .ilike('name', '%ART%');

  if (!products || products.length === 0) {
     console.error('ART products not found.');
     return;
  }

  const productId = products[0].id;

  // 3. Create 5 Mock Subscriptions
  const mockSubs = [
    { phone: '0203001107', code: 'DK-UGMC-8821', status: 'active', verified: true },
    { phone: '0244112233', code: 'DK-UGMC-1928', status: 'active', verified: true },
    { phone: '0555998877', code: 'DK-UGMC-4455', status: 'active', verified: true },
    { phone: '0277889900', code: 'DK-UGMC-7766', status: 'pending_verification', verified: false },
    { phone: '0209998877', code: 'DK-UGMC-3322', status: 'active', verified: true },
  ];

  for (const m of mockSubs) {
    const { data: sub, error } = await supabase
      .from('medication_refill_subscriptions')
      .upsert({
        subscription_code: 'REF-' + Math.random().toString(36).substring(7).toUpperCase(),
        product_id: productId,
        pharmacy_id: hub.id,
        hospital_id: hub.id,
        hospital_refill_code: m.code,
        phone: m.phone,
        status: m.status,
        prescription_verified: m.verified,
        frequency: 'monthly',
        delivery_address: { city: 'Accra', district: 'Legon', street: 'Clinical Care Road' },
        next_delivery_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
      }, { onConflict: 'hospital_refill_code' })
      .select('id')
      .single();

    if (sub && m.verified) {
      // Create some adherence logs
      await supabase.from('refill_logs').insert([
        {
          subscription_id: sub.id,
          pharmacy_id: hub.id,
          status: 'completed',
          adherence_status: 'confirmed',
          adherence_confirmed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          filled_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]);
    }
  }

  console.log('--- MOCK DATA POPULATED ---');
}

populateMockData();
