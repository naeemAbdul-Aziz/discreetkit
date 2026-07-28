# DiscreetKit — End-to-End System Data Flow
**Document:** DEV-04  
**Version:** 1.0  
**Last Updated:** May 2026  
**Series:** Developer Reference Manual

---

## 1. Overview
This document maps the flow of data across the DiscreetKit ecosystem. It synthesizes the concepts outlined in **DEV-01 (Scope)**, **DEV-02 (User Types)**, and **DEV-03 (Architecture)** to illustrate how different subsystems interact during critical business operations.

---

## 2. Core Fulfillment Flow (Web to Delivery)

This is the primary happy-path flow for an anonymous customer purchasing a product via `discreetkit.com`.

### Phase 1: Order Initiation
1.  **Client (Customer):** Browses `discreetkit.com`, adds items to the local Zustand cart, and proceeds to checkout.
2.  **Client (Customer):** Submits the two-step checkout form (Area ➔ Contact Info).
3.  **Proxy Gateway:** The request hits `src/proxy.ts`, which validates rate limits (Upstash Redis) and routes the request to the Next.js server action.
4.  **Server (`createOrderAction`):** 
    *   Validates the payload via Zod.
    *   Queries Supabase to fetch canonical product prices.
    *   Calculates the true total (applying campus discount logic if applicable).
    *   Generates a unique Tracking Code and Partner Code.
    *   Inserts the order into the `orders` table with status `pending_payment` and `pharmacy_id = null`.
5.  **External (Paystack):** The server initializes a Paystack transaction using the calculated total and returns the `authorization_url` to the client.
6.  **External (Arkesel):** A fire-and-forget background task sends an initial "Order Received" SMS to the customer.

### Phase 2: Payment & Reconciliation
1.  **Client (Customer):** Completes payment on Paystack's hosted page.
2.  **External (Paystack Webhook):** Hits `/api/webhooks/paystack`.
3.  **Server (Webhook Handler):** 
    *   Verifies the HMAC signature.
    *   Checks Redis for the idempotency key (preventing double processing).
    *   Updates the order status to `received`.
    *   Records a `payment_success` event in `order_events`.
4.  **System (Auto-Assignment Algorithm):** 
    *   Triggers `findBestPharmacyForOrder`.
    *   Queries `pharmacy_service_areas` for coverage match.
    *   Queries `pharmacy_products` to ensure sufficient stock.
    *   Ranks candidates by lowest fee, then fastest time.
    *   Updates the order with the winning `pharmacy_id` and sets `pharmacy_ack_status = 'pending'`.
5.  **External (Resend/Arkesel):** Triggers assignment notification email and SMS to the selected pharmacy partner.

### Phase 3: Pharmacy Fulfillment
1.  **Client (Pharmacy Partner):** Logs into `pharmacy.discreetkit.com` and sees the new order on their dashboard.
2.  **Server Action:** Pharmacy clicks "Accept". The system updates `pharmacy_ack_status = 'accepted'` and logs an event.
3.  **Client (Pharmacy Partner):** Pharmacist packs the order and clicks "Mark Processing".
4.  **Database (Supabase):** Order status changes to `processing`. RLS ensures this pharmacy can only update this specific order.
5.  **Client (Pharmacy Partner):** Hands package to rider, clicks "Dispatch". Status updates to `out_for_delivery`.
6.  **System (Notification Engine):** Customer receives an SMS with a link to track the order.
7.  **Client (Pharmacy Partner):** Rider confirms delivery. Pharmacist clicks "Mark Completed".
8.  **Database (Supabase):** Status updates to `completed`. The financial ledger view (`pharmacy_payouts_due`) automatically recalculates the payout owed to this pharmacy.

---

## 4. WhatsApp Commerce Flow

This flow illustrates how the Twilio chatbot interacts with the platform.

1.  **Client (Customer):** Sends a message (e.g., "Hi") to the DiscreetKit WhatsApp number.
2.  **External (Twilio Webhook):** Posts the message payload to `/api/whatsapp`.
3.  **Server (`manager.ts`):** 
    *   Extracts the sender's phone number (`WaId`).
    *   Queries Redis for the user's current `SessionData`.
4.  **State Machine Logic:**
    *   *If IDLE:* Sends the Main Menu (1. Browse, 2. Track, 3. Refills). Updates Redis state to `AWAITING_INPUT`.
    *   *If BROWSING:* User sends "1" (Selects Product A). Server fetches product details from Postgres, updates the virtual cart in Redis, and asks for address.
    *   *If CHECKOUT:* Server calculates the total, generates a Paystack payment link, and sends it via WhatsApp.
5.  **System Integration:** Once paid, the flow merges seamlessly into **Phase 2** of the Core Fulfillment Flow (Webhooks ➔ Assignment ➔ Pharmacy).

---

## 5. Chronic Refill Workflow

This flow manages recurring medication deliveries.

1.  **Client (Customer):** Submits the Refill Enrollment form (anonymously) on `discreetkit.com/refills`, providing a hospital refill code and optional prescription upload.
2.  **Server (`createRefillSubscription`):**
    *   Validates the hospital code via `refill-logic.ts`.
    *   Inserts a new record into `medication_refill_subscriptions` (bypassing client RLS).
    *   Generates a unique `subscription_code`.
3.  **System (Cron Job):** 
    *   Every 24 hours, `/api/cron/process-refills` runs.
    *   Queries for active subscriptions where `next_delivery_date` is ≤ today.
    *   For each due subscription, it generates a new standard order (`pending_payment` or auto-approved depending on business rules).
    *   Sends an SMS to the customer: "Your refill is ready for dispatch. Click to confirm payment/address."
4.  **Admin Oversight:** Admins use `admin.discreetkit.com` to view subscriptions, verify uploaded prescriptions, and manually trigger refill dispatches if required.

---

## 6. System Resilience & Escalation Flows

What happens when things go wrong?

*   **Missed Webhook:** A customer pays, but Paystack's webhook fails due to network issues. 
    *   *Flow:* The `/api/payments/reconcile` cron runs every 10 mins. It sees the 15-minute-old `pending_payment` order, pings Paystack's verify API, confirms the payment, and forces the order into the `received` state, triggering auto-assignment.
*   **Pharmacy Ignores Order:** An order is assigned, but the pharmacy doesn't accept it.
    *   *Flow:* The `/api/cron/check-escalations` cron runs. It detects an order stuck in `pharmacy_ack_status = 'pending'` for >30 minutes. It fires an urgent SMS to the Admin phone number: "Order XXX is stalled at Pharmacy Y."
*   **Pharmacy Rejects Order:** A pharmacy clicks "Decline" because they lack physical stock.
    *   *Flow:* The system clears the `pharmacy_id`, logs the event, and immediately re-runs the `findBestPharmacyForOrder` algorithm to find the next best candidate.

---
*This concludes the Developer Reference Manual for the DiscreetKit System Architecture.*
