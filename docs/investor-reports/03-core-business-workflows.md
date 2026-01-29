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
1.  **Registry:** Each pharmacy partner registers their trusted internal riders or preferred courier services into the `pharmacy_riders` table. This creates a virtual fleet that spans the entire city without DiscreteKit owning a single tire.
2.  **Smart Assignment:** When dispatching an order, the pharmacy selects from their pre-validated rider list.
3.  **Automated Bridging:**
    *   **Trigger:** Rider assignment instantly triggers an automated bridge between the Rider and the Customer.
    *   **Notification:** Customer receives: *"Your order is on the way. Rider: [Name] ([Phone]). Track here: [Link]"*.
    *   **Privacy:** PII (Personally Identifiable Information) masking ensures the rider calls the customer without seeing their full profile data on a public app.

### Value:
*   **CAC Reduction:** No fleet startup cost.
*   **Scale:** Instant city-wide coverage by onboarding pharmacies.
*   **Trust:** Customers deal with trusted, verified medical couriers, not random gig-workers.
