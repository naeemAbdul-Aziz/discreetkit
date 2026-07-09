"use server";

import { answerQuestions } from "@/ai/flows/answer-questions";
import { createSupabaseServerClient } from "@/lib/supabase";

export async function handleDashboardChat(
  history: { role: 'user' | 'model'; parts: string }[],
  message: string,
  role: "admin" | "pharmacy"
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    let liveContext = "";

    if (user) {
      if (role === "pharmacy") {
        // Fetch pharmacy profile
        const { data: pharmacy } = await supabase
          .from('pharmacies')
          .select('id, name, location, is_partner_hub, is_24_7')
          .eq('user_id', user.id)
          .single();

        if (pharmacy) {
          // Fetch service areas
          const { data: serviceAreas } = await supabase
            .from('pharmacy_service_areas')
            .select('area_name, delivery_fee, max_delivery_time_hours, is_active')
            .eq('pharmacy_id', pharmacy.id);

          // Fetch active orders (processing, received, out_for_delivery)
          const { data: orders } = await supabase
            .from('orders')
            .select('id, code, status, pharmacy_ack_status, total_price_ghs, delivery_area, created_at')
            .eq('pharmacy_id', pharmacy.id)
            .neq('status', 'completed')
            .neq('status', 'cancelled')
            .order('created_at', { ascending: false });

          // Fetch low/unavailable inventory items
          const { data: pharmacyProducts } = await supabase
            .from('pharmacy_products')
            .select('product_id, is_available, stock_level, products(name)')
            .eq('pharmacy_id', pharmacy.id);

          const lowStock = pharmacyProducts?.filter(p => !p.is_available || (p.stock_level !== null && p.stock_level < 5)) || [];

          // Fetch riders
          const { data: riders } = await supabase
            .from('pharmacy_riders')
            .select('name, phone, is_active')
            .eq('pharmacy_id', pharmacy.id);

          // Build context string
          liveContext = `
PHARMACY INFORMATION:
Name: ${pharmacy.name}
Location: ${pharmacy.location}
Is Partner Hub: ${pharmacy.is_partner_hub ? 'Yes' : 'No'}
Is Open 24/7: ${pharmacy.is_24_7 ? 'Yes' : 'No'}

ACTIVE SERVICE ZONES:
${serviceAreas && serviceAreas.length > 0 
  ? serviceAreas.map(a => `- ${a.area_name}: GHS ${a.delivery_fee} (${a.max_delivery_time_hours}h max, ${a.is_active ? 'Active' : 'Inactive'})`).join('\n')
  : 'None configured.'
}

ACTIVE RIDERS ON DUTY:
${riders && riders.length > 0
  ? riders.map(r => `- ${r.name} (${r.phone}): ${r.is_active ? 'Active/On-Duty' : 'Offline'}`).join('\n')
  : 'No riders registered.'
}

ACTIVE UNFULFILLED ORDERS (AWAITING DISPATCH/COMPLETION):
${orders && orders.length > 0
  ? orders.map(o => `- Code: ${o.code}, Status: ${o.status}, Ack Status: ${o.pharmacy_ack_status}, Total GHS: ${o.total_price_ghs}, Area: ${o.delivery_area}`).join('\n')
  : 'None at the moment.'
}

INVENTORY EXCLUSIONS & LOW STOCK (< 5):
${lowStock.length > 0
  ? lowStock.map(p => `- ${(p.products as any)?.name || 'Product ID: ' + p.product_id}: Stock Level = ${p.stock_level}, Available = ${p.is_available ? 'Yes' : 'No'}`).join('\n')
  : 'All standard stock levels are healthy.'
}
`;
        }
      } else if (role === "admin") {
        // Fetch general stats for admin
        const { data: activeOrders } = await supabase
          .from('orders')
          .select('status')
          .neq('status', 'completed')
          .neq('status', 'cancelled');

        const { data: totalPharmacies } = await supabase
          .from('pharmacies')
          .select('id');

        liveContext = `
DISCREETKIT HQ SYSTEM STATUS:
- Total Partner Pharmacies: ${totalPharmacies?.length || 0}
- Total Active Unfulfilled Orders in System: ${activeOrders?.length || 0}
`;
      }
    }

    const result = await answerQuestions({
      query: message,
      history: history,
      role: role,
      liveContext: liveContext
    });

    return result.answer;
  } catch (error) {
    console.error("Dashboard AI Error:", error);
    return "I'm sorry, I cannot connect to the operations mainframe right now.";
  }
}
