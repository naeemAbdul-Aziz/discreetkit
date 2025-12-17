import 'server-only';
import { getSupabaseAdminClient } from './supabase';

// SMS utility function - Internal use only
export async function sendSMS(phone: string, message: string): Promise<{ ok: boolean; recipient: string; status?: number; body?: any; error?: string }> {
    let arkeselApiKey = process.env.ARKESEL_API_KEY;
    // Trim accidental quotes from env var (some deploy UIs add quotes)
    if (typeof arkeselApiKey === 'string') arkeselApiKey = arkeselApiKey.replace(/^"|"$/g, '').trim();

    console.log('sendSMS called — phone:', phone, 'messagePreview:', message?.slice(0, 120));
    // console.log('Arkesel key present:', !!arkeselApiKey, 'key length:', (arkeselApiKey || '').length);

    if (!arkeselApiKey || arkeselApiKey.length === 0) {
        const msg = 'SMS not sent: Arkesel API key not configured';
        console.warn(msg);
        return { ok: false, recipient: phone, error: msg };
    }

    // Format phone number for Ghana (add 233 prefix if starts with 0)
    const recipient = phone.startsWith('0') ? `233${phone.substring(1)}` : phone;
    const senderId = process.env.ARKESEL_SENDER_ID || 'DiscreetKit';

    // console.log('Arkesel SMS - recipient:', recipient, 'sender:', senderId, 'messagePreview:', message.slice(0, 50) + '...');

    try {
        // Build URL with query parameters as per Arkesel documentation
        const url = new URL('https://sms.arkesel.com/sms/api');
        url.searchParams.append('action', 'send-sms');
        url.searchParams.append('api_key', arkeselApiKey);
        url.searchParams.append('to', recipient);
        url.searchParams.append('from', senderId);
        url.searchParams.append('sms', message);

        // Add use_case for Nigerian numbers (2349xxxxxxxx)
        if (recipient.startsWith('234')) {
            url.searchParams.append('use_case', 'promotional');
        }

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        let responseBody: any;
        try {
            responseBody = await response.json();
        } catch {
            responseBody = await response.text();
        }

        if (!response.ok) {
            console.warn('Arkesel SMS API Error:', { status: response.status, body: responseBody });
            return {
                ok: false,
                recipient,
                status: response.status,
                body: responseBody,
                error: `Arkesel API returned ${response.status}: ${JSON.stringify(responseBody)}`
            };
        }

        // Check if the response indicates success
        const isSuccess = responseBody?.code === 'ok' || responseBody?.message?.toLowerCase().includes('success');

        if (!isSuccess) {
            console.warn('Arkesel SMS failed based on response:', responseBody);
            return {
                ok: false,
                recipient,
                status: response.status,
                body: responseBody,
                error: `SMS failed: ${responseBody?.message || 'Unknown error'}`
            };
        }

        // console.log('Successfully sent SMS notification via Arkesel to:', recipient, 'response:', responseBody);
        return { ok: true, recipient, status: response.status, body: responseBody };

    } catch (smsError: any) {
        console.error('Failed to send SMS notification:', smsError);
        if (smsError.response) {
            console.error('SMS Error Response Body:', await smsError.response.text().catch(() => 'No body'));
        }
        return { ok: false, recipient, error: String(smsError) };
    }
}

// Send order confirmation SMS after successful payment
// Secure: verify order status is 'received' before sending
export async function sendOrderConfirmationSMS(orderId: string): Promise<void> {
    try {
        const supabaseAdmin = getSupabaseAdminClient();

        // Get order details
        const { data: order, error } = await supabaseAdmin
            .from('orders')
            .select('code, phone_masked, status')
            .eq('id', orderId)
            .single();

        if (error || !order) {
            console.error('Failed to fetch order for SMS confirmation:', error);
            return;
        }

        // SECURITY CHECK: Ensure order is actually paid (status 'received')
        if (order.status !== 'received') {
            console.warn(`Security Risk: Attempted to send confirmation SMS for unpaid order ${order.code} (status: ${order.status})`);
            return;
        }

        // Defensive check: ensure phone number exists
        if (!order.phone_masked || order.phone_masked.trim() === '') {
            console.warn('SMS not sent: phone_masked is missing for order', { orderId, code: order.code });
            return;
        }

        const trackingUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/track?code=${order.code}`;
        const confirmationMessage = `Payment for order ${order.code} confirmed. We're now preparing your package for discreet delivery. Track: ${trackingUrl}`;

        const result = await sendSMS(order.phone_masked, confirmationMessage);

        if (!result.ok) {
            console.error('SMS sending failed for order confirmation:', { orderId, code: order.code, error: result.error });
        } else {
            console.log('Order confirmation SMS sent successfully:', { orderId, code: order.code, recipient: result.recipient });
        }
    } catch (error) {
        console.error('Error sending order confirmation SMS:', error);
    }
}

// Send shipping notification SMS
export async function sendShippingNotificationSMS(orderId: string): Promise<void> {
    try {
        const supabaseAdmin = getSupabaseAdminClient();

        const { data: order, error } = await supabaseAdmin
            .from('orders')
            .select('code, phone_masked, courier_name, courier_phone')
            .eq('id', orderId)
            .single();

        if (error || !order) {
            console.error('Failed to fetch order for shipping SMS:', error);
            return;
        }

        const trackingUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/track?code=${order.code}`;
        let shippingMessage = `Your order ${order.code} has been shipped.`;

        if (order.courier_name) {
            shippingMessage += ` Rider: ${order.courier_name}`;
            if (order.courier_phone) shippingMessage += ` (${order.courier_phone})`;
            shippingMessage += '.';
        }

        shippingMessage += ` Track: ${trackingUrl}`;

        await sendSMS(order.phone_masked, shippingMessage);
    } catch (error) {
        console.error('Error sending shipping notification SMS:', error);
    }
}

// Send delivery notification SMS
export async function sendDeliveryNotificationSMS(orderId: string): Promise<void> {
    try {
        const supabaseAdmin = getSupabaseAdminClient();

        const { data: order, error } = await supabaseAdmin
            .from('orders')
            .select('code, phone_masked')
            .eq('id', orderId)
            .single();

        if (error || !order) {
            console.error('Failed to fetch order for delivery SMS:', error);
            return;
        }

        const deliveredMessage = `Your order ${order.code} has been delivered successfully. Thank you for choosing DiscreetKit for your health needs. Need support? We're here to help.`;

        await sendSMS(order.phone_masked, deliveredMessage);
    } catch (error) {
        console.error('Error sending delivery notification SMS:', error);
    }
}
