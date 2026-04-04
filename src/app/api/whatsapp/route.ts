import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { TwilioWebhookSchema } from '@/lib/whatsapp/types';
import { handleIncomingMessage } from '@/lib/whatsapp/manager';

export async function POST(req: NextRequest) {
    const traceId = Math.random().toString(36).substring(7);
    const context = 'WhatsApp-Webhook';
    
    logger.info('Incoming request', { context, traceId });

    try {
        // 1. Parse Form Data
        let payload: Record<string, any>;
        try {
            const formData = await req.formData();
            payload = Object.fromEntries(formData.entries());
            logger.debug('Payload parsed', { context, traceId, data: { from: payload.From, body: payload.Body } });
        } catch (e) {
            logger.error('Failed to parse Form Data', { context, traceId, data: e });
            return new NextResponse('<Response></Response>', { 
                headers: { 'Content-Type': 'text/xml' }, status: 200 
            });
        }

        // 2. Validate Payload with Zod (Gently)
        const result = TwilioWebhookSchema.safeParse(payload);

        if (!result.success) {
            logger.error('Zod validation failed', { context, traceId, data: result.error.format() });
            // We still return 200 to prevent Twilio retry loops, but log the error
            return new NextResponse('<Response></Response>', {
                headers: { 'Content-Type': 'text/xml' },
                status: 200,
            });
        }

        const { From, Body, ProfileName, Latitude, Longitude, ButtonPayload, ListId } = result.data;
        const finalBody = ButtonPayload || ListId || Body;

        let location = undefined;
        if (Latitude && Longitude) {
            location = { lat: parseFloat(Latitude), long: parseFloat(Longitude) };
        }

        // 3. Process Message (Async)
        try {
            logger.info('Routing to manager', { context, traceId, data: { from: From, body: finalBody } });
            await handleIncomingMessage(From, finalBody, ProfileName, location);
            logger.info('Logic processed successfully', { context, traceId });
        } catch (logicError: any) {
            logger.error('Logic error', { context, traceId, data: logicError });
            
            // EMERGENCY TALKBACK: Try to inform the user
            try {
                const { sendMessage } = await import('@/lib/whatsapp/service');
                await sendMessage(From, "⚠️ *Assistant Error*: Our system encountered a temporary issue. Please try again in 5 minutes. (Ref: " + traceId + ")");
            } catch (notifyError) {
                logger.error('Failed to send error notification', { context, traceId, data: notifyError });
            }
        }

        // 4. Return TwiML (Empty Response to stop Twilio from doing anything else)
        return new NextResponse('<Response></Response>', {
            headers: { 'Content-Type': 'text/xml' },
            status: 200,
        });

    } catch (error) {
        logger.error('Critical endpoint error', { context, traceId, data: error });
        return new NextResponse('<Response></Response>', {
            headers: { 'Content-Type': 'text/xml' },
            status: 200,
        });
    }
}
