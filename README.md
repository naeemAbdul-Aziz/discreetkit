# DiscreetKit Ghana - Private Health Logistics

<div align="center">
  <img src="/public/logo.png" alt="DiscreetKit Logo" width="120" />
  <h3>Modernized Health Access for the Mobile-First Generation</h3>
  <p>Anonymity. Privacy. Quiet Confidence.</p>

  [![Build Status](https://github.com/naeemAbdul-Aziz/discreetkit/actions/workflows/build.yml/badge.svg)](https://github.com/naeemAbdul-Aziz/discreetkit/actions)
  [![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](https://opensource.org/licenses/MIT)
  [![Stack: Next.js 16](https://img.shields.io/badge/Stack-Next.js%2016-black.svg)](https://nextjs.org/)
</div>

---

## 🌟 Vision
DiscreetKit is a "Quiet Confidence" health-tech platform designed to provide private, anonymous access to essential health products (HIV/Pregnancy self-test kits) for students and young adults in Ghana. By merging **FAANG-standard operational intelligence** with an **Apple-level user experience**, we eliminate the social friction of healthcare access.

---

## ✨ Primary Pillars

### 1. Zero-Trust Anonymity Layer
*   **100% Anonymous Ordering**: No accounts, no identity storage, no footprint.
*   **Masked Communications**: Real-time SMS and WhatsApp updates using privacy-first masked identifiers.
*   **Partner Hub Ecosystem**: Specialized dashboards for clinical partners (e.g., UGMC) to manage large-scale ARV refills with zero-PII exposure.
*   **Automated Clinical Adherence**: 1-click WhatsApp check-ins and monthly refill reminders designed for long-term chronic care retention.

### 2. Hyperscale Operational Hub
*   **The "Anxiety Meter"**: Real-time North Star KPI measuring fulfillment velocity (AVG time from Order → Delivery).
*   **Privacy Density Analytics**: Geographic demand heatmaps powered by derived datasets (zero-bloat infrastructure).
*   **Live Operational Pulse**: SSE-powered monospaced ticker for real-time system heartbeat monitoring.
*   **Optimistic UX Engine**: Instant-action dashboard logic for Pharmacy nodes, achieving 2.3x faster operational throughput.

### 3. Conversational Commerce (WhatsApp Assistant)
*   **Mobile-First Storefront**: Full product discovery, cart management, and checkout entirely within WhatsApp.
*   **Ghost-Order Prevention**: Pre-payment database synchronization ensures 100% data integrity for mobile money transactions.

---

## 🛠 Tech Stack (Hyperscale Modernized)

*   **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) — Utilizing Server Actions, React 19 features, and Parallel Routes.
*   **Database**: [Supabase (PostgreSQL)](https://supabase.io/) — Real-time event engine with Row Level Security (RLS) isolation.
*   **UI/UX**: [Tailwind CSS](https://tailwindcss.com/) + [Framer Motion](https://framer.com/motion) — Custom glassmorphism and "Quiet Design" tokens.
*   **Processing**: [Firebase Genkit](https://firebase.google.com/docs/genkit) + [Google Gemini](https://ai.google.dev/) — Fact-based medical assistant with RAG (Retrieval-Augmented Generation).
*   **Messaging**: [Twilio (WhatsApp)](https://twilio.com) + [Arkesel (SMS)](https://arkesel.com).

---

## 🚀 Rapid Deployment

### 1. Prerequisites
- Node.js 20+
- Supabase Project
- Paystack / Arkesel Account (for production)

### 2. Initialization
```bash
git clone https://github.com/naeemAbdul-Aziz/discreetkit.git
cd discreetkit
npm install
```

### 3. Configuration
Copy `.env.example` to `.env.local` and populate:
```env
NEXT_PUBLIC_SUPABASE_URL="..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_KEY="..."
PAYSTACK_SECRET_KEY="..."
ARKESEL_API_KEY="..."
GEMINI_API_KEY="..."
CRON_SECRET="..."
```

### 4. Development Node
```bash
npm run dev
```

---

## 🗺️ Architectural Landmarks

| Logic Layer | Path | Description |
|:---|:---|:---|
| **Operational Intelligence** | `src/lib/admin-actions.ts` | Server-side metrics aggregation (Velocity, Density). |
| **Optimistic State** | `src/app/(dashboard)/pharmacy/dashboard/orders-list.tsx` | Instant-feedback UI logic for order management. |
| **Real-time Stream** | `src/app/api/admin/realtime/*` | SSE endpoints for live dashboard updates. |
| **Payment Webhooks** | `src/app/api/webhooks/paystack/route.ts` | Cryptographically verified payment synchronization. |
| **WhatsApp Brain** | `src/lib/whatsapp/manager.ts` | State machine governing conversational commerce. |

---

## ✅ Quality Gates (CI/CD)

Every commit is gated by strict quality checks:
- **Lint**: `npm run lint` (ESLint v9 flat config; fails on any warning)
- **Typecheck**: `npm run typecheck` (TypeScript strict mode)
- **Build**: `npm run build` (CI gate for compilation errors)

---

## 📜 Documentation Index
*   [Technical System Design](docs/technical/SYSTEM_DESIGN.md)
*   [Investor Briefings](docs/investor-reports/)
*   [SEO Implementation](docs/technical/SEO-README.md)
*   [WhatsApp Architecture](docs/technical/WHATSAPP_ARCHITECTURE.md)

---
<div align="center">
  <p>© 2026 DiscreetKit Ghana. All rights reserved.</p>
</div>
