# Security & Infrastructure Report

**Compliance Level:** Healthcare / E-Commerce Standard  
**Architecture:** Zero-Trust Model

---

## 1. Data Security & Privacy

Given the sensitive nature of the products (SRH - Sexual Reproductive Health), privacy is the foundational architectural constraint.

### Row Level Security (RLS)
We do not rely on application-level logic for security. We enforce it at the **Database Level** using PostgreSQL Row Level Security.
*   **Policy Example:**
    *   `Customers` can only SELECT orders `WHERE user_id = auth.uid()`.
    *   `Pharmacies` can only SELECT orders `WHERE pharmacy_id = auth.pharmacy_id()`.
*   **Impact:** Even if a hacker compromised the API credentials of a frontend client, they could not dump the database. They would still be restricted by the RLS policies of the logged-in user.

### Data Minimization
*   **Guest Checkout:** The system supports guest checkout where user data is retained only for the lifecycle of the active order and operational audit logs, supporting GDPR "Right to be Forgotten" workflows.
*   **Guest Checkout:** The system supports guest checkout where user data is retained only for the lifecycle of the active order and operational audit logs, supporting GDPR "Right to be Forgotten" workflows.
*   **Anonymous Subscriptions:** Refill subscriptions are cryptographically decoupled from user identities. Tracking is code-based (`DK-SUB-XXX`), ensuring no long-term user accounts are needed for recurring care.
*   **Masked Notifications & API:** SMS notifications and public tracking endpoints automatically mask PII (e.g., `020****567`, "Package #123") to prevent data scraping or accidental exposure.
*   **The "Rider Firewall":** Our Rider Registry architecture ensures delivery personnel never see the specific contents of a package. They receive only pickup/drop-off coordinates and a masked contact number, ensuring "Zero-Knowledge Delivery."

---

## 2. Payment Security

**Provider:** Paystack (PCI-DSS Level 1 Certified)

*   **No Stored Cards:** We **never** touch or store raw credit card numbers. All sensitive data is handled directly by Paystack's tokenized vaults.
*   **Webhook Integrity:**
    *   All payments are verified asynchronously via Webhooks (`src/app/api/paystack/webhook`).
    *   We verify the `x-paystack-signature` cryptographic hash on every request to prevent "Replay Attacks" or spoofed payment confirmations.

---

## 3. DevOps & Reliability

### Type-Safe Codebase
The entire codebase is written in **TypeScript**.
*   **Compile-Time Safety:** Eliminates entire classes of bugs (e.g., "undefined is not a function") before code is even deployed.
*   **Schema Synchronization:** We use code generation to sync TypeScript interfaces directly with the Database Schema. If the DB changes, the build fails immediately, preventing runtime crashes.

### CI/CD Pipeline
*   **Provider:** GitHub Actions
*   **Flow:**
    1.  **Pull Request:** Triggers automated linting and build checks.
    2.  **Merge:** Triggers deployment to Vercel.
    3.  **Atomic Deploys:** Every deployment is immutable. If a bug is found, we can rollback to the previous version in < 30 seconds.
