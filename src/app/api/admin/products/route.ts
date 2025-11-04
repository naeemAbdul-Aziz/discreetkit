import { NextResponse } from 'next/server';
import { createSupabaseServerClient, getSupabaseAdminClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabaseServer = await createSupabaseServerClient();
    const { data: { user } } = await supabaseServer.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from('products')
      .select('id, name, price_ghs, stock_level, category, brand, created_at, featured');
    if (error) throw error;
    return NextResponse.json(data ?? [], { headers: { 'Cache-Control': 'no-store' } });
  } catch (e: any) {
    console.error('Products API error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
