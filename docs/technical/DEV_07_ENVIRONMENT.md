# DiscreetKit — Environment & Deployment Guide
**Document:** DEV-07  
**Version:** 1.0  
**Last Updated:** May 2026  
**Series:** Developer Reference Manual

---

## 1. Local Development Environment

### 1.1 Environment Variables (`.env.local`)
To run DiscreetKit locally, you must configure the following variables. Do not commit this file.

```env
# --- Supabase Configuration ---
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ey...
SUPABASE_SERVICE_ROLE_KEY=ey... # Required for Server Actions bypassing RLS

# --- Proxy & Routing ---
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_ADMIN_URL=http://admin.localhost:3000
NEXT_PUBLIC_PHARMACY_URL=http://pharmacy.localhost:3000
NEXT_PUBLIC_COOKIE_DOMAIN=localhost # Required for cross-subdomain sessions

# --- Paystack (Payments) ---
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_...
PAYSTACK_SECRET_KEY=sk_test_...

# --- Upstash Redis (Rate Limiting & WhatsApp State) ---
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# --- Twilio (WhatsApp) ---
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_NUMBER=+14155238886 # Sandbox or live number

# --- Communications ---
ARKESEL_SMS_API_KEY=v3_...
RESEND_API_KEY=re_...
```

### 1.2 Local Subdomain Routing
DiscreetKit uses Next.js middleware (`src/proxy.ts`) to handle subdomain routing.
To test this locally on Windows, you must edit your hosts file (`C:\Windows\System32\drivers\etc\hosts`) to map subdomains to `localhost`:

```text
127.0.0.1 localhost
127.0.0.1 admin.localhost
127.0.0.1 pharmacy.localhost
```
Run the app using `npm run dev` and access `http://admin.localhost:3000`.

---

## 2. Production Deployment (Vercel)

DiscreetKit is designed to deploy seamlessly to Vercel.

### 2.1 Domain Configuration
1.  Add your primary domain (`discreetkit.com`) in the Vercel dashboard.
2.  Add Wildcard Domains (`*.discreetkit.com`) to allow the proxy to catch `admin.` and `pharmacy.`.
3.  Ensure your DNS provider (e.g., Cloudflare, Route53) has a CNAME record for `*` pointing to Vercel.

### 2.2 Production Environment Variables
Set the exact variables from `.env.local` in the Vercel Project Settings, but ensure the URLs point to production:
```env
NEXT_PUBLIC_SITE_URL=https://discreetkit.com
NEXT_PUBLIC_ADMIN_URL=https://admin.discreetkit.com
NEXT_PUBLIC_PHARMACY_URL=https://pharmacy.discreetkit.com
NEXT_PUBLIC_COOKIE_DOMAIN=.discreetkit.com
```
*Note the leading dot on the cookie domain. This is critical for authentication sessions to persist across subdomains.*

### 2.3 Cron Jobs
Vercel handles cron jobs automatically via the `vercel.json` file in the project root.
```json
{
  "crons": [
    {
      "path": "/api/cron/process-refills",
      "schedule": "0 0 * * *"
    },
    {
      "path": "/api/payments/reconcile",
      "schedule": "*/10 * * * *"
    }
  ]
}
```
You must set a `CRON_SECRET` environment variable in Vercel. Vercel automatically passes this in the `Authorization: Bearer <token>` header when executing the crons.

---

## 3. Database Management (Supabase)

### 3.1 Migrations
Never edit the production database schema manually via the Supabase UI.
All changes must be made via SQL migration files.
1. `supabase db diff -f my_new_feature`
2. `supabase db push`

### 3.2 Row Level Security (RLS)
Ensure RLS is enabled on all new tables by default. If a background worker (like the auto-assignment engine) needs to bypass RLS, ensure you are initializing the Supabase client using the `SUPABASE_SERVICE_ROLE_KEY` (e.g., `getSupabaseAdminClient()`), NOT the standard anon key.
