# DiscreetKit Investor One-Pager — Feb 2026

**What We Do**
- Privacy-first health commerce: anonymous ordering, discreet delivery, youth-friendly care.
- Omnichannel: Web Storefront + WhatsApp assistant powered by a shared backend.

**Why We Win**
- Stigma arbitrage: we remove the social friction of in-person purchases.
- Asset-light logistics: pharmacy-owned “virtual fleet” riders; no bike capex.
- Category creator: trusted, anonymous SRH access for students and young adults.

**Recent Upgrades (FAANG-Level Hygiene)**
- Security: Database RLS enforced for pharmacies and riders; optional UPDATE policy for orders when enabling client writes; server-side ownership checks for cross-tenant safety.
- Reliability: Idempotent order updates prevent duplicate SMS and noisy event logs; stable dashboards via shared table layout and isolated button loading states.
- Observability: Sentry telemetry on order status transitions, notification attempts, and exceptions; structured logs for faster MTTR.
- Quality Gates: Zero-warning lint, strict TypeScript typecheck, production build gating; Vitest added for lifecycle tests.

**Compliance & Privacy**
- Data minimization: no accounts required; masked identifiers; anonymous subscriptions.
- Secure payments: Paystack (PCI Level 1); verified webhooks and reconciliation path.
- Privacy-by-architecture: Riders see pickup/drop-off only; pharmacies see packing list without PII.

**Traction Signals (Internal Ops Readiness)**
- **Maturity:** 6 months of continuous R&D yielded a v1.0 with FAANG-level stability.
- Hardened scheduled ops: escalation checks, inventory auto-release, daily reconciliation.
- Partner UX: pharmacy dispatch API auto-generates tracking links; secure rider registry with per-pharmacy RLS.
- Governance: Protected main branch, required PR checks, atomic deploys.

**Business Impact**
- Lower incident rate and faster recovery → protects SLAs and brand trust.
- Reduced SMS/ops waste via idempotency → direct opex savings.
- Stable partner workflows → faster order processing, better NPS and repeat rate.

**90-Day Roadmap**
- Testing: expand Vitest integration coverage; add Playwright e2e for pharmacy flows.
- Growth: campus cluster rollout (UG, UPSA, Wisconsin, GIMPA); curated “Student Kits.”
- Partnerships: formalize UGMC, Marie Stopes, and a lab network for end-to-end care.
- Analytics: lightweight cohort dashboards; privacy-preserving demand heatmaps.

**What We Need**
- Pre-seed: $100k–$200k to scale campus clusters, deepen partnerships, and expand logistics mesh.
- Use of funds: partner onboarding, inventory float for bundles, growth ops, QA/analytics.

**Why Now**
- Market timing: rising digital health adoption; underserved youth segment with clear willingness to pay for privacy and convenience.
- Defensible moat: pharmacy network, privacy trust, and operational discipline difficult to replicate quickly.
