## April 2026 Modernization (Compliance & Privacy)

### 1. Least-Privilege Reporting (Performance vs. Privacy)
The new **Parallel Execution Engine** in the Admin dashboard serves as a primary data minimization tool:
- **Granular Fetching**: Instead of retrieving the full order record, the system now projects only specific, non-PII columns (e.g., `status`, `total_price`) for aggregate metrics.
- **Result**: Administrators can monitor the **Anxiety Meter** (velocity) and **Privacy Density** (demand hotspots) without ever pulling sensitive contact data into the reporting view.

### 2. Optimistic UI Reliability
By managing state at the edge (Pharmacy Portal), we reduce the risk of out-of-sync PII exposure:
- **Synchronized Anonymity**: Actions like "Accept" or "Decline" are atomic. If a pharmacist processes an order, the system instantly masks its details in all "Pending" views across other nodes, preventing unauthorized exposure of order codes during high-volume periods.

---

## Operational Logging & Secret Hygiene (2026-02)
**(Built over 6 Months of Hardening)**

- Secrets alignment: single `CRON_SECRET` value across CI and server; validated at job start.
- Sanitized auth: headers/values normalized to avoid mismatches; prevents logging sensitive content.
- Controlled alerts: Admin SMS endpoints require bearer auth; no customer PII exposed in alert content.
- Audit trails: Escalation and reservation events recorded in `order_events` with timestamps.

## April 2026 Privacy Modernization ("Command Center" Sprint)
- **Identifier Masking Protocol**: Implemented real-time server-side masking for Phone numbers and Street addresses across all non-essential operational viewports (e.g., `StatCard` and `RankingList` analytics).
- **Role-Based Workspace Isolation**: Refined the RBAC layer to ensure pharmacists interact with logistics-specific metadata while sensitive PII remains logic-masked by default.
- **Tenant Isolation Enforcement**: Verified strict RLS (Row Level Security) and ownership checks, ensuring zero data leakage between competitive pharmacy nodes.
- **Business Impact**: Reduces legal PII risk and significantly lowers insurance costs for the core health-logistics platform.

## February 2026 Compliance Reinforcements
# Compliance & Privacy Infrastructure Report
**Subject:** How We Protect User Data (GDPR/HIPAA Standards)  
**Security Level:** High Assurance

---

## 1. Overview

DiscreetKit is built to follow the strict rules of the **Ghana Data Protection Act, 2012 (Act 843)** and international standards like **GDPR (Europe)** and **HIPAA (USA)**.

We do not just have a written policy; we force these rules to happen using our computer code.

| Principle | How We Do It | Code Reference |
| :--- | :--- | :--- |
| **Right to See Data** | Admin tools verify who sees what automatically. | `src/lib/admin-actions.ts` |
| **Keeping Little Data** | Users can buy without creating an account (Guest Checkout). | `src/lib/whatsapp/manager.ts` |
| **Anonymous Care** | Recurring refills are tracked via code, not user account. | `src/lib/actions.ts` |
| **Strict Access** | The database itself blocks unauthorized access. | `supabase/migrations/schema.sql` |
| **Right to Delete** | We can completely remove user data if asked. | `src/lib/auth/utils.ts` |

---

## 2. Technical Evidence

### A. Strict Database Security
In many systems, the main server has full access to everything. In our system, the database checks every single request to make sure the user is allowed to see that specific data.

*   **Evidence:**
    *   **Customer Privacy:** A customer can only see their own orders. Even if a hacker broke into our website, they could not download the full database because the database itself would reject them.
    *   **Pharmacy Privacy:** One pharmacy cannot see the orders or stock of another pharmacy. This is blocked by a security rule called `pharmacy_isolation_policy`.

### B. Hiding Sensitive Info
We treat personal health information with extreme care.

*   **Delivery Secrecy:** When we send a package to a rider (Uber/Bolt/Partner), we do **NOT** tell them what is inside.
    *   *What the System says:* "Package #DK-9923"
    *   *What the User gets:* The correct medication.
    *   *Why this matters:* The rider is just a delivery person. They do not know, and cannot tell anyone, what the customer bought.
*   **Safe Public Tracking:** The "Track Order" page is publicly accessible but cryptographically safe. PII (Phone/Address) is masked on the server before being sent to the browser, so even if a tracking code is leaked, personal data is not exposed.

### C. Secure Payments
We limit our risk by never seeing or storing credit card numbers.

*   **Implementation:** `src/app/api/paystack/route.ts`
*   **How it works:**
    1.  User enters checkout.
    2.  We send them to Paystack's secure page.
    3.  User enters card details there.
    4.  We only get a "Success" message back.
*   **Result:** Even if someone physically stole our servers, they would find **zero** credit card numbers.

---

## 3. Where Data Lives
*   **Storage:** We use Supabase (hosted on AWS).
*   **Encryption:** The hard drives are encrypted (scrambled) so they cannot be read if stolen.
*   **Safe Connections:** All internet connections between the website, our servers, and WhatsApp are secure and encrypted.

---

## 4. Audit Logs
We keep a permanent record of every major action. If an order status changes or a new partner logs in, we record it.

*   **Table:** `order_events`
*   **What we record:** Who did it, what they did, and when.
*   **Why:** If there is ever an investigation, we can prove exactly what happened.

---

## 5. WhatsApp Privacy
Our WhatsApp system is designed to forget.
*   **Temporary Memory:** We remember the conversation only long enough to complete the order.
*   **No Chat History:** We store the fact that "Order #123 was placed," but we do not keep a permanent record of the chat message texts like "I have these symptoms..." in our main database.
