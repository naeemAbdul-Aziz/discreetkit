# DiscreetKit — User Types & Capabilities
**Document:** DEV-02  
**Version:** 1.0  
**Last Updated:** May 2026  
**Series:** Developer Reference Manual

---

## 1. Overview
DiscreetKit operates on a robust Role-Based Access Control (RBAC) system enforced at both the application level (via custom Next.js middleware) and the database level (via PostgreSQL Row Level Security). 

This document defines the primary user types interacting with the system, outlining exactly what each actor can and cannot do to maintain platform security and anonymity.

---

## 2. Anonymous Customer
The core of DiscreetKit's value proposition is anonymity. Customers interact with the system without creating traditional accounts. Their "identity" is temporarily tied to a session or a unique tracking code.

### ✅ What They Can Do
*   **Browse Catalog:** View all active products, categories, and pricing.
*   **Create Orders:** Add items to a client-side cart and initiate checkout.
*   **Provide Delivery Info:** Submit a delivery area, specific address/note, phone number, and email.
*   **Complete Payments:** Process payments securely via Paystack.
*   **Track Orders:** Look up real-time order status, courier details, and history using a unique alphanumeric Tracking Code.
*   **Subscribe to Refills:** Submit a chronic medication refill request, including uploading a prescription anonymously.
*   **Interact via WhatsApp:** Browse products, checkout, and check order status via the Twilio-powered WhatsApp chatbot.
*   **Submit Requests:** Join the waitlist or suggest new products to the team.

### ❌ What They Cannot Do
*   **Create an Account:** There is no "Sign Up" or "Login" for customers.
*   **View Past Orders Automatically:** Without the specific tracking code, there is no dashboard to view order history.
*   **Modify Prices:** The client UI may calculate totals, but the server (`src/lib/actions.ts`) entirely recalculates and enforces prices against the database during checkout to prevent tampering.
*   **View Pharmacy Data:** Customers cannot see which pharmacy is fulfilling their order until the courier contacts them.

---

## 3. Pharmacy Partner (`pharmacy.discreetkit.com`)
Pharmacies are the fulfillment nodes of the network. They log in via Supabase Auth and interact exclusively with the Pharmacy Portal.

### ✅ What They Can Do
*   **Manage Assigned Orders:** View orders specifically assigned to their `pharmacy_id`.
*   **Accept / Decline:** Acknowledge new assignments and decide whether they can fulfill them based on current capacity.
*   **Update Order Lifecycle:** Move orders through states: `processing` ➔ `out_for_delivery` ➔ `completed`.
*   **Manage Inventory:** Update `stock_level`, `reorder_level`, and `is_available` flags for products *mapped to their specific pharmacy*.
*   **Configure Service Areas:** Define which geographic regions they deliver to, along with their specific delivery fee and estimated delivery times.
*   **Manage Riders:** Add, edit, and deactivate their own delivery personnel.
*   **View Financial Ledger:** View completed orders and calculate their due payouts based on their specific `trade_discount_percentage`.
*   **Update Settings:** Manage store profile, bank/MoMo details, notification preferences (SMS/Email), and account password.
*   **Send Internal Messages:** Communicate with the Admin team regarding specific orders via the Order Messages feature.

### ❌ What They Cannot Do
*   **View Other Pharmacies:** They have zero visibility into the orders, inventory, or performance of other partners (enforced by RLS).
*   **Modify Global Catalog:** They cannot add new global products, change baseline prices, or modify categories.
*   **Assign Orders:** They cannot pull orders from a pool; orders must be assigned to them by the system or Admin.
*   **Access Admin Portal:** The Proxy Gateway (`src/proxy.ts`) will aggressively bounce pharmacy users attempting to access `admin.discreetkit.com`.

---

## 4. Platform Administrator (`admin.discreetkit.com`)
Admins (Founders, Operations Managers) have global oversight of the entire ecosystem.

### ✅ What They Can Do
*   **Global Visibility:** View all orders, across all pharmacies, at all times.
*   **Manage Catalog:** Create, edit, and deprecate global products and categories.
*   **Manage Partners:** Onboard new pharmacies, toggle their active status, configure their trade discount, and assign "Partner Hub" status.
*   **Intervene in Fulfillment:** Manually override order statuses, forcefully reassign an order to a different pharmacy, or cancel orders.
*   **Process Refunds:** Manage order cancellations and log refund references.
*   **Monitor Operations:** View live streams of system events, stuck orders, and system escalations.
*   **Manage Refills:** Oversee the chronic medication subscription program, verify uploaded prescriptions, and manage hospital refill codes.
*   **Financial Oversight:** View total platform revenue, calculate global payouts due to partners.
*   **System Configuration:** Update global store settings (support contacts, default notification behaviors).
*   **View Analytics:** Access the AI Copilot and deep analytics regarding sales velocity and product performance.

### ❌ What They Cannot Do
*   **Act as a Pharmacy Directly:** While they can reassign orders, the fulfillment workflow (accepting, dispatching via riders) is designed for the Pharmacy portal context (unless impersonating).
*   **Bypass Webhooks for Payment:** While they can change an order status, the initial payment verification relies on the Paystack integration to ensure financial integrity.

---

## 5. Support Agent (Optional Role)
A subset of Admin access designed for customer service representatives.

### ✅ What They Can Do
*   **View Order Details:** Look up orders to assist customers who call or email.
*   **Send Order Messages:** Communicate with pharmacies on behalf of customers.
*   **View Waitlist/Suggestions:** Process user feedback.

### ❌ What They Cannot Do
*   **Modify Global Settings:** Cannot alter trade discounts, system configurations, or product catalog definitions.
*   **Perform Financial Actions:** Cannot process refunds or view global revenue analytics (depending on exact RLS implementation).

---

## 6. System (Automated Agents)
Several automated processes operate with elevated "Service Role" privileges to maintain system health.

### ✅ What It Does
*   **Auto-Assignment Engine:** Matches paid orders to the optimal pharmacy based on area, stock, fee, and time (`src/lib/order-assignment.ts`).
*   **Reconciliation Cron:** Scans for abandoned `pending_payment` orders and queries Paystack to recover missed webhooks.
*   **Escalation Monitor:** Flags orders that have been stuck in `received` or `processing` for too long and alerts Admins.
*   **Reservation Manager:** Releases inventory reservations if an order isn't assigned or fulfilled within a specific window.
*   **WhatsApp Manager:** Maintains conversational state in Redis and translates user inputs into platform actions (`src/lib/whatsapp/manager.ts`).
