/**
 * @file src/app/api/pharmacy/dashboard/route.ts
 * @description Pharmacy dashboard data API with role validation
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, getUserRoles } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check pharmacy role
    const roles = await getUserRoles(supabase, user.id);
    if (!roles.includes('pharmacy')) {
      return NextResponse.json({ error: 'Pharmacy access required' }, { status: 403 });
    }

    // 1. Get pharmacy record for current user
    const { data: pharmacy, error: pharmacyError } = await supabase
      .from('pharmacies')
      .select('id, name, location')
      .eq('user_id', user.id)
      .single();

    if (pharmacyError || !pharmacy) {
      return NextResponse.json({ error: 'Pharmacy not found' }, { status: 404 });
    }

    // 2. Parallel fetch recent orders and status counts
    const [ordersResult, statsResult] = await Promise.all([
      supabase
        .from('orders')
        .select('id, code, status, pharmacy_ack_status, total_price_ghs, created_at, items, delivery_area')
        .eq('pharmacy_id', pharmacy.id)
        .order('created_at', { ascending: false })
        .limit(20),
      supabase
        .from('orders')
        .select('status, pharmacy_ack_status')
        .eq('pharmacy_id', pharmacy.id)
    ]);

    if (ordersResult.error) throw new Error('Recent orders failed');
    if (statsResult.error) throw new Error('Stats fetch failed');

    const recentOrdersData = ordersResult.data || [];
    const statsData = statsResult.data || [];

    // 3. Fast grouping in memory (already minimized columns)
    const stats = {
      pending: statsData.filter(o => o.status === 'received' && o.pharmacy_ack_status === 'pending').length,
      processing: statsData.filter(o => o.status === 'processing').length,
      outForDelivery: statsData.filter(o => o.status === 'out_for_delivery').length,
      completed: statsData.filter(o => o.status === 'completed').length,
    };

    const statusBreakdown = statsData.reduce((acc, order) => {
      const status = order.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      pharmacy,
      stats,
      recentOrders: recentOrdersData.map(order => ({
        ...order,
        total_price_ghs: Number((order as any).total_price_ghs || 0)
      })),
      statusBreakdown: Object.entries(statusBreakdown).map(([status, count]) => ({ status, count }))
    });

  } catch (error) {
    console.error('[Pharmacy Dashboard API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}