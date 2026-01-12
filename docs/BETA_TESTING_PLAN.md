# Comprehensive Beta Testing Plan

**Objective**: Verify end-to-end functionality of the DiscreteKit platform, ensuring reliability across User, Pharmacy, Admin, and Logistics workflows.

## Phase 1: Setup & Configuration
**Goal**: Ensure all environments are ready for live simulation.

- [ ] **Data Seeding**: Run `npm run seed:users` to ensure demo Admin, Pharmacy, and Customer accounts exist.
- [ ] **Pharmacy Profile**: Login as Pharmacy, go to **Settings**.
    - [ ] Add a "Service Area" (e.g., "Legon Campus", Fee: 15 GHS).
    - [ ] Toggle **"24/7 Delivery"** to ON.
- [ ] **Admin Verification**: Login as Admin.
    - [ ] Go to **Settings > Notifications** and enable "New Order" alerts.

## Phase 2: Core User Flows ("Happy Path")

### A. The "Discreet" Customer
1.  **Discovery**: Open homepage. Verify "Anonymity Guaranteed" messaging.
2.  **Selection**: Add "Pregnancy Test" to cart.
3.  **Checkout**: Proceed to checkout as Guest.
    - [ ] **Automatic Location Test**: Click "Use Current Location" (or similar icon).
        - [ ] **Verify**: Browser prompts for permission.
        - [ ] **Verify**: Address field auto-fills with accurate GPS-derived location.
    - [ ] Enter Delivery Location (Manual override): "Legon Campus".
    - [ ] **Verify**: Does the system auto-suggest the closest Pharmacy?
4.  **Payment**: Complete simulated payment (Paystack Test Mode).
    - [ ] **Verify**: Redirects to `/track` page.

### B. The Pharmacy Fulfillment
1.  **Notification**: Check Pharmacy Dashboard (or email).
2.  **Order Acceptance**:
    - [ ] Click "Orders". Find the new `Received` order.
    - [ ] Click **"Accept Order"**. Verify status changes to `Processing`.
3.  **Messaging (NEW)**:
    - [ ] Use the **Chat** feature to send a message to Admin: "Item packed, ready for rider."

### C. The Admin Logistics (Rider Assignment)
1.  **Monitoring**: Login as Admin, view `Out for Delivery` candidates.
2.  **Rider Assignment (NEW)**:
    - [ ] Select the order. Click status badge.
    - [ ] Select **"Out for Delivery"**.
    - [ ] **Validation Check**: Try to save *without* Rider Name/Phone. Verify it blocks you.
    - [ ] Enter Rider Name: "Kofi Motor", Phone: "020xxxxxxx". Save.
3.  **Tracking Check**:
    - [ ] As Customer, refresh `/track`.
    - [ ] **Verify**: Timeline updates. "Dispatch Rider" card appears with Kofi's phone number.

## Phase 3: Advanced & Robustness Testing

### D. WhatsApp Commerce (Assistant)
1.  **Virtual Button Test**: Send "Menu" to the WhatsApp bot.
2.  **Ordering**: Select items via chat.
3.  **Checkout Link**: Click the generated link.
    - [ ] **Verify**: Cart is pre-filled with WhatsApp selection.

### E. Analytics & Data Hub (NEW)
1.  **Data Freshness**: After completing the order above:
    - [ ] Go to **Admin > Analytics**.
    - [ ] **Verify**: "Total Revenue" has increased.
    - [ ] **Verify**: "Orders" count +1.
    - [ ] **Verify**: The "Sales Analysis" chart shows a spike for today.
2.  **Data Hub Export**:
    - [ ] Go to **"Data Hub"** tab.
    - [ ] Click "Export CSV" (Simulate export).

### F. Negative Scenarios ("Unhappy Path")
1.  **Inventory Stockout**:
    - [ ] Pharmacy: Set "Pregnancy Test" stock to 0.
    - [ ] Customer: Try to buy 1. Verify "Out of Stock" message.
2.  **Delivery Zone Mismatch**:
    - [ ] Customer: Enter location "Kumasi" (outside maintained zones).
    - [ ] **Verify**: "No delivery options available" message.

## Phase 4: Sign-off Criteria
- [ ] No critical bugs in Payment Flow.
- [ ] Order Tracking accurately reflects real-time status.
- [ ] Rider Details are never missing for active deliveries.
- [ ] Analytics successfully captures test transaction data.
