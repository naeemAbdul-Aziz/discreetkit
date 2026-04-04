import { NextRequest, NextResponse } from 'next/server';
import { TwilioWebhookSchema } from '@/lib/whatsapp/types';
import { handleIncomingMessage } from '@/lib/whatsapp/manager';

export async function POST(req: NextRequest) {
    try {
        // 1. Parse Form Data with error handling for malformed payloads
        let payload: Record<string, any>;
        try {
            const formData = await req.formData();
            payload = Object.fromEntries(formData.entries());
        } catch (e) {
            console.error('Failed to parse WhatsApp Form Data:', e);
            return new NextResponse('<Response></Response>', { 
                headers: { 'Content-Type': 'text/xml' }, status: 200 
            });
        }

        // 2. Validate Payload with Zod (Gently)
        const result = TwilioWebhookSchema.safeParse(payload);

        if (!result.success) {
            console.error('Invalid Twilio Webhook Payload:', result.error.format());
            // We still return 200 to prevent Twilio retry loops, but log the error
            return new NextResponse('<Response></Response>', {
                headers: { 'Content-Type': 'text/xml' },
                status: 200,
            });
        }

        const { From, Body, ProfileName, Latitude, Longitude, ButtonPayload, ListId } = result.data;
        
        // Handle Interactive Button/List IDs if present (override Body)
        const finalBody = ButtonPayload || ListId || Body;

        let location = undefined;
        if (Latitude && Longitude) {
            location = { lat: parseFloat(Latitude), long: parseFloat(Longitude) };
        }

        // 3. Process Message (Async)
        // We catch errors inside to prevent the whole route from crashing
        try {
            await handleIncomingMessage(From, finalBody, ProfileName, location);
        } catch (logicError) {
            console.error('WhatsApp Logic Error:', logicError);
        }

        // 4. Return TwiML (Empty Response to stop Twilio from doing anything else)
        return new NextResponse('<Response></Response>', {
            headers: { 'Content-Type': 'text/xml' },
            status: 200,
        });

    } catch (error) {
        console.error('Critical WhatsApp Webhook Error:', error);
        // Always return 200 TwiML to keep the pipe open for Twilio
        return new NextResponse('<Response></Response>', {
            headers: { 'Content-Type': 'text/xml' },
            status: 200,
        });
    }
}
