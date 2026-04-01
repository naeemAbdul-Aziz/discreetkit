## April 2026 Modernization (Security & Performance)

### 1. Parallel Projection Reliability
To achieve the **2-3x speed increase** in our Admin hub, we migrated to a **Parallel Dynamic Projection** strategy:
- **Resilience**: By using `Promise.all` for metrics fetching, we reduce the duration of open database connections, lowering the risk of connection pool exhaustion and improving overall site availability.
- **Security**: The query engine specifically filters for required columns, ensuring that sensitive PII is never part of the transport payload for aggregate reporting.

### 2. Optimistic UI Reliability
The Pharmacy portal now utilizes **Optimistic State Synchronization**:
- **Integrity**: Actions are processed locally and reconciled with the database. In the event of a network failure, the system performs an **automatic state rollback**, ensuring that the pharmacist's view never drifts from the source of truth (Supabase).
- **UX Safety**: Error toasts provide immediate operational clarity, preventing "ghost actions" during high-volume delivery windows.

---

## Scheduled Ops Security & Reliability (2026-02)
**(Built over 6 Months of Hardening)**

- Secrets alignment: `CRON_SECRET` required by both GitHub Actions and server endpoints; early validation prevents misconfigured runs.
- Auth normalization: headers and secrets sanitized to avoid whitespace/quote mismatches causing false unauthorized responses.
- Least privilege: cron jobs invoke public API endpoints with bearer key; no server keys exposed to CI runner.
- Operational safeguards: concurrency limits and retries reduce incident likelihood from transient network faults.

## Operational Risk Reduction via Quality Gates (Jan 2026)

- **Automated gates:** CI enforces zero warnings and strict typecheck. Builds must pass before deploy.
- **Risk controls:** React hook dependency and purity checks prevent race conditions and stale state in dashboards and realtime features.
- **Outcome:** Lower likelihood of customer-facing inconsistencies, improved post-deploy stability, and faster rollback/triage due to standardized code quality.

## Governance Controls (Main Branch Protection)

- **Policy:** Require PRs with 1 approval and conversation resolution; enforce status checks (`lint`, `typecheck`, `build`) and up-to-date branches; block force pushes/deletions; include administrators.
- **Impact:** Reduces production incident probability; improves auditability and aligns with standard compliance expectations.

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

### February 2026 Additions
- **Pharmacy Orders:** RLS SELECT policies validated; an optional UPDATE policy is added to allow pharmacies to update their own orders when enabling client writes. Otherwise, updates remain server-side using the service role with explicit ownership checks.
- **Rider Registry:** Full RLS on `pharmacy_riders` (SELECT/INSERT/UPDATE/DELETE) per pharmacy; server actions enforce ownership to prevent cross-tenant mutations.
- **Observability:** Sentry instrumentation captures order status transitions, SMS notification attempts, and exceptions for faster incident triage.
- **Idempotency:** API prevents duplicate SMS on unchanged statuses and deduplicates `order_events` to keep logs and analytics clean.

### Content Security Policy (CSP) & Hardened Headers
- **Status:** **Production Hardened (Jan 2026)**
- **Implementation:** NIST-aligned security headers enforced globally via `next.config.ts`.
    - **Exfiltration Prevention:** Strict `connect-src` allowlists restrict data transmission only to trusted endpoints (Supabase, Paystack, Arkesel), neutralizing common data leakage attacks.
    - **Anti-Clickjacking:** `X-Frame-Options: SAMEORIGIN` blocks malicious iframe attacks while preserving essential admin workflows.
    - **Transport Security:** `Strict-Transport-Security` (HSTS) with preloading enforced to prevent Man-in-the-Middle (MitM) downgrade attacks.
    - **Component Isolation:** `Permissions-Policy` locks down sensor access (Camera/Mic/Geolocation) to minimize browser-level attack surface.

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
*   **Webhook Integrity & Idempotency:**
    *   All payments are verified asynchronously via Webhooks (`src/app/api/paystack/webhook`).
    *   We verify the `x-paystack-signature` cryptographic hash on every request using timing-attack safe comparisons to prevent spoofed payment confirmations.
    *   **Replay Attack Prevention:** A Redis-backed idempotency key system strictly ensures each payment event is processed exactly once, protecting against network retries or malicious replay attempts.

## 2.5 Input Validation & SQL Database Security
*   **Anti-Tampering Controls:** The checkout system uses robust server-side recalculation. Client-submitted prices are completely discarded and verified dynamically against the secure database. This prevents malicious actors from manipulating cart totals.
*   **SQL Injection Prevention:** All database requests are parameterized via our Data Access Layer (PostgREST), meaning traditional SQL injection vulnerabilities are effectively neutralized by design.

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

### Edge Middleware & Proxy Architecture (Next.js 16)
- **Change:** Migrated from `middleware.ts` to `proxy.ts` to align with Next.js 16; unified auth gating, subdomain rewrites (admin/pharmacy/access), and IP-based rate limiting (Upstash Redis when available; fail-open on error).
- **Outcome:** Eliminates framework conflict, standardizes enforcement at the edge, and reduces operational surprises.

### Caching Strategy
- **Reads:** Short-lived Redis caches for admin analytics and listings.
- **Writes:** Targeted invalidation of related keys immediately after mutations to prevent stale dashboards.
- **Business effect:** Faster perceived performance with correctness preserved; lower load on Supabase during admin spikes.

---

## 4. Operational Toggles (Environment Variables)

For high-stakes operations, the system provides several "kill switches" and configuration toggles manageable via Vercel Environment Variables:

| Variable | Description | Default |
| :--- | :--- | :--- |
| `CRON_DISABLED` | Set to `true` to globally pause all automated order escalations and inventory releases. | `false` |
| `CRON_SECRET` | Required bearer token to authorize cron job execution via Vercel or GitHub Actions. | (Mandatory) |
| `ADMIN_PHONES` | Comma-separated list of phone numbers for critical system alerts (SMS). | (Optional) |
| `MAINTENANCE_MODE` | Set to `true` to redirect all traffic to a minimal maintenance page. | `false` |
