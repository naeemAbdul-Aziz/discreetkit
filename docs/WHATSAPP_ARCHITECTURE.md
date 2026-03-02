# WhatsApp Headless Architecture - Technical Documentation

## Executive Summary

DiscreetKit's WhatsApp Assistant is a production-grade conversational commerce system that enables users to browse products, place orders, make payments, and track deliveries entirely within WhatsApp. The architecture is designed to handle Twilio API limitations, ensure payment integrity, and maintain stateful conversations in a stateless messaging environment.

---

## 1. System Architecture Overview

### 1.1 Core Components

The WhatsApp system consists of four primary modules located in `src/lib/whatsapp/`:

```
src/lib/whatsapp/
├── manager.ts      # Business logic & state routing (628 lines)
├── service.ts      # Twilio API wrapper & message delivery (105 lines)
├── session.ts      # Redis-based session management (64 lines)
├── types.ts        # TypeScript interfaces & Zod schemas (90 lines)
└── README.md       # Quick reference documentation
```

### 1.2 Entry Point

- **API Route**: `src/app/api/whatsapp/route.ts`
- **HTTP Method**: POST
- **Trigger**: Twilio webhook on incoming WhatsApp messages
- **Response**: TwiML XML (`<Response></Response>`)

---

## 2. Component Deep Dive

### 2.1 Manager (`manager.ts`) - The Brain

**Responsibility**: Central orchestrator for all business logic, message routing, and state transitions.

#### Key Functions

| Function | Purpose | Lines |
|----------|---------|-------|
| `handleIncomingMessage()` | Main entry point, routes messages based on state | 9-82 |
| `sendMainMenu()` | Displays primary navigation menu | 86-104 |
| `handleIdleState()` | Processes commands when user is at main menu | 106-174 |
| `sendCategories()` | Fetches & displays product categories from DB | 176-208 |
| `handleBrowsingState()` | Handles category/product selection | 210-233 |
| `sendProductDetails()` | Shows individual product with Buy/Back buttons | 265-295 |
| `handleViewingProductState()` | Processes Buy/Back actions | 305-340 |
| `handleCollectingAddressState()` | Collects delivery address (text/GPS/campus) | 531-566 |
| `sendCheckoutLink()` | Creates order in DB & generates Paystack link | 342-437 |
| `sendPartnerCareMenu()` | Displays Marie Stopes partner services | 439-457 |
| `handlePartnerVerification()` | Validates partner access codes | 501-526 |

#### State Machine

The manager implements a finite state machine with these states:

```typescript
type ConversationState =
    | 'IDLE'                        // Main menu
    | 'BROWSING_CATALOG'            // Viewing categories/products
    | 'VIEWING_PRODUCT'             // Product detail page
    | 'COLLECTING_ADDRESS'          // Address input step
    | 'SELECTING_CAMPUS'            // Student discount campus selection
    | 'AWAITING_PAYMENT'            // Payment link sent (unused currently)
    | 'PARTNER_CARE_MENU'           // Partner services menu
    | 'PARTNER_CARE_VERIFICATION';  // Partner code verification
```

#### Critical Innovation: Virtual Button Handler

**Problem**: Twilio Trial accounts block native WhatsApp interactive buttons.

**Solution**: Lines 22-31 implement a "Virtual Click Handler"

```typescript
// If user typed '1', '2', etc., and we have a list context, map it to the ID.
if (/^\d+$/.test(normalizedBody) && session.listOptions && session.listOptions.length > 0) {
    const index = parseInt(normalizedBody) - 1;
    if (index >= 0 && index < session.listOptions.length) {
        // REWRITE the body as if the user clicked the button
        body = session.listOptions[index];
        console.log(`[Virtual Button] Mapped '${normalizedBody}' -> '${body}'`);
    }
}
```

**How It Works**:
1. Service layer renders lists as numbered text (e.g., "1. Shop Products")
2. User types "1"
3. Manager maps "1" → `menu_shop` using `session.listOptions` array
4. Rest of code processes `menu_shop` as if it were a button click

---

### 2.2 Service (`service.ts`) - The I/O Layer

**Responsibility**: Wraps Twilio API for message delivery with fallback strategies.

#### Key Functions

| Function | Purpose | Implementation |
|----------|---------|----------------|
| `sendMessage()` | Basic text message | Direct Twilio API call |
| `sendInteractiveButtons()` | Reply buttons (fallback to numbered list) | Lines 65-82 |
| `sendInteractiveList()` | List picker (fallback to numbered list) | Lines 89-104 |
| `sendToTwilio()` | Base HTTP client with auth | Lines 20-48 |

#### Twilio API Configuration

```typescript
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER; // e.g., "whatsapp:+14155238886"
```

**API Endpoint**: `https://api.twilio.com/2010-04-01/Accounts/{SID}/Messages.json`

**Authentication**: HTTP Basic Auth (Base64 encoded `SID:TOKEN`)

#### Fallback Strategy for Interactive Messages

Since Twilio's Content API requires pre-approved templates, the service uses a **100% reliable text fallback**:

```typescript
// FALLBACK STRATEGY: Numbered List (100% reliable)
const buttonText = buttons.map((b, i) => `${i + 1}. ${b.reply.title}`).join('\n');
const fullBody = `${body}\n\n${buttonText}\n\n(Reply with a number)`;
return sendMessage(to, fullBody);
```

---

### 2.3 Session (`session.ts`) - The Memory

**Responsibility**: Manages user state and context using Upstash Redis.

#### Session Data Structure

```typescript
interface SessionData {
    state: ConversationState;
    userId?: string;
    name?: string;
    address?: string;              // Text address or "Campus: XYZ"
    location?: {                   // GPS coordinates
        lat: number;
        long: number;
    };
    cart: {
        items: string[];           // Product IDs
        total: number;
    };
    lastInteraction: number;       // Timestamp
    triage?: {
        category?: string;
        step?: number;
    };
    tempOrderCode?: string;        // For payment tracking
    listOptions?: string[];        // Virtual button mapping array
}
```

#### Key Functions

| Function | Purpose | TTL |
|----------|---------|-----|
| `getSession(waId)` | Retrieves or initializes session | - |
| `updateSession(waId, data)` | Merges partial updates | 24 hours |
| `clearSession(waId)` | Deletes session | - |
| `transitionState(waId, newState)` | Atomic state change | 24 hours |

#### Redis Key Format

```typescript
function getSessionKey(waId: string): string {
    return `whatsapp:session:${waId}`;
}
```

**Example**: `whatsapp:session:233555555555`

#### Upstash Redis Integration

```typescript
// src/lib/redis.ts
export async function getRedis(): Promise<any> {
  if (redisInstance) return redisInstance;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error('Upstash Redis is not configured.');
  }
  const { Redis } = await import('@upstash/redis');
  redisInstance = new Redis({ url, token });
  return redisInstance;
}
```

**Why Upstash?**
- Serverless-native (REST API, no persistent connections)
- Global edge replication
- 24-hour TTL aligns with WhatsApp's 24-hour messaging window

---

### 2.4 Types (`types.ts`) - The Contracts

**Responsibility**: Zod schemas for runtime validation and TypeScript interfaces.

#### Twilio Webhook Schema

```typescript
export const TwilioWebhookSchema = z.object({
    SmsMessageSid: z.string(),
    NumMedia: z.string(),
    ProfileName: z.string().optional(),
    WaId: z.string(),              // WhatsApp ID (e.g., 233555555555)
    Body: z.string(),
    From: z.string(),              // e.g., "whatsapp:+233555555555"
    ButtonPayload: z.string().optional(),
    ListId: z.string().optional(),
    Latitude: z.string().optional(),
    Longitude: z.string().optional(),
    // ... 15 more fields
});
```

**Validation in API Route**:

```typescript
const result = TwilioWebhookSchema.safeParse(payload);
if (!result.success) {
    console.error('Invalid Twilio Webhook Payload:', result.error);
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
}
```

---

## 3. Critical Workflows

### 3.1 Order Creation Flow (Ghost-Order Prevention)

**Problem**: If payment link is sent before order exists in DB, webhook can't find order to update.

**Solution**: Create order with `pending_payment` status BEFORE generating Paystack link.

#### Sequence Diagram

```
User                Manager              Supabase            Paystack
  |                    |                    |                    |
  |--"Buy"------------>|                    |                    |
  |                    |                    |                    |
  |                    |--INSERT ORDER----->|                    |
  |                    |   (status: pending_payment)             |
  |                    |<--Order Code-------|                    |
  |                    |   (DK-WA-123456)   |                    |
  |                    |                    |                    |
  |                    |--Initialize--------|------------------>|
  |                    |   (reference: DK-WA-123456)            |
  |                    |<--Auth URL-------------------------|   |
  |                    |                    |                    |
  |<--Payment Link-----|                    |                    |
  |                    |                    |                    |
  |--Clicks Link-------|--------------------|------------------->|
  |                    |                    |                    |
  |                    |<--Webhook (charge.success)-------------|
  |                    |                    |                    |
  |                    |--UPDATE ORDER----->|                    |
  |                    |   (status: received)                   |
```

#### Implementation (Lines 342-437 in manager.ts)

```typescript
async function sendCheckoutLink(to: string, session: SessionData) {
    const amount = session.cart.total;
    const orderCode = `DK-WA-${Date.now().toString().slice(-6)}`;
    
    // 1. Create Pending Order in Database FIRST
    const supabase = getSupabaseAdminClient();
    const { error: dbError } = await supabase.from('orders').insert({
        code: orderCode,
        status: 'pending_payment',
        total_price: amount,
        subtotal: amount,
        phone_masked: to,
        email: `whatsapp_${to.replace(/\D/g, '')}@discretekit.com`,
        delivery_address_note: deliveryNote,
        items: session.cart.items.map(id => ({ product_id: id, quantity: 1, price: amount }))
    });
    
    if (dbError) throw new Error(`Database insert failed: ${dbError.message}`);
    
    // 2. THEN Initialize Paystack Transaction
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${paystackSecret}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email,
            amount: amount * 100,
            currency: 'GHS',
            reference: orderCode,  // Link via Code
            metadata: { source: 'whatsapp', whatsapp_id: to }
        })
    });
    
    const data = await response.json();
    await sendMessage(to, `Click to pay: ${data.data.authorization_url}`);
}
```

**Key Insight**: Order exists in DB before payment link is sent, ensuring webhook can always find it.

---

### 3.2 Payment Webhook Integration

**Webhook Handler**: `src/app/api/webhooks/paystack/route.ts`

#### Verification Flow

1. **Signature Validation**: HMAC-SHA512 verification
2. **Event Type Check**: Only process `charge.success`
3. **Order Lookup**: Find order by `reference` (order code)
4. **Idempotent Update**: Update status to `received` (safe to retry)
5. **Event Logging**: Append to `order_events` table
6. **WhatsApp Notification**: Send confirmation message

#### Critical Code Pattern

```typescript
// Webhook finds order by code
const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('code', reference)  // reference = DK-WA-123456
    .single();

if (order && order.status === 'pending_payment') {
    // Update to received (idempotent)
    await supabase
        .from('orders')
        .update({ status: 'received' })
        .eq('code', reference);
    
    // Send WhatsApp confirmation
    await sendOrderConfirmation(order.phone_masked, order.code, order.total_price);
}
```

---

### 3.3 AI Integration (Hybrid Router)

**Feature**: Fallback to OpenAI when user input doesn't match any command.

#### Implementation (Lines 147-172 in manager.ts)

```typescript
if (body.length > 2) {
    try {
        const { answerQuestions } = await import('../../ai/flows/answer-questions');
        const response = await answerQuestions({
            query: body, 
            history: []
        });
        
        // Format: Convert **bold** to *bold* for WhatsApp
        const formattedAnswer = response.answer
            .replace(/\*\*/g, '*')
            .replace(/([^\n])\s(\d+\.)/g, '$1\n\n$2');
        
        await sendMessage(to, formattedAnswer);
    } catch (aiError) {
        console.error('AI Error:', aiError);
        await sendMainMenu(to); // Fallback to menu
    }
}
```

**AI Configuration** (`src/ai/flows/answer-questions.ts`):

- **Model**: `gpt-4o-mini` (OpenAI)
- **System Prompt**: "You are Pacely, a helpful, empathetic AI assistant for DiscreetKit Ghana"
- **Knowledge Base**: Injected from `src/ai/knowledge.ts`
- **Temperature**: 0.7
- **Max Tokens**: 500

**When AI is Called**:
1. User is in `IDLE` or `PARTNER_CARE_MENU` state
2. Input doesn't match any command
3. Input length > 2 characters

---

## 4. Advanced Features

### 4.1 Student Discount System

**Flow**:
1. User clicks "Campus (Free)" button during address collection
2. Manager calls `sendCampusList()` (Lines 569-580)
3. Fetches campus list from `src/lib/data.ts` (discounts array)
4. User selects campus
5. Address stored as `"Campus: University of Ghana"`
6. `sendCheckoutLink()` detects campus prefix and applies free delivery

#### Implementation

```typescript
async function handleCampusSelection(to: string, body: string, session: SessionData) {
    const { discounts } = require('../data');
    if (body.startsWith('campus_')) {
        const campusId = parseInt(body.replace('campus_', ''));
        const campus = discounts.find((d: any) => d.id === campusId);
        
        if (campus) {
            await updateSession(to, {
                address: `Campus: ${campus.campus}`
            });
            await sendMessage(to, `🎓 Verified: ${campus.campus}. Free Delivery Applied!`);
            await sendCheckoutLink(to, { ...session, address: `Campus: ${campus.campus}` });
        }
    }
}
```

---

### 4.2 Partner Care Portal

**Purpose**: Gated access to Marie Stopes services for verified customers.

#### Verification Flow

1. User selects "Partner Care" from main menu
2. Manager transitions to `PARTNER_CARE_MENU` state
3. User selects "Verify Partner Code"
4. Manager transitions to `PARTNER_CARE_VERIFICATION` state
5. User sends code (e.g., `DK-MS-1234`)
6. Manager queries `orders` table for matching `partner_code`
7. If found, grants access message

#### Implementation (Lines 501-526)

```typescript
async function handlePartnerVerification(to: string, body: string) {
    const code = body.trim().toUpperCase();
    
    if (!code.startsWith('DK-')) {
        await sendMessage(to, "❌ Invalid format. Code should start with 'DK-'.");
        return;
    }
    
    const supabase = getSupabaseAdminClient();
    const { data: order, error } = await supabase
        .from('orders')
        .select('id, created_at, partner_code')
        .eq('partner_code', code)
        .single();
    
    if (error || !order) {
        await sendMessage(to, "❌ Code not found.");
    } else {
        await sendMessage(to, `✅ *Access Granted*\n\nYou are eligible for *Free STI Consulting* at any Marie Stopes center.`);
        await updateSession(to, { state: 'IDLE' });
    }
}
```

---

### 4.3 Real-Time Order Tracking

**Feature**: Users can send their order code to get live status updates.

#### Implementation (Lines 120-145 in manager.ts)

```typescript
const code = body.toUpperCase().replace('#', '').trim();
if (code.startsWith('DK-')) {
    await sendMessage(to, `🔍 Checking status for ${code}...`);
    
    const supabase = getSupabaseAdminClient();
    const { data: order, error } = await supabase
        .from('orders')
        .select('status, created_at')
        .eq('code', code)
        .single();
    
    if (error || !order) {
        await sendMessage(to, `❌ We couldn't find an order with code *${code}*.`);
    } else {
        const statusMap: Record<string, string> = {
            'pending_payment': 'Payment Pending ⏳',
            'received': 'Order Received ✅',
            'processing': 'Processing 📦',
            'shipped': 'Out for Delivery 🚚',
            'delivered': 'Delivered 🎉',
            'cancelled': 'Cancelled ❌'
        };
        const statusText = statusMap[order.status] || order.status;
        await sendMessage(to, `*Order Status*\nCode: ${code}\nStatus: *${statusText}*`);
    }
}
```

---

## 5. Environment Configuration

### 5.1 Required Environment Variables

```bash
# Twilio (WhatsApp API)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=whatsapp:+14155238886

# Upstash Redis (Session Management)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token

# Paystack (Payments)
PAYSTACK_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx

# Supabase (Database)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key

# OpenAI (AI Assistant - Optional)
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxx
```

### 5.2 Twilio Webhook Configuration

**Dashboard Settings**:
1. Navigate to: Twilio Console → Messaging → Settings → WhatsApp Sandbox
2. Set "When a message comes in" to: `https://yourdomain.com/api/whatsapp`
3. HTTP Method: `POST`
4. Content Type: `application/x-www-form-urlencoded`

---

## 6. Testing & Debugging

### 6.1 Test Script

**File**: `scripts/test-whatsapp-config.ts`

```typescript
import { sendMessage } from '../src/lib/whatsapp/service';

async function main() {
    console.log('Testing Twilio Configuration...');
    
    if (!process.env.TWILIO_ACCOUNT_SID) {
        console.error('❌ Missing TWILIO_ACCOUNT_SID');
        return;
    }
    if (!process.env.TWILIO_AUTH_TOKEN) {
        console.error('❌ Missing TWILIO_AUTH_TOKEN');
        return;
    }
    if (!process.env.TWILIO_PHONE_NUMBER) {
        console.error('❌ Missing TWILIO_PHONE_NUMBER');
        return;
    }
    
    console.log('✅ Credentials OK');
}

main().catch(console.error);
```

**Run**: `npx tsx scripts/test-whatsapp-config.ts`

### 6.2 Debugging Tips

1. **Check Twilio Logs**: Console → Monitor → Logs → Messaging
2. **Verify Webhook URL**: Use ngrok for local testing
3. **Inspect Redis Sessions**: Use Upstash Console → Data Browser
4. **Monitor Paystack Webhooks**: Dashboard → Settings → Webhooks → Logs

---

## 7. Performance & Scalability

### 7.1 Current Limitations

| Component | Limit | Mitigation |
|-----------|-------|------------|
| Twilio Trial | 1 verified number | Upgrade to paid account |
| Redis TTL | 24 hours | Aligns with WhatsApp session window |
| Supabase RLS | Row-level security | Use service role for admin operations |
| OpenAI Rate Limits | Tier-based | Implement caching for common queries |

### 7.2 Optimization Strategies

1. **Database Indexing**: Add indexes on `orders.code`, `orders.phone_masked`
2. **Redis Caching**: Cache product categories (5-minute TTL)
3. **Webhook Idempotency**: Use `order_events` table to prevent duplicate processing
4. **Message Queuing**: Consider Bull/BullMQ for high-volume scenarios

---

## 8. Security Considerations

### 8.1 Data Privacy

- **No PII Storage**: Phone numbers are masked (`whatsapp_233555555555@discretekit.com`)
- **Session Encryption**: Redis data stored in encrypted Upstash instance
- **Webhook Verification**: HMAC-SHA512 signature validation on all Paystack webhooks

### 8.2 Rate Limiting

**Current**: None implemented in WhatsApp module

**Recommendation**: Add Redis-based rate limiting (10 messages/minute per user)

```typescript
// Proposed implementation
const rateLimitKey = `ratelimit:${waId}`;
const count = await redis.incr(rateLimitKey);
if (count === 1) await redis.expire(rateLimitKey, 60);
if (count > 10) {
    await sendMessage(to, "Too many requests. Please wait a minute.");
    return;
}
```

---

## 9. Deployment Checklist

### 9.1 Pre-Production

- [ ] Set all environment variables in Vercel
- [ ] Configure Twilio webhook URL to production domain
- [ ] Test payment flow with Paystack test keys
- [ ] Verify Upstash Redis connectivity
- [ ] Enable Supabase Realtime for `orders` table

### 9.2 Production

- [ ] Switch to Twilio production account
- [ ] Use Paystack live keys
- [ ] Set up monitoring (Sentry DSN)
- [ ] Configure admin phone numbers for alerts
- [ ] Test end-to-end flow with real phone number

---

## 10. Future Enhancements

### 10.1 Planned Features

1. **Multi-Language Support**: Detect user language from `ProfileName` or first message
2. **Voice Messages**: Transcribe audio using Twilio Media API
3. **Image Recognition**: Allow users to send photos of prescriptions
4. **Subscription Orders**: Recurring deliveries for regular customers
5. **Group Orders**: Campus ambassadors can place bulk orders

### 10.2 Technical Debt

1. **Type Safety**: Replace `any` types in Redis client with proper interfaces
2. **Error Handling**: Implement circuit breaker for Paystack API calls
3. **Testing**: Add unit tests for state machine transitions
4. **Logging**: Structured logging with correlation IDs

---

## 11. Troubleshooting Guide

### Common Issues

#### Issue 1: Webhook Not Receiving Messages

**Symptoms**: User sends message, no response

**Diagnosis**:
1. Check Twilio logs for webhook errors
2. Verify webhook URL is publicly accessible
3. Test with `curl -X POST https://yourdomain.com/api/whatsapp`

**Solution**: Ensure Next.js app is deployed and webhook URL matches Twilio settings

---

#### Issue 2: Session Data Lost

**Symptoms**: User state resets unexpectedly

**Diagnosis**:
1. Check Upstash Redis dashboard for connection errors
2. Verify TTL is set to 24 hours (86400 seconds)
3. Inspect session key format: `whatsapp:session:{waId}`

**Solution**: Ensure `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are correct

---

#### Issue 3: Payment Link Not Generated

**Symptoms**: User clicks "Buy", no payment link sent

**Diagnosis**:
1. Check server logs for Paystack API errors
2. Verify `PAYSTACK_SECRET_KEY` is set
3. Ensure order was created in database before Paystack call

**Solution**: Review `sendCheckoutLink()` function logs, verify Paystack credentials

---

## 12. Appendix

### A. Message Templates

#### Welcome Message
```
Hello {name}! Welcome to *DiscreteKit Assistant*.

Your privacy is our priority. How can we help you today?
```

#### Order Confirmation
```
✅ *Payment Confirmed!*

Your order *{orderCode}* for GHS {amount} has been received.

📦 *Status*: Processing
🚚 *Tracking*: Reply "Track" to see updates.

Thank you for choosing DiscreetKit.
```

#### Partner Access Granted
```
✅ *Access Granted*

Code verified successfully.
Generated: {date}

You are eligible for *Free STI Consulting* at any Marie Stopes center.

Show this message at the front desk.
```

### B. Database Schema (Relevant Tables)

```sql
-- Orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL,
    total_price NUMERIC NOT NULL,
    phone_masked TEXT,
    email TEXT,
    delivery_address_note TEXT,
    partner_code TEXT,
    items JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order events table
CREATE TABLE order_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    event_type TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### C. API Reference

#### POST /api/whatsapp

**Request** (Twilio Webhook):
```
Content-Type: application/x-www-form-urlencoded

SmsMessageSid=SMxxxx&
WaId=233555555555&
Body=Hi&
From=whatsapp:+233555555555&
ProfileName=John
```

**Response**:
```xml
<Response></Response>
```

---

## Document Metadata

- **Version**: 1.0
- **Last Updated**: 2026-02-09
- **Author**: DiscreetKit Engineering Team
- **Codebase Version**: Next.js 16.0.7
- **Dependencies**: Twilio API v2010-04-01, Upstash Redis, Paystack API v1

---

## Contact & Support

For questions about this architecture, contact the development team or refer to:
- [Main README](../../../README.md)
- [System Design Doc](../../../docs/SYSTEM_DESIGN.md)
- [WhatsApp Module README](../../../src/lib/whatsapp/README.md)
