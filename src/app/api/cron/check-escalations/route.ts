
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
        if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
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

        if (error) throw error;

        let alertsSent = 0;
        const adminPhones = (process.env.ADMIN_PHONES || '').split(',').filter(p => p.length > 5);

        if (adminPhones.length === 0) {
            console.warn('No ADMIN_PHONES configured for alerts');
            return NextResponse.json({ warning: 'No admin phones configured' });
        }

        // 2. Logic to filter and alert
        for (const order of orders || []) {
            const created = new Date(order.created_at);
            const diffMins = (now.getTime() - created.getTime()) / (1000 * 60);

            let alertMsg = '';

            if (order.status === 'processing' && diffMins > STALE_PROCESSING_MINS) {
                alertMsg = `⚠️ ALERT: Order ${order.code} stuck in processing for ${Math.floor(diffMins)}m. Check Rider/Pharmacy.`;
            } else if (order.status === 'received' && diffMins > STALE_RECEIVED_MINS) {
                alertMsg = `⚠️ ALERT: Order ${order.code} received ${Math.floor(diffMins)}m ago but not assigned/packed!`;
            }

            if (alertMsg) {
                // Check if we already alerted recently (Optional optimization: check order_events)
                // For MVP, we'll just log an event and send. 
                // Ideally, we check if we sent an alert in the last hour to avoid spam.
                // Todo: Add a 'last_escalation_sent' field or check events. 
                // For now, let's check events to see if we escalated in the last 60 mins.
                
                const { data: recentEvents } = await supabase
                    .from('order_events')
                    .select('created_at')
                    .eq('order_id', order.id)
                    .eq('status', 'Escalation Alert')
                    .gt('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
                    .single();

                if (!recentEvents) {
                    // Send to all admins
                    for (const phone of adminPhones) {
                       await sendSMS(phone, alertMsg);
                    }

                    // Log event
                    await supabase.from('order_events').insert({
                        order_id: order.id,
                        status: 'Escalation Alert',
                        note: alertMsg
                    });
                    
                    alertsSent++;
                }
            }
        }

        return NextResponse.json({ success: true, alertsSent });

    } catch (error: any) {
        console.error('Escalation Cron Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
