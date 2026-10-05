# DiscreetKit — Engineering Audit Report

> Raw technical facts extracted from codebase. No interpretation. No filler.

---

## 1. SYSTEM ARCHITECTURE

### Structural Decisions

- **Framework & Runtime:** Next.js 16 utilizing the App Router and Turbopack for compilation.
- **Routing & Access Control:** Custom Edge Proxy Middleware (`src/proxy.ts`) implementing multi-tenant subdomain routing (`admin.*`, `pharmacy.*`, `access.*`, and main site) directly at the Edge.
- **Security & Protection:** Distributed, IP-based API rate-limiting handled via Upstash Redis at the Edge (throttled to 10 req/60s for standard APIs and 5 req/300s for Auth/Admin routes).
- **Database Architecture:** PostgreSQL powered by Supabase, structured around distinct schemas for `roles`, `store_settings`, `categories`, `pharmacies` (partner hubs), `products`, and `pharmacy_products` (inventory tracking).

---

## 2. CORE ENGINEERING — TWO MOST COMPLEX PROBLEMS

### Problem 1: Cross-Subdomain Session Persistence & Proxy Rewrites

**File:** `src/proxy.ts`

- Engineered secure cookie persistence and synchronization across Next.js proxy redirects and rewrites.
- Enables seamless authenticated transitions between the main site, pharmacy portal, and admin dashboards without breaking session state.
- Preserves return URLs via search params (`?redirect_to=`) for post-login redirection across subdomains.

### Problem 2: Edge-Level Role-Based Access Control (RBAC)

**File:** `src/proxy.ts`

- Built an Edge middleware layer that intercepts requests and securely extracts user roles from Supabase SSR before rendering.
- Dynamically maps and redirects users to highly restricted domain partitions based on whitelist policies (e.g., `ADMIN_EMAIL_WHITELIST`) and role permissions.
- Prevents lateral traversal by enforcing strict isolation between `admin` and `pharmacy` roles, routing unauthorized attempts to a fallback page.

---

## 3. TOOLING & INTEGRATION

### Frontend Dependencies

| Tool                  | Purpose                                  |
| --------------------- | ---------------------------------------- |
| Next.js 16            | App Router, Server Components, Turbopack |
| React 18              | UI library                               |
| Tailwind CSS          | Styling                                  |
| Framer Motion         | Declarative animation                    |
| Zustand               | Global state management                  |
| Radix UI              | Accessible component primitives          |
| React Hook Form + Zod | Form management & validation             |

### Backend / Infrastructure

| Tool                  | Purpose                                     |
| --------------------- | ------------------------------------------- |
| Supabase SSR          | Edge-compatible Authentication              |
| Supabase (PostgreSQL) | Primary database                            |
| Upstash Redis         | Distributed rate limiting                   |
| OpenAI                | AI integration                              |
| Resend                | Transactional & waitlist email broadcasting |
| Sentry                | Application monitoring                      |

---

## 4. QUANTIFIABLE METRICS

### Database Schema

- **Tables Managed:** `roles`, `store_settings`, `categories`, `pharmacies` (partner hubs), `products`, and `pharmacy_products` (inventory tracking).
- **Pre-seeded Entities:** UGMC Partner Hub configured with `ART Clinic Pharmacy` and multiple ART Refill product SKUs initialized with inventory mapping.

### API & Routes

- **API route files:** 29 individual serverless API endpoints/routes.
- **Edge Middleware:** 1 custom proxy middleware module handling all routing permutations.

### React Components

- **Total distinct modular components:** 92 React components built.

### Codebase Size

- **Total source files:** 313 files within the `src/` directory.

### Repository History

- **Total Commits:** 1,665 commits.
- **Pull Requests Merged:** 195 PRs integrated.
