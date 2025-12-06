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

    // Get pharmacy record for current user
    const { data: pharmacy, error: pharmacyError } = await supabase
      .from('pharmacies')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (pharmacyError || !pharmacy) {
      return NextResponse.json({ error: 'Pharmacy not found for user' }, { status: 404 });
    }

    // Get recent orders (limit 20)
    const { data: recentOrdersData, error: recentError } = await supabase
      .from('orders')
      .select('*')
      .eq('pharmacy_id', pharmacy.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (recentError) {
      throw new Error('Failed to fetch recent orders');
    }

    // Get all orders for stats (only necessary columns)
    const { data: statsData, error: statsError } = await supabase
      .from('orders')
      .select('status, pharmacy_ack_status')
      .eq('pharmacy_id', pharmacy.id);

    if (statsError) {
      throw new Error('Failed to fetch order stats');
    }

    // Calculate stats
    const allOrders = statsData || [];
    const pending = allOrders.filter(o => o.status === 'received' && o.pharmacy_ack_status === 'pending').length;
    const accepted = allOrders.filter(o => o.pharmacy_ack_status === 'accepted').length;
    const processing = allOrders.filter(o => o.status === 'processing').length;
    const outForDelivery = allOrders.filter(o => o.status === 'out_for_delivery').length;

    // Recent orders (last 20)
    const recentOrders = (recentOrdersData || []).map(order => ({
      id: order.id,
      code: order.code,
      status: order.status,
      pharmacy_ack_status: order.pharmacy_ack_status,
      total_price: Number(order.total_price),
      created_at: order.created_at,
      items: order.items,
      delivery_area: order.delivery_area
    }));

    // Orders by status for charts
    const statusBreakdown = allOrders.reduce((acc, order) => {
      const status = order.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      pharmacy: {
        id: pharmacy.id,
        name: pharmacy.name,
        location: pharmacy.location
      },
      stats: {
        pending,
        accepted,
        processing,
        outForDelivery
      },
      recentOrders,
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