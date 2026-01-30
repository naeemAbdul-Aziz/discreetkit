## CSP Monitoring

- **What it is**: Content Security Policy (CSP) controls where scripts, styles, images, and frames can load from. In `report-only` mode, violations are not blocked; browsers send JSON reports describing what would have been blocked.
- **Where reports go**: When `CSP_REPORT_ONLY=1` is set, the app sends `Content-Security-Policy-Report-Only` with `report-uri /api/csp-report`. The endpoint at `/api/csp-report` logs structured violation details.
- **How to view**:
	- Local: run the app, reproduce a violation, and check server logs (look for `CSP Violation`).
	- Vercel: Project → Deployments → Logs; filter for `api/csp-report` and `CSP Violation`.
- **What a report means**: It includes fields like `effectiveDirective` (the rule that triggered), `blockedURI` (the resource), `documentURI` (page URL), and source location (file/line). Use these to whitelist needed sources or chase down unsafe inline code.
- **Triage steps**:
	- Group by `effectiveDirective` and `blockedURI` to identify top offenders.
	- Confirm the resource is required; if yes, add the host to the corresponding directive (e.g., `img-src`, `script-src`). If not, remove or fix the code.
	- Eliminate `'unsafe-inline'`/`'unsafe-eval'` gradually by moving inline scripts/styles to files and using nonces.
- **Optional integrations**:
	- Use a third-party collector (Report URI) by pointing `report-uri` to their endpoint.
	- Forward to Sentry by setting `SENTRY_DSN`; the `/api/csp-report` endpoint will capture a structured event with context and tags. Set alerts for spikes or payment domain blocks.

## Code Quality Gates (Jan 2026)

- **Lint:** Use ESLint v9 flat config. CI fails on any warnings (`--max-warnings=0`).
- **React rules (Dashboard):**
	- `react-hooks/exhaustive-deps`: error — include all referenced functions/values in deps.
	- `react-hooks/purity`: error — avoid impure operations in render.
	- `react-hooks/set-state-in-effect`: error — avoid synchronous setState in effect body; prefer event handlers or debounced callbacks.
- **Next.js conventions:** Use `next/link` and `next/image`; no raw `<a>` or `<img>` in app router.
- **TypeScript:** Strict mode enabled; `npm run typecheck` must pass.
- **PR checklist:** Ensure lint + typecheck + build succeed before merging.

### Patterns & Examples

- Debounced search should reset pagination inside the debounce callback, not via synchronous effect setState.
- Realtime subscriptions should include all referenced stable callbacks (e.g., `toast`) in effect deps.
- Escape unescaped entities in JSX to avoid rendering errors and SEO issues.

## Security & Performance

- **Security Headers:** See `next.config.ts` — CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy are set globally.
- **API Rate Limiting:** `src/proxy.ts` enforces 60 req/min/IP on `/api/*` using Upstash Redis (if env present). Webhooks are exempt.
- **Images Optimization:** `next.config.ts` allows remote patterns for Cloudinary/Unsplash et al; use `next/image` for responsive, optimized images.
- **Client Performance:** Debounce expensive actions; avoid synchronous `setState` in effects; prefer memoization for large lists; consider virtualization if lists exceed ~500 rows.
- **Admin/Pharmacy Dashboards:** Keep filters/search debounced; paginate aggressively; move heavy aggregation to server-side API or DB views with indexes.

### CSP Staging Toggle
- Set environment variable `CSP_REPORT_ONLY=1` to add a `Content-Security-Policy-Report-Only` header that removes `'unsafe-eval'` for staging validation.
- Keep production enforce policy unchanged; switch off by removing the env var.

### CI Build Cache
- CI uses `actions/cache` to restore/save `.next/cache` for faster builds; no app logic changes.

## Branch Protection & Merging

- **Protect `main`:** Prevent force pushes and deletion.
- **Require PRs:** Disable direct pushes to `main` for contributors; use PRs only.
- **Reviews:** Require at least 1 approval; require conversation resolution before merge; optionally require code owner review when `CODEOWNERS` exists.
- **Status checks:** Require passing `lint`, `typecheck`, and `build` GitHub Actions jobs before merging; require branches to be up to date with base.
- **Merge strategy:** Prefer squash merges for a clean history; optionally enforce linear history.
- **Admins:** Enforce for admins as well to avoid bypassing gates.

Implementation (GitHub UI): Settings → Branches → Branch protection rules → Add rule for `main`.
- Check: Require a pull request before merging (1 approval, dismiss stale reviews, require conversation resolution).
- Check: Require status checks to pass (select `lint`, `typecheck`, `build`; require branches up to date).
- Check: Include administrators; restrict who can push to matching branches (optional, e.g., only CI).
- Enable: Restrict deletions; prevent force pushes.

Optional: add `.github/CODEOWNERS` to route critical paths to reviewers (e.g., `src/app/(dashboard) @admins`).

# THE DISCREETKIT BRAND & OPERATING MODEL BIBLE

**For Internal Use & Partners**  
**Strictly Confidential**  
**Version 1.0**

---

## 1. WHO WE ARE (AND WHO WE ARE NOT)

**We are NOT a 'Medical Company'.**  
We do not diagnose patients. We do not manufacture drugs. We do not give prescriptions. **We do not stock or sell products.**

**We ARE a 'Privacy Infrastructure Company'.**  
We are a digital logistics platform. We sell dignity. We sell anonymity. We sell the ability for a young Ghanaian to take control of their health without fear of judgment.

When you design for us, write for us, or code for us, you are building **Trust**, not just a shop.

---

## 2. THE CORE PROBLEM: THE 'PHARMACY STARE'

Our entire business exists to solve one specific moment: The moment a young person walks into a pharmacy, asks for an HIV test or condom, and feels the entire room judging them.

That moment of shame prevents millions of cedis in sales and costs lives (15,000+ new HIV infections last year). We eliminate that moment.

**The Hidden Market:**  
There are 635,000+ tertiary students in Ghana. They need these products but won't buy them publicly. That is a **GHS 12.7 Million opportunity** walking away from pharmacies every year.

---

## 3. OUR OPERATING MODEL: 'THE UBER FOR PRIVACY'

We are an **asset-light logistics platform**. We do NOT hold inventory. We do NOT buy stock. We do NOT warehouse products. Here is the flow:

*   **Step 1 (The Hook):** Customer orders anonymously on our site. No account needed. No name required. No judgment.
*   **Step 2 (The Source):** We digitally route the order to a trusted Partner Pharmacy nearby. **They hold the stock; we hold the customer relationship.**
*   **Step 3 (The Fulfillment):** The pharmacy packs the item. We coordinate the pickup.
*   **Step 4 (The Delivery):** Our unbranded rider picks it up and delivers in **100% plain packaging**. No logos. No 'Health' stickers. No branding.
*   **Step 5 (The Value):** The customer receives it at their hostel/home. Their roommates/parents have no idea what it is. **That relief is what they pay for.**

**Why Asset-Light Wins:**

*   **Zero Inventory Risk:** We never buy stock upfront. Pharmacies hold inventory; we route demand.
*   **Infinite Scalability:** We can expand to 100 campuses without warehouses, trucks, or staff.
*   **Capital Efficiency:** Every cedi raised goes into customer acquisition and tech, not inventory.

---

## 4. WHAT WE SELL (AND HOW WE MAKE MONEY)

We sell **privacy as a service**. Our revenue comes from three streams:

*   **Product Margin:** We mark up the pharmacy price to cover logistics and platform costs.
*   **Delivery Fees:** Customers pay for the convenience of anonymous delivery.
*   **Partner Commissions:** Pharmacies pay us to access the 'invisible customers' who would never walk through their door.

We are NOT selling HIV tests. We are selling **the ability to order an HIV test without anyone knowing.**

---

## 5. DESIGN & VOICE GUIDELINES

*   **Visuals:** Clean, modern, clinical but warm. NO scary medical imagery (syringes, blood). NO overly sexual imagery. Use our Golden-Yellow heart/padlock logo to signify safety and trust.
*   **Voice:** Direct, non-judgmental, empathetic. We don't say 'infected'; we say 'reactive'. We don't say 'buy now'; we say 'get it discreetly'. We never shame; we empower.
*   **Privacy First:** Every pixel and every line of code must protect user identity. We delete order data after delivery. Customer anonymity is our core product feature.
*   **Packaging:** 100% unbranded. Plain brown or white boxes. No logos, no labels, no hints. If someone asks 'What's in the box?', the answer should be 'Could be anything.'

---

## 6. WHO WE SERVE

Our target is **18-30 year old Ghanaians**, primarily students and young professionals. They:

*   Live on their phones (digital natives).
*   Are sexually active but terrified of public judgment.
*   Have disposable income but no privacy.
*   Trust brands that respect their autonomy.

We serve the **'invisible customer'**—the person who needs the product but refuses to buy it publicly.

---

## 7. THE GOAL

We are not just delivering test kits. We are building the infrastructure that allows the next generation of Africans to access healthcare without stigma.

**If we win, we change the culture.** We normalize testing. We remove the shame. We save lives.

This is bigger than commerce. This is a movement.

---

## 8. FOR CONTRIBUTORS & PARTNERS

When you work with us, remember:

*   **We are NOT retailers.** We are a logistics and privacy platform.
*   **We do NOT compete with pharmacies.** We bring them customers they would never reach.
*   **Privacy is our moat.** If we lose customer trust, we lose everything.
*   **Speed matters.** The longer someone waits for their test, the more anxious they become. Fast delivery = better experience.

Your job is to protect the user's dignity at every touchpoint. That is the brand.

---

______________________________
{{DIRECTOR_NAME}}
CEO, {{COMPANY_NAME}}
