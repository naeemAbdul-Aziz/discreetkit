import { NextResponse } from 'next/server';
import { createSupabaseServerClient, getUserRoles } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const roles = await getUserRoles(supabase, user.id);

    const { data: pharmacy, error: pharmacyError } = await supabase
      .from('pharmacies')
      .select('*')
      .eq('user_id', user.id)
      .single();

    return NextResponse.json({
      ok: true,
      user: { id: user.id, email: user.email },
      roles,
      pharmacy: pharmacy || null,
      pharmacyError: pharmacyError || null,
    });
  } catch (e) {
    console.error('[Pharmacy Debug] Error:', e);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
