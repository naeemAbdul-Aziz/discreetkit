import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, getSupabaseAdminClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const supabaseServer = await createSupabaseServerClient();
    const { data: { user } } = await supabaseServer.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get('limit') || 50), 200);
    const q = (searchParams.get('q') || '').trim().toLowerCase();

    const supabase = getSupabaseAdminClient();
    let query = supabase
      .from('orders')
      .select('id, code, status, total_price, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    const { data, error } = await query;
    if (error) throw error;

    let rows = data || [];
    if (q) {
      rows = rows.filter((o: any) =>
        String(o.code).toLowerCase().includes(q) || String(o.status).toLowerCase().includes(q)
      );
    }

    return NextResponse.json(rows, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e: any) {
    console.error('Orders API error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
