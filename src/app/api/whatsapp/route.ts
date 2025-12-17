import { NextRequest, NextResponse } from 'next/server';
import { TwilioWebhookSchema } from '@/lib/whatsapp/types';
import { handleIncomingMessage } from '@/lib/whatsapp/manager';

export async function POST(req: NextRequest) {
    try {
        // 1. Parse Form Data
        const formData = await req.formData();
        const payload = Object.fromEntries(formData.entries());

        // 2. Validate Payload with Zod
        const result = TwilioWebhookSchema.safeParse(payload);

        if (!result.success) {
            console.error('Invalid Twilio Webhook Payload:', result.error);
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        const { From, Body, ProfileName } = result.data;

        // 3. Process Message (Async)
        // We await here to ensure we don't return 200 before logic runs, 
        // mainly to catch errors. In high-scale, we might queue this.
        await handleIncomingMessage(From, Body, ProfileName);

        // 4. Return TwiML (Empty Response to stop Twilio from doing anything else)
        // Returning simple XML
        return new NextResponse('<Response></Response>', {
            headers: { 'Content-Type': 'text/xml' },
            status: 200,
        });

    } catch (error) {
        console.error('WhatsApp Webhook Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
