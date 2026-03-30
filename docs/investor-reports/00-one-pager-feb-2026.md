# DiscreetKit Investor One-Pager — March 2026

**What We Do**
- Privacy-first health commerce: anonymous ordering, discreet delivery, youth-friendly care.
- Omnichannel: Web Storefront + WhatsApp assistant powered by a shared backend.

**Why We Win**
- Stigma arbitrage: we remove the social friction of in-person purchases.
- Asset-light logistics: pharmacy-owned "virtual fleet" riders; no bike capex.
- Category creator: trusted, anonymous SRH access for students and young adults.
- Operational Intelligence: proprietary "Anxiety Meter" and "Privacy Density" metrics that quantify trust infrastructure — not vanity metrics.

**Recent Upgrades (March 2026 — FAANG-Level Sprint)**
- **Premium Consumer UX:** Checkout fully redesigned as a 2-step progressive flow (Delivery → Contact & Summary) with Framer Motion animation, warm-grey (`#f5f5f1`) inputs, and ultra-rounded card system inspired by Everlywell and Apple.
- **Operational Intelligence Dashboard:** Admin Command Center now surfaces three intentional, zero-bloat operational metrics derived entirely from existing order data — no additional DB calls or dependencies:
  - *Anxiety Meter:* Average fulfillment velocity (received → shipped). The North Star trust metric.
  - *Live Operational Pulse:* Monospaced real-time event ticker powered by existing SSE infrastructure.
  - *Privacy Density:* Area chart of regional anonymity demand by campus/location hotspot.
- **FAANG Rankings:** Top Pharmacies / Top Products tables now show relative horizontal performance bars scaled to the #1 performer, `TOP` / `VELOCITY` insight badges, and monospace primary values.
- **Zero-Bloat Engineering:** All new dashboard metrics derived from the existing `orders` + `order_events` dataset. Zero new database tables, zero additional API calls, zero extra dependencies.

**Earlier Q1 2026 Upgrades (Cumulative)**
- Security: Database RLS enforced for pharmacies and riders; server-side ownership checks for cross-tenant safety; optional UPDATE policy for orders when enabling client writes.
- Reliability: Idempotent order updates prevent duplicate SMS and noisy event logs; escalation auto-detection with SMS alerts to admin.
- Observability: Sentry telemetry on order transitions, notification attempts, and exceptions; structured logs for faster MTTR.
- Quality Gates: Zero-warning lint, strict TypeScript typecheck, production build gating; Vitest lifecycle tests; branch-protected CI/CD.

**Compliance & Privacy**
- Data minimization: no accounts required; masked identifiers; anonymous subscriptions.
- Secure payments: Paystack (PCI Level 1); verified webhooks and daily reconciliation.
- Privacy-by-architecture: Riders see pickup/drop-off only; pharmacies see packing list without PII.

**Traction Signals (Internal Ops Readiness)**
- **Maturity:** 7+ months of continuous R&D yielding v1.1 with FAANG-level UI and operational intelligence.
- Hardened scheduled ops: escalation checks, inventory auto-release, daily reconciliation.
- Consumer trust: Premium checkout UX (Everlywell-inspired) + Apple-aesthetic success page with monospaced tracking codes.
- Governance: Protected main branch, required PR checks, atomic deploys; CI/CD on backend branch.

**Business Impact**
- Lower incident rate and faster MTTR → protects SLAs and brand trust.
- Fulfillment Velocity (the "Anxiety Meter") is now a trackable KPI — directionally tied to user retention and trust.
- Campus Privacy Density chart identifies where to deploy next pharmacy node — data-driven geographic expansion strategy.
- Reduced SMS/ops waste via idempotency → direct opex savings.
- Premium checkout UX reduces drop-off friction at the critical payment conversion step.

**90-Day Roadmap**
- Testing: expand Vitest integration coverage; add Playwright e2e for pharmacy flows.
- Growth: campus cluster rollout (UG, UPSA, Wisconsin, GIMPA); curated "Student Kits."
- Partnerships: formalize UGMC, Marie Stopes, and a lab network for end-to-end care.
- Analytics: lightweight cohort dashboards; re-order rate tracking (the "Retention Loop").

**What We Need**
- Pre-seed: $100k–$200k to scale campus clusters, deepen partnerships, and expand the logistics mesh.
- Use of funds: partner onboarding, inventory float for bundles, growth ops, QA/analytics.

**Why Now**
- Market timing: rising digital health adoption; underserved youth segment with clear willingness to pay for privacy and convenience.
- Defensible moat: pharmacy network, privacy trust, operational intelligence, and engineering discipline difficult to replicate quickly.
