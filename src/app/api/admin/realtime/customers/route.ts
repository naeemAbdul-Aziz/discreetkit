import { getSupabaseAdminClient } from '@/lib/supabase';

// Customers page aggregates from orders; listen to orders to refresh customers.
export async function GET(request: Request) {
  const supabase = getSupabaseAdminClient();
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      controller.enqueue(encoder.encode('retry: 10000\n\n'));

      const channel = supabase
        .channel('realtime-customers')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          (payload) => send({ type: 'customers', payload })
        );

      await channel.subscribe();

      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode('event: ping\n'));
        controller.enqueue(encoder.encode('data: {}\n\n'));
      }, 15000);

      const close = () => {
        clearInterval(heartbeat);
        try { channel.unsubscribe(); } catch {}
        try { controller.close(); } catch {}
      };

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
