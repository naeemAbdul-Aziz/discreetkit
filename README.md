### CSP Monitoring & Alerts

- Set `CSP_REPORT_ONLY=1` to enable `Content-Security-Policy-Report-Only` with reports sent to `/api/csp-report`.
- Optional alerts: add `SENTRY_DSN` (server-side) to forward CSP violations to Sentry.
- Verify headers:
    - Windows: `curl.exe -I https://<domain> | findstr /C:"Content-Security-Policy-Report-Only"`
- Generate a test report via DevTools to confirm logging.


# DiscreetKit Ghana - Confidential Health Products

This repository contains the source code for the DiscreetKit Ghana web application, a service designed to provide private, anonymous, and confidential health products (including self-test kits for HIV and pregnancy) to young people and students in Ghana.

## ✨ Key Features

*   **100% Anonymous Ordering:** No user accounts, names, or stored personal data.
*   **Private & Discreet Delivery:** All products are delivered in plain, unbranded packaging.
*   **Student Discount Program:** Automatic discounts for students when a valid campus location is selected.
*   **Secure Payments:** Integrated with Paystack for reliable and secure mobile money and card payments.
*   **AI-Powered Assistant:** An integrated chatbot ("Pacely") powered by Google's Gemini to answer user questions about products, privacy, and the process.
*   **Real-Time Order Tracking:** Users can track their order status with a unique, anonymous code.
*   **Smart Pharmacy Management:** Real-time inventory tracking, auto-dispatch, and reservation system.
*   **Supabase Backend:** Utilizes Supabase for database management and real-time updates.
*   **Built with Next.js 16 & ShadCN UI:** A modern, performant, and responsive user interface.

## 🚀 Getting Started

To run this project locally, you'll need to have Node.js and npm installed.

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd <repository-folder>
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root of your project and add the following environment variables.

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://xffvvxdtfsxfnkowgdzu.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZnZ2eGR0ZnN4Zm5rb3dnZHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NjEzNzcsImV4cCI6MjA3MjAzNzM3N30.YJafTn5uFrfVpaZWpa2OwS2AZsI_ul7bmm6lMTKsJ9A"
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZnZ2eGR0ZnN4Zm5rb3dnZHp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjQ2MTM3NywiZXhwIjoyMDcyMDM3Mzc3fQ.YnmKw7BIjl-oKDCbpQVZ60ZvzgNE4nj4EOh2lyGDf4A"

# Paystack (Replace with your own keys)
PAYSTACK_SECRET_KEY="your-paystack-secret-key"

# Arkesel SMS (Replace with your V2 API key from arkesel.com)
ARKESEL_API_KEY="your-arkesel-api-key"

# Arkesel SMS (Replace with your API key from arkesel.com)
ARKESEL_API_KEY="your-arkesel-api-key"
ARKESEL_SENDER_ID="DiscreetKit"

# Genkit (Google AI - Replace with your own key)
GEMINI_API_KEY="your-google-ai-api-key"

# Site URL (Production: discreetkit.com | Local: use ngrok for Paystack webhooks)
NEXT_PUBLIC_SITE_URL="https://discreetkit.com"
```

### 4. Set Up Ngrok for Local Development

To test the Paystack payment flow and webhooks locally, you need to expose your local server to the internet. We recommend using **ngrok**.

1.  **Install ngrok:** Follow the instructions at [ngrok.com](https://ngrok.com/download).
2.  **Start your Next.js app:**
    ```bash
    npm run dev
    ```
    Your app will be running on `http://localhost:3000`.
3.  **Start an ngrok tunnel:** In a new terminal window, run:
    ```bash
    ngrok http 3000
    ```
4.  **Update your `.env.local`:** Ngrok will give you a public URL (e.g., `https://random-string.ngrok-free.app`). Copy this HTTPS URL and set it as the value for `NEXT_PUBLIC_SITE_URL` in your `.env.local` file.
5.  **Restart your app:** Stop and restart the `npm run dev` process for the new environment variable to take effect.

### 5. Run the Development Server

Once the dependencies are installed and the environment variables are set, you can start the development server:

```bash
npm run dev
```

The application will now be accessible via your ngrok URL, and Paystack will be able to communicate with it correctly.

## 🛠 Tech Stack

*   **Framework:** [Next.js 16.0.7](https://nextjs.org/) (App Router)
*   **UI:** [React](https://reactjs.org/), [Tailwind CSS](https://tailwindcss.com/), [ShadCN UI](https://ui.shadcn.com/)
*   **Generative AI:** [Firebase Genkit](https://firebase.google.com/docs/genkit) with [Google's Gemini models](https://ai.google.dev/)
*   **Backend & Database:** [Supabase](https://supabase.io/)
*   **Payments:** [Paystack](https://paystack.com/)
*   **Notifications:** [Arkesel SMS](https://arkesel.com/)
*   **Deployment:** [Vercel](https://vercel.com/) / [Firebase App Hosting](https://firebase.google.com/docs/app-hosting)

## 📦 Deployment

This project is optimized for deployment on Vercel or Firebase App Hosting. Simply connect your Git repository and configure the environment variables in the hosting provider's dashboard. Remember to set `NEXT_PUBLIC_SITE_URL` to your actual production domain.

## 🧩 Admin Dashboard Data Integrity & Realtime

The admin dashboard pages (`/admin/dashboard`, `/admin/orders`, `/admin/products`, `/admin/partners`, `/admin/settings`) rely on:

- Server-side aggregation via the `orders` table (there is currently no dedicated `customers` table).
- Fallback identifier logic when `email` is missing (uses `phone_masked` then `code`).
- Server-Sent Events (SSE) endpoints under `/api/admin/realtime/*` that subscribe to changes on underlying tables.
- Partner management with pharmacy-user linking for pharmacy portal access.

### Customers Aggregation Changes

Previously, the Customers page grouped only by `email`, so orders without an email produced an empty list. The API route `src/app/api/admin/customers/route.ts` now:

- Selects `email`, `phone_masked`, and `code`.
- Chooses a stable `identifier` fallback (`email || phone_masked || code`).
- Aggregates totals, first/last order timestamps, and order counts.

### Performance Enhancements

Migration `20251107130000_customer_enhancements.sql` adds helpful indexes:

```sql
CREATE INDEX IF NOT EXISTS orders_email_idx ON public.orders(email);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON public.orders(created_at);
```

If you want a pure SQL approach later, uncomment the view definition inside that migration and update the API to query it directly (note: Realtime does not emit events for views—keep listening to `orders`).

### Realtime Flow

Each page sets up an SSE subscription and refetches its data on any relevant change:

- Orders: `/api/admin/realtime/orders`
- Products: `/api/admin/realtime/products`
- Customers: `/api/admin/realtime/customers` (listens to `orders` changes)

These SSE endpoints use the service role only in server code; the service key is never sent to the browser.

### Troubleshooting Empty Customers

1. Ensure new orders capture at least one of: `email`, `phone_masked`, or `code`.
2. Verify the migration ran (indexes speed up aggregation).
3. Confirm RLS policies allow the service role full access (policies included in schema migrations).
4. Check browser Network tab: `/api/admin/customers` should return JSON with `identifier` keys.

### Future Improvements

- Move aggregation to a SQL view with window functions for richer metrics (LTV, average order interval).
- Add pagination & sorting on the Customers page.
- Debounce SSE-triggered refetches if write volume becomes high.

## 📱 Mobile form zoom (iOS Safari) fixes

We prevent unwanted zoom when focusing inputs on iOS Safari:

- `layout.tsx` viewport meta adds `maximum-scale=1, user-scalable=no, interactive-widget=resizes-content` and `format-detection` to reduce auto-zoom and auto-linking.
- `globals.css` enforces `font-size: 16px` on `input/textarea/select` (Safari zooms when <16px) and introduces `.min-h-dvh` and `.vk-safe` helpers for better behavior with the virtual keyboard and safe-area insets.


## 💬 WhatsApp Conversational Commerce (New)

The system now features a "FAANG-level" WhatsApp Assistant (`src/lib/whatsapp/`) that serves as a full mobile storefront.

### 🌟 Key Capabilities
- **Conversational Commerce**: Users can browse categories, view products, and add to cart directly within WhatsApp.
- **Instant Checkout**: Generates secure **Paystack** payment links.
- **Real-Time Order Tracking**: Users can reply with their Order Code (e.g., `DK-WA-123456`) to get live status updates from the database.
- **Partner Care Portal**: A verified gated experience for partners to unlock exclusive services using a specialized access code.

### 🔧 Architecture & Innovations
- **Virtual Buttons (Trial Compatible)**: To bypass Twilio Trial limitations, we implemented a smart "Numbered List" system where the bot maps user input (e.g., "1") to dynamic session IDs.
- **Ghost-Order Prevention**: The bot creates a `pending_payment` order in Supabase *before* generating the payment link, ensuring 100% data integrity when the Paystack webhook fires.
- **Unified Session Brain**: Uses **Upstash Redis** to maintain user state (Cart, Last Interaction) with a 24h TTL.

### 🔗 Integration Flow
1. **User** replies "Buy" -> **Bot** creates DB Order -> **Bot** sends Paystack Link.
2. **User** pays -> **Paystack** calls Webhook -> **Webhook** matches Order Code -> **Webhook** updates Order to "Received" -> **Admin Dashboard** updates instantly via Realtime.

For deep technical details, see [src/lib/whatsapp/README.md](src/lib/whatsapp/README.md).

## 🛠 Tech Stack

*   **Framework:** [Next.js](https://nextjs.org/) (App Router)
*   **UI:** [React](https://reactjs.org/), [Tailwind CSS](https://tailwindcss.com/), [ShadCN UI](https://ui.shadcn.com/)
*   **Generative AI:** [Firebase Genkit](https://firebase.google.com/docs/genkit) with [Google's Gemini models](https://ai.google.dev/)
*   **Backend & Database:** [Supabase](https://supabase.io/)
*   **State Management:** [Upstash Redis](https://upstash.com/) (for WhatsApp Sessions)
*   **Messaging:** [Twilio](https://www.twilio.com/) (WhatsApp API)
*   **Payments:** [Paystack](https://paystack.com/)
*   **Notifications:** [Arkesel SMS](https://arkesel.com/)
*   **Deployment:** [Vercel](https://vercel.com/)

## 📦 Deployment & Setup

This project is optimized for deployment on Vercel.

### Required Environment Variables
Ensure the following are set in Vercel for the WhatsApp Bot to function:
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- `PAYSTACK_SECRET_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`

## ✅ Quality Gates

- Lint: `npm run lint` (ESLint v9 flat config; CI fails on any warnings)
- Typecheck: `npm run typecheck` (TypeScript strict mode)
- Build: `npm run build` (CI build gate to catch compile errors)

### React Rules Enforced (Dashboard)
- `react-hooks/exhaustive-deps`: error
- `react-hooks/purity`: error
- `react-hooks/set-state-in-effect`: error
- `react-hooks/error-boundaries`: error (segment error boundaries via `src/app/(dashboard)/error.tsx`)

### Example Patterns
- Move pagination resets inside debounced callbacks (not synchronous effects).
- Include stable references (e.g., `toast`) in effect deps for realtime subscriptions.
- Avoid try/catch around JSX; rely on Next.js `error.tsx` for rendering errors.

## 🔒 Branch Protection & Merging

- Protect `main` with branch rules: require PRs, 1 approval, and conversation resolution.
- Require status checks: `lint`, `typecheck`, `build` and branch up-to-date.
- Prevent force pushes and deletions; enforce for admins; prefer squash merges.

## 🛡 Middleware → Proxy (Next.js 16)

- Use `src/proxy.ts` for middleware behavior (auth, subdomain rewrites, rate limits).
- Remove `src/middleware.ts` to avoid conflicts; build expects proxy only.
- Rate limiting: IP-based, Upstash Redis-backed if env present; fails open on error.

## 🗺 Sitemap & Robots

- `src/app/sitemap.ts` generates dynamic product URLs when `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_KEY` exist; otherwise falls back to static categories.
- `src/app/robots.ts` defines crawl rules and points to `/sitemap.xml`.
- For CI builds without Supabase envs, sitemap still prerenders successfully (static fallback). To include products in CI, add Supabase envs to CI.

## 🔏 CSP Hardening (Staged)

- Recommended next: remove `'unsafe-eval'` from `script-src` and use `Content-Security-Policy-Report-Only` to validate stricter rules before enforcing.
- Keep `'unsafe-inline'` in `style-src` for now; evaluate nonce/hashes for scripts after report-only verification.

