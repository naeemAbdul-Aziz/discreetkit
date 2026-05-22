# DiscreetKit — API & Webhook Contracts
**Document:** DEV-06  
**Version:** 1.0  
**Last Updated:** May 2026  
**Series:** Developer Reference Manual

---

## 1. Overview
As a Next.js 16 App Router application, DiscreetKit utilizes a combination of traditional REST endpoints (for external webhooks and cron triggers) and Next.js Server Actions (for internal client-to-server RPCs). This document defines every single endpoint contract in the system.

---

## 2. External Webhook Endpoints

### 2.1 Paystack Payment Webhook
*   **Endpoint:** `POST /api/webhooks/paystack`
*   **Purpose:** Receives asynchronous payment success notifications from Paystack.
*   **Security:** HMAC-SHA512 signature verification using `PAYSTACK_SECRET_KEY` against the `x-paystack-signature` header.
*   **Idempotency:** Utilizes Redis locks based on `data.reference` to prevent double-processing.

**Expected Payload (charge.success):**
```json
{
  "event": "charge.success",
  "data": {
    "id": 302961,
    "domain": "test",
    "status": "success",
    "reference": "ORD-A1B2C3D4",
    "amount": 20000, 
    "message": null,
    "gateway_response": "Successful",
    "paid_at": "2026-05-21T11:45:00.000Z",
    "created_at": "2026-05-21T11:44:00.000Z",
    "channel": "mobile_money",
    "currency": "GHS",
    "customer": {
      "id": 84312,
      "email": "customer@example.com"
    }
  }
}
```

### 2.2 Twilio WhatsApp Webhook
*   **Endpoint:** `POST /api/whatsapp`
*   **Purpose:** Receives incoming WhatsApp messages from users.
*   **Security:** Twilio Signature validation (optional but recommended in production) or IP whitelisting.

**Expected Payload (Form Encoded):**
```text
SmsMessageSid=SMXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
&NumMedia=0
&ProfileName=John+Doe
&SmsSid=SMXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
&WaId=233555555555
&SmsStatus=received
&Body=Hi+there
&To=whatsapp%3A%2B233555555555
&From=whatsapp%3A%2B233555555555
&ApiVersion=2010-04-01
```

---

## 3. Internal Automation (Cron) Endpoints

These endpoints are triggered by Vercel Cron (or GitHub Actions) on a set schedule. They are secured via a bearer token (`CRON_SECRET`).

### 3.1 Process Refills
*   **Endpoint:** `GET/POST /api/cron/process-refills`
*   **Schedule:** Daily at 00:00 UTC
*   **Action:** Scans `medication_refill_subscriptions` for `next_delivery_date <= TODAY()`. Generates new orders and alerts customers via SMS.
*   **Response:** `{ "processed": 12, "success": true }`

### 3.2 Check Escalations
*   **Endpoint:** `GET/POST /api/cron/check-escalations`
*   **Schedule:** Every 15 minutes
*   **Action:** Scans for orders stuck in `received` or `pharmacy_ack_status = 'pending'` for >30 minutes. Fires SMS alerts to Admins.
*   **Response:** `{ "escalated": 2, "success": true }`

### 3.3 Payment Reconciliation
*   **Endpoint:** `GET/POST /api/payments/reconcile`
*   **Schedule:** Every 10 minutes
*   **Action:** Identifies orders in `pending_payment` older than 10 mins. Calls Paystack API to verify status. If paid, manually triggers the webhook flow to heal missing events.
*   **Response:** `{ "reconciled": 1, "success": true }`

### 3.4 Release Reservations
*   **Endpoint:** `GET/POST /api/cron/release-reservations`
*   **Schedule:** Hourly
*   **Action:** Frees up inventory from `inventory_reservations` if an order was cancelled or stuck unfulfilled beyond its TTL.
*   **Response:** `{ "released": 0, "success": true }`

---

## 4. Internal Server Actions (RPCs)

These are Next.js Server Actions invoked directly from Client Components. They operate over standard POST requests with encrypted action IDs, but are logically documented here as RPC endpoints.

### 4.1 `createOrderAction` (Customer)
*   **Input:** `{ items: [{ id: 1, qty: 2 }], deliveryArea: "Legon", phone: "0555555555", email: "test@test.com" }`
*   **Process:** Validates stock, recalculates true canonical price from DB, applies campus rules, inserts `pending_payment` order.
*   **Output:** `{ success: true, orderId: 104, code: "ORD-XYZ", authorization_url: "https://checkout.paystack.com/..." }`

### 4.2 `findBestPharmacyForOrder` (System Engine)
*   **Input:** `items` array, `deliveryArea` string.
*   **Process:** Evaluates `pharmacy_service_areas` and `pharmacy_products`. Ranks by lowest `delivery_fee` and fastest `max_delivery_time_hours`.
*   **Output:** `{ pharmacyId: 4, reason: "Best match: Fee 10, Time 2h" }`

### 4.3 `acceptOrderAction` (Pharmacy)
*   **Input:** `orderId` (number).
*   **Process:** Verifies the user is the assigned pharmacy (RLS check). Updates `pharmacy_ack_status` to `'accepted'`.
*   **Output:** `{ success: true }`

### 4.4 `updateOrderStatusAction` (Pharmacy / Admin)
*   **Input:** `orderId` (number), `newStatus` (string: processing, out_for_delivery, completed).
*   **Process:** Updates status, logs event to `order_events`, triggers SMS/Email notification sequence.
*   **Output:** `{ success: true }`

### 4.5 `createRefillSubscription` (Customer / Admin)
*   **Input:** `{ productId: 5, hospitalCode: "UGMC-123", frequency: "monthly" }`
*   **Process:** Validates hospital code. If valid, inserts subscription.
*   **Output:** `{ success: true, subscription_code: "SUB-ABC" }`
