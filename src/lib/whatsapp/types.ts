import { z } from 'zod';
import type { Order } from '../data';

// --- Twilio Incoming Webhook Schema (Zod) ---
export const TwilioWebhookSchema = z.object({
    SmsMessageSid: z.string(),
    NumMedia: z.string(),
    ProfileName: z.string().optional(),
    SmsSid: z.string(),
    WaId: z.string(), // WhatsApp ID (e.g., 233555555555)
    SmsStatus: z.string(),
    Body: z.string(),
    To: z.string(),
    NumSegments: z.string(),
    ReferralNumMedia: z.string().optional(),
    MessageSid: z.string(),
    AccountSid: z.string(),
    From: z.string(), // e.g., "whatsapp:+233555555555"
    ApiVersion: z.string(),
    // For interactive messages (buttons/lists)
    ButtonPayload: z.string().optional(),
    ListId: z.string().optional(),
});

export type TwilioWebhookPayload = z.infer<typeof TwilioWebhookSchema>;

// --- Internal Conversation States ---
export type ConversationState =
    | 'IDLE'
    | 'AWAITING_TRIAGE_RESPONSE'
    | 'BROWSING_CATALOG'
    | 'VIEWING_PRODUCT'
    | 'AWAITING_PAYMENT'
    | 'PARTNER_CARE_MENU'
    | 'PARTNER_CARE_VERIFICATION';

// --- Session Data Stored in Redis ---
export interface SessionData {
    state: ConversationState;
    userId?: string;
    name?: string;
    cart: {
        items: string[]; // Product IDs
        total: number;
    };
    lastInteraction: number; // Timestamp
    triage?: {
        category?: string;
        step?: number;
    };
    tempOrderCode?: string; // For payment tracking
}

// --- Message Types for Service Layer ---
export interface WhatsAppMessage {
    to: string;
    body: string;
    mediaUrl?: string[];
}

export interface InteractiveButton {
    type: 'reply';
    reply: {
        id: string;
        title: string;
    };
}

export interface InteractiveListRow {
    id: string;
    title: string;
    description?: string;
}

export interface InteractiveListSection {
    title: string;
    rows: InteractiveListRow[];
}
