import { NextRequest, NextResponse } from 'next/server';
import { TwilioWebhookSchema } from '@/lib/whatsapp/types';
import { handleIncomingMessage } from '@/lib/whatsapp/manager';

export async function POST(req: NextRequest) {
    const traceId = Math.random().toString(36).substring(7);
    console.log(`[WhatsApp Webhook][${traceId}] Incoming POST request detected`);

    try {
        // 1. Parse Form Data
        let payload: Record<string, any>;
        try {
            const formData = await req.formData();
            payload = Object.fromEntries(formData.entries());
            console.log(`[WhatsApp Webhook][${traceId}] Payload Parsed:`, { 
                from: payload.From, 
                body: payload.Body, 
                waId: payload.WaId 
            });
        } catch (e) {
            console.error(`[WhatsApp Webhook][${traceId}] Failed to parse Form Data:`, e);
            return new NextResponse('<Response></Response>', { 
                headers: { 'Content-Type': 'text/xml' }, status: 200 
            });
        }

        // 2. Validate Payload with Zod (Gently)
        const result = TwilioWebhookSchema.safeParse(payload);

        if (!result.success) {
            console.error(`[WhatsApp Webhook][${traceId}] Zod Validation Failed:`, result.error.format());
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
            console.log(`[WhatsApp Webhook][${traceId}] Routing to Manager...`);
            await handleIncomingMessage(From, finalBody, ProfileName, location);
            console.log(`[WhatsApp Webhook][${traceId}] Logic processed successfully.`);
        } catch (logicError: any) {
            console.error(`[WhatsApp Webhook][${traceId}] Logic Error:`, logicError);
            
            // EMERGENCY TALKBACK: Try to inform the user
            try {
                const { sendMessage } = await import('@/lib/whatsapp/service');
                await sendMessage(From, "⚠️ *Assistant Error*: Our system encountered a temporary issue. Please try again in 5 minutes. (Ref: " + traceId + ")");
            } catch (notifyError) {
                console.error(`[WhatsApp Webhook][${traceId}] Failed to send error notification:`, notifyError);
            }
        }

        // 4. Return TwiML (Empty Response to stop Twilio from doing anything else)
        return new NextResponse('<Response></Response>', {
            headers: { 'Content-Type': 'text/xml' },
            status: 200,
        });

    } catch (error) {
        console.error(`[WhatsApp Webhook][${traceId}] Critical Endpoint Error:`, error);
        return new NextResponse('<Response></Response>', {
            headers: { 'Content-Type': 'text/xml' },
            status: 200,
        });
    }
}
