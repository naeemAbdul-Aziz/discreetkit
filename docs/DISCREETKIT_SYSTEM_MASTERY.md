# DiscreetKit System Mastery: A Deep Dive

**Version:** 1.0  
**Date:** February 2026  
**Target Audience:** Engineering Team & Technical Founders

---

## 1. Top-Level Architecture
DiscreetKit is not just a "website"; it is a **Distributed Commerce System** operating a "Headless" architecture. We decouple the *logic* (inventory, pricing, routing) from the *interface* (Web, WhatsApp, Admin Dashboard).

### The "Three-Pillar" Monorepo
We use a single Next.js 16 repository to serve three distinct applications via **Subdomain Routing**. This reduces code duplication by sharing UI components (`/src/components`) and utilities (`/src/lib`).

| Subdomain | Audience | Purpose | Tech Feature |
| :--- | :--- | :--- | :--- |
| `discreetkit.com` | Patients | E-commerce Storefront | SEO-heavy, Server-Side Rendering (SSR) |
| `admin.discreetkit.com` | Founders | Global Command Center | Client-Side Rendering (CSR), Data-heavy |
| `pharmacy.discreetkit.com` | Partners | Order Fulfillment | Real-time Sockets, Audio Alerts |

---

## 2. Infrastructure & "The Nervous System"

### A. The Proxy Pattern (`src/proxy.ts`)
Instead of standard middleware, we use a custom **Proxy Gateway**. This file is the "Traffic Cop" of our entire infrastructure.
*   **Subdomain Rewriting:** It detects `admin.discreetkit.com` and silently rewrites the internal request to `/src/app/(dashboard)/admin` without changing the URL bar. This gives the illusion of a separate app.
*   **Centralized RBAC:** It checks user roles *before* the request hits the page. A pharmacy user trying to access the Admin dashboard is bounced instantly.
*   **Rate Limiting:** We use **Upstash Redis** (via a Token Bucket algorithm) to throttle standard APIs (60 req/min) differently from Auth APIs (5 req/min) to prevent brute-force attacks.

### B. The Database Strategy (Supabase + RLS)
We do **not** rely on application-level logic to secure data. we use **Row Level Security (RLS)** in the Postgres kernel.
*   **Why?** If a developer accidentally writes `select * from orders` in the Frontend, RLS ensures the query returns *only* the orders belonging to that specific user or pharmacy.
*   **SafetyNet:** Even if our API is compromised, the database itself will reject unauthorized access.

### C. The "Hybrid Router" (WhatsApp Engine)
Located in `src/lib/whatsapp/manager.ts`.
*   **Concept:** WhatsApp is treated as a "Dumb Terminal." The server holds the state (`BROWSING`, `CHECKOUT`, `VIEWING_PRODUCT`).
*   **Mechanism:** When a user types "1", the server checks the User Session (Redis/DB) to see what "Menu 1" corresponds to in their current context.
*   **Innovation:** We inject a "Virtual Browser" into the chat. Users can browse products, add to cart, and checkout without ever leaving WhatsApp, using a State Machine to track their journey.

---

## 3. Engineering For Resilience (The "Amazon" Standard)

### A. Idempotency (The "Double-Spending" Fix)
**Problem:** Paystack/banks sometimes send the same webhook twice (e.g., "Payment Success").
**Solution (`src/app/api/webhooks/paystack`):**
1.  Compute a unique key: `paystack:event:{REFERENCE_ID}`.
2.  Check Redis: "Have I seen this key in the last 24h?"
3.  **If Yes:** Return 200 OK immediately and do nothing.
4.  **If No:** Process the order and Lock the key.

### B. The "Push + Pull" Reconciliation
We don't trust Webhooks 100%. We run a **Cron Job** (GitHub Actions -> `/api/payments/reconcile`) every 10 minutes.
*   It asks the DB: *"Show me pending orders older than 10 mins."*
*   It asks Paystack: *"Did this actually pass?"*
*   This self-healing mechanism ensures 99.99% revenue capture, even during internet outages.

### C. Zero-Trust Security Headers (`next.config.ts`)
We implement a strict **Content Security Policy (CSP)**.
*   **Benefit:** Even if a hacker injects a script into our site (XSS), the browser will refuse to run it because it's not on our `script-src` whitelist.
*   **Frame Busting:** `X-Frame-Options: SAMEORIGIN` prevents Clickjacking (other sites embedding our store in a hidden iframe).

---

## 4. Performance & Frontend Mastery

### A. The "App-Like" Feel
*   **Magnetic Cursor:** A subtle Micro-interaction (`src/components/ui/cursor.tsx`) that snaps to interactive elements, subconsciously signaling "Premium Quality."
*   **Lazy Loading:** We use `dynamic()` imports for heavy modules (like the Map or huge JSON data) so the initial page load stays under 100KB.
*   **Font Optimization:** We use `next/font/local` with `swap` display to prevent Layout Shift (CLS), ensuring text is visible instantly.

### B. SEO Engineering
We don't just "add meta tags." We inject complex **JSON-LD Structured Data** (`src/lib/seo`).
*   **MedicalBusiness Schema:** Tells Google we are a licensed health service.
*   **Product Schema:** Enables "Rich Snippets" (Price, Rating, Availability) directly in Google Search results.

---

## 5. Software Engineering Practices

### A. Type Safety System
We run `tsc --noEmit` on every commit. This means:
*   You cannot ship code if you try to access `order.unknown_field`.
*   The API response types are shared with the Frontend. If the Backend changes a field name, the Frontend build fails immediately, preventing runtime crashes.

### B. CI/CD Pipeline (`.github/workflows`)
We don't deploy manually.
1.  **Push:** Code is pushed to GitHub.
2.  **Verify:** GitHub Actions runs Linting, Typechecking, and Build Verification.
3.  **Deploy:** Only if all checks pass, Vercel promotes the new version.
*   **Safety:** This prevents "breaking production" with syntax errors.

---

## 6. How to Read This Codebase
*   **Start at `src/app/layout.tsx`:** See the global providers (Toast, Analytics).
*   **Go to `src/proxy.ts`:** Understand how requests are routed.
*   **Check `src/lib/supabase/`:** See the raw data access patterns.
*   **Read `src/lib/whatsapp/manager.ts`:** Understand the complex state logic for the bot.

This architecture was chosen to balance **Speed of Iteration** (Next.js) with **Enterprise Rigor** (RLS, CSP, Idempotency). It is "Overkill" for a blog, but "Minimum Viable" for a Health-Fintech platform.
