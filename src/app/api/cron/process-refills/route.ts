import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { sendSMS } from '@/lib/server-utils';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const context = 'Refill-Cron';
    try {
        // 1. Auth Check (Same as other crons)
        const authHeader = req.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;
        
        if (process.env.CRON_DISABLED === 'true') {
            return NextResponse.json({ message: 'Cron disabled' }, { status: 200 });
        }

        const sanitize = (v?: string | null) => (v ?? '').replace(/^"|"$/g, '').trim();
        const expectedAuth = `Bearer ${sanitize(cronSecret)}`;
        if (!cronSecret || sanitize(authHeader) !== expectedAuth) {
             return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = getSupabaseAdminClient();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 2. Fetch Active Subscriptions with Product Details
        const { data: subscriptions, error } = await supabase
            .from('medication_refill_subscriptions')
            .select(`
                id,
                phone,
                subscription_code,
                next_delivery_date,
                product:products(name)
            `)
            .eq('status', 'active');

        if (error) throw error;

        let remindersSent = 0;

        // 3. Process Reminders
        for (const sub of subscriptions || []) {
            if (!sub.phone || !sub.next_delivery_date) continue;

            const nextDate = new Date(sub.next_delivery_date);
            nextDate.setHours(0, 0, 0, 0);
            
            const diffTime = nextDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            const product = Array.isArray(sub.product) ? sub.product[0] : sub.product;
            const productName = product?.name || 'medication';

            let message = '';

            if (diffDays === 7) {
                message = `DiscreetKit: Your ${productName} refill is coming up in 1 week. Reply REFILL to our WhatsApp to confirm your delivery early. Code: ${sub.subscription_code}`;
            } else if (diffDays === 3) {
                message = `DiscreetKit: Refill Reminder! Your ${productName} is due in 3 days. To ensure timely delivery, reply REFILL to our WhatsApp now.`;
            } else if (diffDays === 1) {
                message = `DiscreetKit: URGENT: Your ${productName} refill is due TOMORROW. Please reply REFILL to our WhatsApp or visit our site to confirm.`;
            } else if (diffDays <= 0) {
                // Past due reminder
                message = `DiscreetKit ALERT: Your ${productName} refill is now DUE. To avoid missing a dose, reply REFILL to our WhatsApp immediately.`;
            }

            if (message) {
                // Avoid spamming if a reminder was sent recently? 
                // For MVP, we send on these specific days (7, 3, 1, and every day while past due).
                await sendSMS(sub.phone, message);
                remindersSent++;
                
                logger.info('Refill reminder sent', { 
                    context, 
                    data: { sub: sub.subscription_code, days: diffDays } 
                });
            }
        }

        return NextResponse.json({ success: true, remindersSent });

    } catch (error: any) {
        logger.error('Refill Cron Critical Error', { context, data: error.message });
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
