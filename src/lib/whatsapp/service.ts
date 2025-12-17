import { TwilioWebhookSchema, type InteractiveButton, type InteractiveListSection } from './types';

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER; // e.g., "whatsapp:+14155238886"

/**
 * Helper to validate environment variables.
 */
function validateEnv() {
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
        throw new Error('Twilio credentials are not configured.');
    }
}

/**
 * Base function to send a message via Twilio API.
 * Uses strict fetch implementation to avoid heavy SDK dependency.
 */
async function sendToTwilio(payload: URLSearchParams) {
    validateEnv();

    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: payload,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Twilio API Error:', errorText);
            throw new Error(`Twilio API request failed: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to send WhatsApp message:', error);
        throw error;
    }
}

/**
 * Sends a basic text message.
 */
export async function sendMessage(to: string, body: string) {
    const payload = new URLSearchParams();
    payload.append('From', TWILIO_PHONE_NUMBER!);
    payload.append('To', to);
    payload.append('Body', body);

    return sendToTwilio(payload);
}

/**
 * Sends an interactive button message (Reply Buttons).
 */
export async function sendInteractiveButtons(to: string, body: string, buttons: InteractiveButton[]) {
    // Twilio uses Content API or strict formatting for buttons.
    // For standard WhatsApp reply buttons via Twilio Programmable Messaging, 
    // we strictly don't have a simple helper unless we use the Content API or legacy button templates.
    // However, for simplicity and high compatibility, we will assume standard text for now 
    // OR simulate buttons using lists if buttons are complex.
    // BUT, to be "Pro", we should try to use the raw capabilities if configured.
    // 
    // NOTE: Plain SMS/WhatsApp API in Twilio usually requires pre-approved templates for business-initiated.
    // For session messages (user-initiated), free-form text is safer.
    // Simulating buttons with a numbered list is the safest fallback without Templates.

    // FALLBACK STRATEGY: Numbered List (100% reliable)
    const buttonText = buttons.map((b, i) => `${i + 1}. ${b.reply.title}`).join('\n');
    const fullBody = `${body}\n\n${buttonText}\n\n(Reply with a number)`;

    return sendMessage(to, fullBody);
}

/**
 * Sends an interactive list message.
 * Since native Lists require Content API or Templates, we'll use a text fallback for MVP 
 * unless we integrate Twilio Content API (which is complex to set up purely via code).
 */
export async function sendInteractiveList(to: string, header: string, body: string, sections: InteractiveListSection[]) {
    let listText = `*${header}*\n${body}\n`;

    sections.forEach(section => {
        listText += `\n*${section.title}*\n`;
        section.rows.forEach((row, i) => {
            listText += `- ${row.title}\n`;
        });
    });

    return sendMessage(to, listText);
}
