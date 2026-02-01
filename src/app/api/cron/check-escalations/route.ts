
import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { sendSMS } from '@/lib/server-utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        // Auth Check
       const authHeader = req.headers.get('authorization');
       const cronSecret = process.env.CRON_SECRET;
       const sanitize = (v?: string | null) => (v ?? '').replace(/^"|"$/g, '').trim();
       const expectedAuth = `Bearer ${sanitize(cronSecret)}`;
       const providedAuth = sanitize(authHeader);
        
        // Return 401 but LOG it clearly so we know why it failed in Vercel logs
       if (!cronSecret || providedAuth !== expectedAuth) {
           console.error('[Cron Security] Unauthorized attempt or missing CRON_SECRET. Header present:', !!authHeader);
             return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = getSupabaseAdminClient();
        const now = new Date();
        const STALE_PROCESSING_MINS = 30;
        const STALE_RECEIVED_MINS = 20;

        // 1. Fetch Orders that might be stale
        const { data: orders, error } = await supabase
            .from('orders')
            .select('id, code, status, created_at, pharmacy_ack_status')
            .in('status', ['received', 'processing'])
            .order('created_at', { ascending: true }); // Oldest first

        if (error) {
             console.error('[Cron DB Error]', error);
             throw error;
        }

        let alertsSent = 0;
        const adminPhones = (process.env.ADMIN_PHONES || '').split(',').filter(p => p.length > 5);

        if (adminPhones.length === 0) {
            console.warn('[Cron Warning] No ADMIN_PHONES configured for alerts');
            // Return 200 so Cron doesn't "fail" just because config is missing, but log it.
            return NextResponse.json({ warning: 'No admin phones configured', success: true });
        }

        // 2. Logic to filter and alert
        for (const order of orders || []) {
            try {
                const created = new Date(order.created_at);
                const diffMins = (now.getTime() - created.getTime()) / (1000 * 60);

                let alertMsg = '';

                if (order.status === 'processing' && diffMins > STALE_PROCESSING_MINS) {
                    alertMsg = `⚠️ ALERT: Order ${order.code} stuck in processing for ${Math.floor(diffMins)}m. Check Rider/Pharmacy.`;
                } else if (order.status === 'received' && diffMins > STALE_RECEIVED_MINS) {
                    alertMsg = `⚠️ ALERT: Order ${order.code} received ${Math.floor(diffMins)}m ago but not assigned/packed!`;
                }

                if (alertMsg) {
                    // Check logic for recent alerts
                    const { data: recentEvents } = await supabase
                        .from('order_events')
                        .select('created_at')
                        .eq('order_id', order.id)
                        .eq('status', 'Escalation Alert')
                        .gt('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
                        .single();

                    if (!recentEvents) {
                        // Send to all admins safely
                        // Use Promise.all to send in parallel and catch individual errors
                        await Promise.allSettled(adminPhones.map(phone => sendSMS(phone, alertMsg)));

                        // Log event
                        await supabase.from('order_events').insert({
                            order_id: order.id,
                            status: 'Escalation Alert',
                            note: alertMsg
                        });
                        
                        alertsSent++;
                    }
                }
            } catch (innerError) {
                console.error(`[Cron Error] Failed to process order ${order.code}:`, innerError);
                // Continue to next order, don't crash whole loop
            }
        }

        return NextResponse.json({ success: true, alertsSent });

    } catch (error: any) {
        console.error('[Cron Critical Error]:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
