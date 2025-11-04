import { NextResponse } from 'next/server';
import { createSupabaseServerClient, getSupabaseAdminClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabaseServer = await createSupabaseServerClient();
    const { data: { user } } = await supabaseServer.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from('orders')
      .select('id, email, total_price, created_at')
      .order('created_at', { ascending: false })
      .limit(2000);
    if (error) throw error;

    const map = new Map<string, { email: string; totalSpent: number; orders: number; firstOrder: string; lastOrder: string }>();
    for (const row of data ?? []) {
      const email = row.email as string | null;
      if (!email) continue;
      const entry = map.get(email) || { email, totalSpent: 0, orders: 0, firstOrder: row.created_at as string, lastOrder: row.created_at as string };
      entry.totalSpent += Number(row.total_price || 0);
      entry.orders += 1;
      if (new Date(row.created_at) < new Date(entry.firstOrder)) entry.firstOrder = row.created_at as string;
      if (new Date(row.created_at) > new Date(entry.lastOrder)) entry.lastOrder = row.created_at as string;
      map.set(email, entry);
    }

    const customers = Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent);
    return NextResponse.json(customers, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e: any) {
    console.error('Customers API error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
