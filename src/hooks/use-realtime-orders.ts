import { useEffect, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { PostgrestSingleResponse } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function useRealtimeOrders(pharmacyId: number | null, onChange: (orders: any[]) => void) {
  const supabaseRef = useRef<any>(null);

  useEffect(() => {
    if (!pharmacyId) return;
    if (!supabaseRef.current) {
      supabaseRef.current = createBrowserClient(supabaseUrl, supabaseAnonKey);
    }
    const supabase = supabaseRef.current;

    // Subscribe to order changes for this pharmacy
    const channel = supabase.channel('orders-pharmacy-' + pharmacyId)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `pharmacy_id=eq.${pharmacyId}`,
        },
        async (payload: any) => {
          // Refetch orders on any change
          const { data }: PostgrestSingleResponse<any[]> = await supabase
            .from('orders')
            .select('*')
            .eq('pharmacy_id', pharmacyId)
            .order('created_at', { ascending: false });
          onChange(data || []);
        }
      )
      .subscribe();

    // Initial fetch
    (async () => {
      const { data }: PostgrestSingleResponse<any[]> = await supabase
        .from('orders')
        .select('*')
        .eq('pharmacy_id', pharmacyId)
        .order('created_at', { ascending: false });
      onChange(data || []);
    })();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pharmacyId, onChange]);
}
