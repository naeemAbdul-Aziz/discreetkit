# DiscreetKit — User Stories & Acceptance Criteria
**Document:** DEV-05  
**Version:** 1.0  
**Last Updated:** May 2026  
**Series:** Developer Reference Manual

---

## 1. Anonymous Customer (Patient) Stories

### 1.1 Browsing & Cart
*   **Story:** As an anonymous customer, I want to browse products without logging in, so that my health needs remain entirely private.
    *   *Acceptance Criteria:* The product catalog is visible on the public route. No prompt to create an account appears during the browsing phase.
*   **Story:** As an anonymous customer, I want to add multiple items to a cart, so that I can purchase everything I need in a single order.
    *   *Acceptance Criteria:* Cart state is persisted locally (via Zustand/localStorage). If I refresh the page, my cart remains intact.

### 1.2 Checkout & Payment
*   **Story:** As a customer, I want to provide only my delivery area, address, and phone number at checkout, so that I am not forced to reveal my identity.
    *   *Acceptance Criteria:* The checkout form does not ask for First Name, Last Name, or Date of Birth.
*   **Story:** As a student, I want to select my university campus as the delivery area, so that I can automatically receive the reduced student delivery rate.
    *   *Acceptance Criteria:* Selecting "KNUST" or "Legon" sets the delivery fee to GHS 10 instead of GHS 20. This is validated on the server.
*   **Story:** As a customer, I want to pay securely via Mobile Money or Card, so that I don't have to handle cash upon delivery.
    *   *Acceptance Criteria:* Submitting the checkout form redirects to the secure Paystack hosted checkout page with the correct total amount in GHS.

### 1.3 Post-Purchase
*   **Story:** As a customer, I want to receive a unique Tracking Code after payment, so that I can check my order status later without an account.
    *   *Acceptance Criteria:* A 6-8 character alphanumeric code is generated upon order creation and displayed on the success page, as well as texted via SMS.
*   **Story:** As a patient on chronic medication, I want to upload a picture of my prescription and my hospital code, so that I can subscribe to automatic refills.
    *   *Acceptance Criteria:* The refill form accepts image uploads, stores them securely in a private bucket, and successfully registers the subscription without creating a user account.

---

## 2. Pharmacy Partner Stories

### 2.1 Order Management
*   **Story:** As a pharmacist, I want to receive an SMS and email when a new order is assigned to my pharmacy, so that I can act on it immediately.
    *   *Acceptance Criteria:* Upon auto-assignment, the system dispatches an email via Resend and an SMS via Arkesel to the pharmacy's registered contacts.
*   **Story:** As a pharmacist, I want to view a dashboard of all my assigned orders, so that I know what needs to be packed.
    *   *Acceptance Criteria:* The pharmacy dashboard fetches only orders where `pharmacy_id` matches the logged-in user's assigned pharmacy. RLS prevents viewing other pharmacies' orders.
*   **Story:** As a pharmacist, I want the ability to Accept or Decline a newly assigned order, so that I am not penalized if I physically cannot fulfill it (e.g., unexpected stockout).
    *   *Acceptance Criteria:* Declining an order immediately strips the `pharmacy_id` and triggers the system to reassign the order to the next best candidate.

### 2.2 Fulfillment & Finance
*   **Story:** As a pharmacist, I want to update an order's status to "Out for Delivery", so that the customer knows the rider is on the way.
    *   *Acceptance Criteria:* Changing the status triggers an automated SMS to the customer.
*   **Story:** As a pharmacy owner, I want to view my financial ledger, so that I can see exactly how much DiscreetKit owes me for completed deliveries.
    *   *Acceptance Criteria:* The ledger view calculates total payouts based on the pharmacy's specific `trade_discount_percentage` applied to the product totals.

---

## 3. Platform Admin Stories

### 3.1 Global Oversight
*   **Story:** As an admin, I want to view a real-time dashboard of total sales, active deliveries, and system escalations, so that I can monitor platform health.
    *   *Acceptance Criteria:* The admin dashboard displays aggregated KPIs. The Activity Pulse feed updates with new order events.
*   **Story:** As an operations manager, I want to receive an SMS alert if an order is stuck in "Pending Acknowledgment" for too long, so that I can intervene.
    *   *Acceptance Criteria:* The escalation cron job correctly identifies stalled orders and dispatches an SMS to the designated admin phone number.

### 3.2 Manual Interventions
*   **Story:** As an admin, I want the ability to manually reassign an order to a different pharmacy, so that I can resolve fulfillment bottlenecks.
    *   *Acceptance Criteria:* The admin order detail page has a "Force Reassign" dropdown that updates the `pharmacy_id` and triggers a new assignment notification to the target pharmacy.
*   **Story:** As an admin managing refills, I want to view uploaded prescriptions to verify them against hospital codes, so that I ensure compliance before approving a refill subscription.
    *   *Acceptance Criteria:* Admins can view the securely stored prescription images and click "Approve" to activate the `medication_refill_subscriptions` record.
