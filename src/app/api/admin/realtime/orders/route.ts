import { getSupabaseAdminClient } from '@/lib/supabase';

export async function GET(request: Request) {
  const supabase = getSupabaseAdminClient();
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      // Initial retry recommendation for EventSource
      controller.enqueue(encoder.encode('retry: 10000\n\n'));

      // Subscribe to all changes on orders
      const channel = supabase
        .channel('realtime-orders')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
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
      Connection: 'keep-alive',
      // Disable Next.js body buffering to allow streaming
      'X-Accel-Buffering': 'no',
    },
  });
}
