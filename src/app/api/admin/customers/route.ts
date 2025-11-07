import { NextResponse } from 'next/server';
import { createSupabaseServerClient, getSupabaseAdminClient } from '@/lib/supabase';

/**
 * Customers API
 *
 * There is currently no dedicated `customers` table; we derive customer aggregates
 * from the `orders` table. Previously we only grouped by `email`, which led to an
 * empty list if orders were created without an email (e.g. failed payment, or a
 * flow where email was optional / delayed). This endpoint now:
 *   - Falls back to `phone_masked` and then to the unique `code` when `email` is missing.
 *   - Returns a `identifier` field representing the grouping key actually used.
 *   - Keeps the original `email` when present for admin convenience.
 *
 * To improve performance we strongly recommend adding indexes on
 *   - orders(email)
 *   - orders(created_at)
 * (A migration has been added.)
 */

export async function GET() {
  try {
    const supabaseServer = await createSupabaseServerClient();
    const { data: { user } } = await supabaseServer.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from('orders')
      .select('id, email, phone_masked, code, total_price, created_at')
      .order('created_at', { ascending: false })
      .limit(2000);
    if (error) throw error;
    type Agg = { identifier: string; email: string | null; totalSpent: number; orders: number; firstOrder: string; lastOrder: string };
    const map = new Map<string, Agg>();
    for (const row of data ?? []) {
      // Choose stable grouping key
      const identifier = (row.email as string | null) || (row.phone_masked as string | null) || (row.code as string);
      if (!identifier) continue; // Should not happen because code exists
      const existing = map.get(identifier) || {
        identifier,
        email: (row.email as string | null) || null,
        totalSpent: 0,
        orders: 0,
        firstOrder: row.created_at as string,
        lastOrder: row.created_at as string,
      };
      existing.totalSpent += Number(row.total_price || 0);
      existing.orders += 1;
      if (new Date(row.created_at) < new Date(existing.firstOrder)) existing.firstOrder = row.created_at as string;
      if (new Date(row.created_at) > new Date(existing.lastOrder)) existing.lastOrder = row.created_at as string;
      // Preserve earliest discovered email if later rows are missing it
      if (!existing.email && row.email) existing.email = row.email as string;
      map.set(identifier, existing);
    }

    const customers = Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent);
    return NextResponse.json(customers, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e: any) {
    console.error('Customers API error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
