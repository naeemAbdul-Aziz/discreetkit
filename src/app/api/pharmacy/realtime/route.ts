import { getSupabaseAdminClient, getUserRoles, createSupabaseServerClient } from '@/lib/supabase';

export async function GET(request: Request) {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return new Response('Unauthorized', { status: 401 });
    }

    // Check pharmacy role
    const roles = await getUserRoles(supabase, user.id);
    if (!roles.includes('pharmacy')) {
        return new Response('Forbidden', { status: 403 });
    }

    // Get pharmacy ID for this user
    const { data: pharmacy } = await supabase
        .from('pharmacies')
        .select('id')
        .eq('user_id', user.id)
        .single();

    if (!pharmacy) {
        return new Response('Pharmacy not found', { status: 404 });
    }

    const encoder = new TextEncoder();
    const adminSupabase = getSupabaseAdminClient(); // Use admin client for subscription to avoid RLS issues with realtime if any

    const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
            const send = (data: any) => {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
            };

            // Initial retry recommendation
            controller.enqueue(encoder.encode('retry: 10000\n\n'));

            // Subscribe to orders for this pharmacy
            const channel = adminSupabase
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

            await channel.subscribe();

            const heartbeat = setInterval(() => {
                controller.enqueue(encoder.encode('event: ping\n'));
                controller.enqueue(encoder.encode('data: {}\n\n'));
            }, 15000);

            const close = () => {
                clearInterval(heartbeat);
                try { channel.unsubscribe(); } catch { /* noop */ }
                try { controller.close(); } catch { /* noop */ }
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
}
