
import { getSupabaseAdminClient } from './src/lib/supabase.ts';

async function check() {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.from('orders').select('id, status, total_price_ghs').limit(5);
  
  if (error) {
    console.error('Error fetching orders:', error);
    return;
  }
  
  console.log('Orders data:', JSON.stringify(data, null, 2));
  
  // Aggregate total revenue for non-cancelled and non-pending_payment orders
  if (data) {
    const revenue = data.reduce((acc, o) => {
      if (o.status !== 'cancelled' && o.status !== 'pending_payment') {
        return acc + Number(o.total_price_ghs || 0);
      }
      return acc;
    }, 0);
    console.log('Sample Revenue:', revenue);
  }
}

check().catch(console.error);
