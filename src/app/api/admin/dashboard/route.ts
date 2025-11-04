
import { NextResponse } from 'next/server';
import { createSupabaseServerClient, getSupabaseAdminClient } from '@/lib/supabase';

export async function GET() {
  try {
    // Verify authenticated session
    const supabaseServer = await createSupabaseServerClient();
    const { data: { user } } = await supabaseServer.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = getSupabaseAdminClient();

    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sinceIso = since.toISOString();

    // Fetch last 30 days orders for metrics + full recent list for table
    const { data: recentOrders, error: ordersErr } = await supabase
      .from('orders')
      .select('id, code, status, total_price, created_at, email')
      .order('created_at', { ascending: false })
      .limit(200);

    if (ordersErr) throw ordersErr;

    const { data: last30d, error: lastErr } = await supabase
      .from('orders')
      .select('id, total_price, created_at, status, email')
      .gte('created_at', sinceIso)
      .order('created_at', { ascending: true });

    if (lastErr) throw lastErr;

    const includedStatuses = new Set(['received','processing','out_for_delivery','completed']);
    const last30dFiltered = (last30d ?? []).filter(o => includedStatuses.has(String(o.status)));

    const totalRevenue = last30dFiltered.reduce((sum, o: any) => sum + Number(o.total_price || 0), 0);
    const totalSales = last30dFiltered.length;
    const avgOrderValue = totalSales ? totalRevenue / totalSales : 0;

    // Distinct customers based on email (fallback to phone if needed)
    const newCustomers = new Set((last30dFiltered || [])
      .map((o: any) => o.email)
      .filter(Boolean)
    ).size;

    // Build daily revenue series for last 30 days
    const dayMs = 24 * 60 * 60 * 1000;
    const startDay = new Date(Date.now() - 29 * dayMs); // inclusive
    const seriesMap = new Map<string, number>();
    for (let i = 0; i < 30; i++) {
      const d = new Date(startDay.getTime() + i * dayMs);
      const key = d.toISOString().slice(0, 10);
      seriesMap.set(key, 0);
    }
    for (const row of last30dFiltered) {
      const key = new Date(row.created_at).toISOString().slice(0, 10);
      if (seriesMap.has(key)) {
        seriesMap.set(key, (seriesMap.get(key) || 0) + Number(row.total_price || 0));
      }
    }
    const revenueSeries = Array.from(seriesMap.entries()).map(([date, amount]) => ({ date, amount }));

    // Table rows: top 10 most recent orders
    const table = (recentOrders ?? []).filter(o => o.status !== 'pending_payment').slice(0, 10).map((o: any) => ({
      id: o.id,
      code: o.code,
      status: o.status,
      total_price: Number(o.total_price || 0),
      created_at: o.created_at,
    }));

    return NextResponse.json({
      metrics: {
        totalRevenue,
        totalSales,
        avgOrderValue,
        newCustomers,
      },
      recentOrders: table,
      revenueSeries,
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e: any) {
    console.error('Dashboard API error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
