## March 2026 Workflow Additions

### 5. Operational Intelligence Aggregation Pipeline

**File Reference:** `src/lib/admin-actions.ts` (getDashboardStats)

The `getDashboardStats` function now computes three operational intelligence metrics as a final aggregation pass over the already-fetched orders dataset. This is a **zero-cost, zero-bloat** analytics pipeline.

#### 5a. Fulfillment Velocity (The "Anxiety Meter")
```
INPUT: orders[] with order_events[]
ALGORITHM:
  For each order:
    receivedAt  = order_events.find(e => e.status === 'received')?.created_at  || order.created_at
    shippedAt   = order_events.find(e => e.status === 'out_for_delivery')?.created_at
    If shippedAt exists: accumulate (shippedAt - receivedAt)
  avgVelocityHours = totalMs / count / (1000 * 60 * 60)
OUTPUT: { fulfillmentVelocity: string } // hours, e.g. "2.4"
```
*Business Value:* The single most important trust KPI for an anonymous delivery platform. If this number rises, customer anxiety rises. Serves as the operations team's primary SLA signal.

#### 5b. Anonymity Density (Regional Hotspots)
```
INPUT: orders[]
ALGORITHM:
  Group orders by delivery_area (fallback: "Standard Delivery")
  Sort by count DESC, take top 8
OUTPUT: [{ name: string, value: number }] // ranked campus/region list
```
*Business Value:* Identifies where to deploy the next pharmacy node. Data-driven geographic expansion replaces guesswork. The "Privacy Density" Area chart renders this in the Admin dashboard.

#### 5c. Operational Pulse Feed
```
INPUT: orders[0..19] with order_events[]
ALGORITHM:
  FlatMap all order_events from top 20 orders
  Attach orderCode to each event
  Sort by timestamp DESC
  Take top 12
OUTPUT: [{ id, orderCode, status, timestamp, note }]
```
*Business Value:* Gives the Admin a real-time heartbeat of the logistics network without navigating to the Orders table. Renders as a monospaced SSE-powered ticker.

---

## Escalation Workflow & Admin Alerts (2026-02)

- Stale order detection runs every 15 minutes, scanning `orders` in `received` or `processing` states beyond thresholds.
- Admin alerts are sent via SMS to `ADMIN_PHONES` using Arkesel; events logged in `order_events` for auditability.
- Testability: added a secure endpoint to validate SMS delivery paths without touching production orders.
- Outcome: quicker human intervention on stuck orders → improved fulfillment reliability and customer satisfaction.

### Investor Highlights

- Proactive intervention: Automatic detection + SMS alerts reduce abandonment and delayed fulfillment.
- Lower support burden: Fewer manual checks and escalations; clearer audit via `order_events`.
- Revenue protection: Reduced cancellations/refunds from stuck orders; stabilizes conversion and repeat rates.
- SLA uplift: Faster response windows measurable over time; supports stronger partner and customer SLAs.

# Core Business Workflows & IP

This document outlines the proprietary business logic and algorithms that drive the DiscreetKit platform. These workflows constitute the core Intellectual Property (IP) of the system.

## 1. Smart Order Routing Algorithm ("The Dispatcher")

**File Reference:** `src/lib/order-assignment.ts`

The system utilizes an automated decision engine to route incoming orders to the optimal pharmacy partner. This removes the need for manual dispatching.

### Algorithm Steps:
When an order is placed (Web or WhatsApp), the `autoAssignOrder` function executes the **"Hyper-Local Optimization"** protocol:

1.  **Geo-Fencing (The "15-Minute" Rule):**
    *   The system queries `pharmacy_service_areas` to find partners within a tight radius (< 5km) of the customer.
    *   *Operational Goal:* By utilizing a nationwide mesh of pharmacy nodes, we convert "Shipping" into "Hyper-Local Delivery," effectively **eliminating long-haul logistics costs**.
    
2.  **Stock Verification (The "Hard" Filter):**

    *   It iterates through candidates to verify **Physical Availability**.
    *   *Logic:* It checks if the pharmacy has `stock_level >= order_quantity` for **ALL** items in the cart. Pharmacies with partial stock are disqualified to prevent split-shipments.

3.  **Optimization Ranking (The "Soft" Filter):**
    *   Valid candidates are ranked based on a weighted priority:
        1.  **Cost:** Lowest Delivery Fee (Primary Factor).
        2.  **Speed:** Lowest Max Delivery Time (Secondary Factor).

4.  **Assignment & Alerting:**
    *   The winner is assigned the order (`status: received`).
    *   **Instant Alert:** The system triggers an SMS and Email to the specific pharmacy branch manager.

---

## 2. WhatsApp Commerce State Machine

**File Reference:** `src/lib/whatsapp/manager.ts`

Unlike typical "Chatbots" that use simple keyword matching, our WhatsApp integration uses a **Deterministic Finite Automaton (DFA)** state machine to manage user context.

### States:
*   `IDLE`: Waiting for user intent.
*   `BROWSING_CATALOG`: User is navigating categories.
*   `VIEWING_PRODUCT`: User has selected a specific item.
*   `PARTNER_CARE`: User is in the Marie Stopes service flow.

### The "Cart-in-Chat" Flow:
1.  **Session Persistence:** The system maintains a temporary "cart" in the database linked to the user's WhatsApp ID.
2.  **Dynamic Checkout:** When ready to buy, the user clicks "Buy". The system:
    *   Creates a `pending_payment` order in the core database.
    *   Generates a unique **Paystack Payment Link**.
    *   Sends the link back to the chat.
3.  **Synchronization:** Once paid, the Paystack webhook updates the order status, triggers the "Smart Order Routing" (above), and sends a confirmation back to the WhatsApp chat.

---

## 3. Partner Verification Logic

**File Reference:** `src/lib/whatsapp/manager.ts` (handlePartnerVerification)

To support our partnership with Marie Stopes, the system implements a verification gate:
1.  **Input:** User enters a code (e.g., `DK-MS-2024`).
2.  **Validation:** System checks against the `orders` table to see if this code (generated during a previous purchase) exists and is valid.
3.  **Unlock:** If valid, the user is transitioned to a "Verified" state, unlocking hidden menu options (e.g., "Speak to Counselor", "Claim Free Service").

---

## 4. Asset-Light Logistics Engine ("The Rider Registry")

**File Reference:** `src/lib/admin-actions.ts` (Rider Management Module)

To operate without a capital-intensive fleet, the system uses a **Decentralized Dispatch Protocol** that leverages pharmacy partners' existing logistics infrastructure.

### The Problem:
Owning a bike fleet is expensive (Maintenance, Fuel, Insurance, HR). However, relying on third-party aggregators (Uber/Bolt) can be unreliable for discreet medical deliveries.

### The Solution: "Pharmacy-Sourced Fleet"
1.  **Registry:** Each pharmacy partner registers their trusted internal riders or preferred courier services into the `pharmacy_riders` table. This creates a virtual fleet that spans the entire city without DiscreetKit owning a single tire.
2.  **Smart Assignment:** When dispatching an order, the pharmacy selects from their pre-validated rider list.
3.  **Automated Bridging:**
    *   **Trigger:** Rider assignment instantly triggers an automated bridge between the Rider and the Customer.
    *   **Notification:** Customer receives: *"Your order is on the way. Rider: [Name] ([Phone]). Track here: [Link]"*.
    *   **Privacy:** PII (Personally Identifiable Information) masking ensures the rider calls the customer without seeing their full profile data on a public app.

### Value:
*   **CAC Reduction:** No fleet startup cost.
*   **Scale:** Instant city-wide coverage by onboarding pharmacies.
*   **Trust:** Customers deal with trusted, verified medical couriers, not random gig-workers.
