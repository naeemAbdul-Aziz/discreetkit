# DiscreetKit — System Architecture & Engineering Standards
**Document:** DEV-03  
**Version:** 1.0  
**Last Updated:** May 2026  
**Series:** Developer Reference Manual

---

## 1. High-Level Architecture
DiscreetKit operates as a **Headless, Distributed Commerce System**. It decouples business logic (inventory, pricing, assignment algorithms) from the user interfaces (Web, Admin, Pharmacy, WhatsApp).

### The "Three-Pillar" Monorepo
The entire platform is built as a single **Next.js 16** repository utilizing Subdomain Routing. This approach eliminates code duplication by allowing all portals to share UI components (`/src/components`) and core utilities (`/src/lib`).

| Subdomain | Audience | Rendering Strategy | Primary Purpose |
|---|---|---|---|
| `discreetkit.com` | Anonymous Patients | Server-Side Rendering (SSR) | SEO-optimized e-commerce storefront. Fast initial load, high conversion. |
| `pharmacy.discreetkit.com` | Partner Pharmacies | Client-Side Rendering (CSR) | Real-time order fulfillment, inventory management. |
| `admin.discreetkit.com` | Founders / Ops | Client-Side Rendering (CSR) | Global command center, analytics, heavy data tables. |

---

## 2. Designing for Scale & Resilience

### 2.1 Stateless Serverless Functions
All API routes and Next.js Server Actions are designed to be stateless. This allows the hosting provider (Vercel) to scale the functions infinitely across edge networks without worrying about memory leaks or sticky sessions.

### 2.2 Redis & Rate Limiting
To protect the database from connection exhaustion and brute-force attacks, we utilize **Upstash Redis**:
*   **Token Bucket Algorithm:** Implemented in `src/proxy.ts`. Standard APIs are limited to 60 req/min, while sensitive routes (Auth/Admin) are throttled to 5 req/min.
*   **WhatsApp State Machine:** Redis acts as the high-speed temporary memory bank for the Twilio WhatsApp chatbot (`src/lib/whatsapp/manager.ts`), storing user session state (`BROWSING`, `CHECKOUT`) without hitting Postgres on every keystroke.

### 2.3 Asynchronous Processing (Cron Jobs)
We do not rely on user requests to trigger heavy operations. Background processes are managed via GitHub Actions executing specific API endpoints:
*   **`/api/cron/process-refills`**: Evaluates due dates for medication subscriptions.
*   **`/api/cron/check-escalations`**: Scans for stuck orders and fires SMS alerts.
*   **`/api/cron/release-reservations`**: Frees up tied inventory if a pharmacy fails to dispatch.

### 2.4 The "Push + Pull" Reconciliation Engine
We treat third-party webhooks (like Paystack) as unreliable.
1.  **Push:** Webhook receives payment success ➔ Marks order paid.
2.  **Pull (Self-Healing):** A cron job queries the DB for `pending_payment` orders older than 10 minutes, queries the Paystack API directly, and reconciles the state. This guarantees 99.99% revenue capture during network outages.

---

## 3. Security Engineering (The "Zero-Trust" Model)

### 3.1 Database: Row Level Security (RLS)
We do not rely solely on frontend or API logic to secure data. **Supabase PostgreSQL RLS** enforces access at the kernel level.
*   *Example:* If a developer accidentally writes `SELECT * FROM orders` in the Pharmacy portal, the Postgres engine intersects the query with the user's JWT and returns *only* the orders assigned to that specific `pharmacy_id`.

### 3.2 Gateway: The Proxy Pattern (`src/proxy.ts`)
Instead of standard middleware, our custom Proxy Gateway acts as the traffic cop:
*   **Subdomain Rewriting:** Silently rewrites requests based on the host header.
*   **Pre-Flight RBAC:** Checks the user's role *before* the React tree renders. A pharmacy user trying to hit `/admin` is intercepted and redirected at the edge.

### 3.3 Server-Side Price Verification
The client (`discreetkit.com`) calculates cart totals for UI display, but those numbers are **never trusted**. 
During the `createOrderAction`, the server fetches fresh prices from the database, applies delivery rules, and calculates the true `amountInKobo` sent to Paystack. Any client-side DOM tampering is neutralized.

### 3.4 Webhook Idempotency (Double-Spend Prevention)
Paystack occasionally fires the same webhook multiple times. We prevent "double fulfillment" using Redis locks:
1.  Compute key: `paystack:event:{REFERENCE_ID}`.
2.  Check Redis. If exists ➔ Return 200 OK, abort processing.
3.  If new ➔ Process order, Lock key for 24h.

### 3.5 Content Security Policy (CSP) & Headers
*   **CSP (`next.config.ts`):** A strict whitelist of domains allowed to execute scripts, eliminating Cross-Site Scripting (XSS) risks.
*   **Frame Busting:** `X-Frame-Options: SAMEORIGIN` prevents clickjacking attacks (embedding the store in malicious iframes).

---

## 4. Data Consistency

### 4.1 The Single Source of Truth
The schema definition in `supabase/migrations/20260401000000_consolidated_schema.sql` is the undisputed baseline. It contains all table definitions, extensions (pgcrypto, pg_trgm), Enums, and RLS policies. Manual edits to the Supabase UI are strictly prohibited; all changes must flow through migration files.

### 4.2 Centralized Server Actions
We strictly use Next.js Server Actions (`src/lib/actions.ts`, `src/lib/admin-actions.ts`, `src/lib/pharmacy-actions.ts`) for data mutation. This ensures that validation (via Zod), logging, and database transactions happen in a unified, testable environment rather than scattered across component files.

---

## 5. Maintainability & Code Quality

### 5.1 Strict Typing System
The project uses TypeScript extensively. The build pipeline runs `tsc --noEmit` on every commit.
*   **Benefit:** API response types are shared with the frontend. If a database column name changes and the type is updated, the frontend build fails immediately, preventing runtime `undefined` crashes in production.

### 5.2 CI/CD Pipeline
Deployments are automated but heavily gated.
1.  **Push** triggers GitHub Actions.
2.  **Verify:** Runs Linting, Typechecking, and Build tests.
3.  **Deploy:** Only upon passing all checks does Vercel promote the code to production.
This prevents "breaking production" with syntax errors.

### 5.3 Unified Design System
We enforce a rigid design language to maintain a premium feel across all three portals:
*   **Typography:** Satoshi font, bold weights, Title Case formatting (replacing shouty all-caps).
*   **Iconography:** Centralized `<Icon />` component utilizing Material Symbols. External icon libraries (like Lucide) are banned to reduce bundle bloat and ensure visual consistency.
*   **Components:** UI elements (Buttons, Inputs, Cards) are modularized in `src/components/ui/` using Tailwind CSS and `clsx/tailwind-merge` for predictable composition.
