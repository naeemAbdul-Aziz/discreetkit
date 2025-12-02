import { getSupabaseAdminClient, getUserRoles, createSupabaseServerClient } from '@/lib/supabase';

export async function GET(request: Request) {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            console.error('[Realtime] Auth error:', authError);
            return new Response('Unauthorized', { status: 401 });
        }

        // Check pharmacy role
        const roles = await getUserRoles(supabase, user.id);
        if (!roles.includes('pharmacy')) {
            return new Response('Forbidden', { status: 403 });
        }

        // Get pharmacy ID for this user
        const { data: pharmacy, error: pharmacyError } = await supabase
            .from('pharmacies')
            .select('id')
            .eq('user_id', user.id)
            .single();

        if (pharmacyError || !pharmacy) {
            console.error('[Realtime] Pharmacy lookup error:', pharmacyError);
            return new Response('Pharmacy not found', { status: 404 });
        }

        const encoder = new TextEncoder();
        const adminSupabase = getSupabaseAdminClient();

        const stream = new ReadableStream<Uint8Array>({
            async start(controller) {
                const send = (data: any) => {
                    try {
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
                    } catch (e) {
                        console.error('[Realtime] Error enqueueing data:', e);
                        try { controller.close(); } catch { }
                    }
                };

                // Initial retry recommendation
                send({ type: 'connected' }); // Send a connected message first

                let channel: any = null;
                let heartbeat: NodeJS.Timeout | null = null;

                try {
                    // Subscribe to orders for this pharmacy
                    channel = adminSupabase
                        .channel(`pharmacy-orders-${pharmacy.id}`)
                        .on(
                            'postgres_changes',
                            {
                                event: '*',
                                schema: 'public',
                                table: 'orders',
                                filter: `pharmacy_id=eq.${pharmacy.id}`
                            },
                            (payload) => send({ type: 'orders', payload })
                        );

                    // Don't await subscribe here to avoid blocking the stream start
                    // Just log errors if they happen later
                    channel.subscribe((status: string) => {
                        if (status !== 'SUBSCRIBED' && status !== 'CLOSED') {
                            console.error(`[Realtime] Subscription status: ${status}`);
                        }
                    });

                    heartbeat = setInterval(() => {
                        try {
                            controller.enqueue(encoder.encode(': ping\n\n'));
                        } catch (e) {
                            if (heartbeat) clearInterval(heartbeat);
                            try { channel?.unsubscribe(); } catch { }
                            try { controller.close(); } catch { }
                        }
                    }, 15000);

                } catch (err) {
                    console.error('[Realtime] Stream error:', err);
                    send({ type: 'error', message: 'Stream initialization failed' });
                    try { controller.close(); } catch { }
                }

                const close = () => {
                    if (heartbeat) clearInterval(heartbeat);
                    try { channel?.unsubscribe(); } catch { }
                    try { controller.close(); } catch { }
                };

                // Close stream on client abort
                (request as any).signal?.addEventListener('abort', close);
            },
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache, no-transform',
                'Connection': 'keep-alive',
                'X-Accel-Buffering': 'no',
            },
        });
    } catch (error) {
        console.error('[Realtime] Fatal error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
