## Cron Jobs: Operations Guide

This guide documents our scheduled operational tasks, their workflows, authentication, local testing steps, and troubleshooting tips. It reflects the hardened configuration now in place.

### Summary
- Fifteen‑minute cron: checks escalations and releases stale reservations.
- Daily reconcile: verifies payments and updates order status.
- Authentication: Bearer `CRON_SECRET` for cron endpoints; reconcile uses `x-cron-key` with the same secret.
- Redirects: All workflow calls use `-L` to follow 3xx responses.
- Reliability: Retries with backoff; concurrency guards to prevent overlap.

### Workflows

#### 15‑Minute Cron
- Purpose: Operational hygiene — alert on stalled orders and free expired reservations.
- Calls:
  - `POST /api/cron/check-escalations` — sends admin SMS alerts, logs an internal `Escalation Alert` event.
  - `POST /api/cron/release-reservations` — releases reservations older than our threshold; logs events.
- Key flags (in GitHub Actions):
  - Validate required secrets before run.
  - Install `curl` if missing; use `-L`, `--retry 5`, `--retry-connrefused`, `--max-time 60`.
  - Concurrency guard to cancel in‑progress duplicates.

#### Daily Reconcile
- Purpose: Verify third‑party payment references and reconcile orders.
- Call:
  - `POST /api/payments/reconcile` — validates provider refs (e.g., Paystack) and logs payment events.
- Key flags: Same hardened `curl` settings; header `x-cron-key: <CRON_SECRET>`.

### Endpoints & Auth

- `POST /api/cron/check-escalations`
  - Auth: `Authorization: Bearer <CRON_SECRET>`.
  - Side effects: Admin SMS to `ADMIN_PHONES`; internal event log (hidden from client views).

- `POST /api/cron/release-reservations`
  - Auth: Accepts Vercel Cron header or `Authorization: Bearer <CRON_SECRET>`.
  - Side effects: Frees stale reservations; event logs for traceability.

- `POST /api/payments/reconcile`
  - Auth: `x-cron-key: <CRON_SECRET>` header.
  - Side effects: Verifies payment refs, updates status, logs payment events.

### Secrets & Configuration

- GitHub Actions:
  - `SITE_URL` — e.g., `https://discreetkit.com` (used by workflow calls).
  - `CRON_SECRET` — must match the application’s secret below.
- Vercel project env:
  - `CRON_SECRET` — exact same value as GitHub; rotate together.
  - `ADMIN_PHONES` — comma‑separated list of admin phone numbers for SMS alerts (use canonical formatting).

Notes:
- If `CRON_SECRET` differs between GitHub and Vercel, endpoints will return `401 Unauthorized`.
- After changing env vars on Vercel, redeploy to ensure server routes read updated values.

### Local Testing (PowerShell)

Set your secret for the session:

```powershell
$env:CRON_SECRET = "YOUR_SECRET_VALUE"
```

Check escalations:

```powershell
curl.exe -sS -L -X POST "https://discreetkit.com/api/cron/check-escalations" \
  -H "Authorization: Bearer $env:CRON_SECRET"
```

Release reservations:

```powershell
curl.exe -sS -L -X POST "https://discreetkit.com/api/cron/release-reservations" \
  -H "Authorization: Bearer $env:CRON_SECRET"
```

Daily reconcile:

```powershell
curl.exe -sS -L -X POST "https://discreetkit.com/api/payments/reconcile" \
  -H "x-cron-key: $env:CRON_SECRET"
```

Expected: `200 OK` for successful runs; response bodies contain summary counts.

### Troubleshooting

- Exit code `127` in GitHub Actions:
  - Cause: `curl` missing on the runner.
  - Fix: Ensure workflow step installs `curl` (Ubuntu: `apt-get update && apt-get install -y curl`).
- `401 Unauthorized` from endpoints:
  - Cause: Secret mismatch or missing header.
  - Fix: Align `CRON_SECRET` between GitHub and Vercel; confirm headers (`Authorization: Bearer …` or `x-cron-key`).
- 3xx responses (`301/302`) then failure:
  - Cause: Redirect not followed.
  - Fix: Add `-L` to `curl` to follow redirects.
- Intermittent `5xx` or network errors:
  - Fix: Use `--retry` with backoff and `--retry-connrefused`; set `--max-time` to bound execution.
- Overlapping runs / duplicated work:
  - Fix: Ensure concurrency settings cancel in‑progress duplicates in the workflow.

### Maintenance

- Admin phones: Update `ADMIN_PHONES` in Vercel; verify formatting and test via the admin SMS test endpoint.
- Secret rotation: Rotate `CRON_SECRET` in both places (GitHub + Vercel) and redeploy; validate via local tests above.
- Client visibility: Internal events like `Escalation Alert` are filtered out of client order history by design.

### Change Log (Ops)

- Hardened GitHub Actions with secret validation, `curl` install, `-L`, retries, and concurrency guards.
- Split daily payments reconcile into its own workflow and standardized auth via `x-cron-key`.
- Endpoints accept Bearer secret; redirects handled; admin SMS alerts wired to `ADMIN_PHONES`.

# Cron Jobs & Scheduled Tasks

This document describes the scheduled jobs and how to configure and test them.

## Workflows

- 15-minute cron: `.github/workflows/crons.yml`
  - Calls `/api/cron/check-escalations` and `/api/cron/release-reservations`
  - Concurrency guard and retry loops added
- Daily payments reconcile (05:00 UTC): `.github/workflows/daily-reconcile.yml`
  - Calls `/api/payments/reconcile` in batches

## Required Secrets (GitHub Actions)

- `SITE_URL` — e.g. `https://discreetkit.com`
- `CRON_SECRET` — shared bearer token used by server endpoints

## Server Environment (Vercel)

- `ADMIN_PHONES` — comma-separated E.164 numbers for admin SMS alerts (e.g. `+233203001107,+233550069924`)
- `ARKESEL_API_KEY`, `ARKESEL_SENDER_ID` — SMS provider configuration
- `CRON_SECRET` — must match the GitHub Actions secret value

## Endpoints

- Escalations: `GET /api/cron/check-escalations` — requires `Authorization: Bearer <CRON_SECRET>`
- Release reservations: `GET /api/cron/release-reservations` — allows Vercel Cron or bearer secret
- Payments reconcile: `GET /api/payments/reconcile` — requires `x-cron-key: <CRON_SECRET>`
- Admin SMS test: `GET /api/cron/test-admin-sms?msg=Hello` — requires bearer secret, sends to `ADMIN_PHONES`

## Testing

Windows PowerShell:
```powershell
$env:CRON_SECRET = '<your-cron-secret>'
$env:SITE_URL    = 'https://discreetkit.com'
# Escalations
curl.exe --fail -H "Authorization: Bearer $($env:CRON_SECRET)" "$($env:SITE_URL)/api/cron/check-escalations"
# Release reservations
curl.exe --fail -H "Authorization: Bearer $($env:CRON_SECRET)" "$($env:SITE_URL)/api/cron/release-reservations"
# Reconcile payments
curl.exe --fail -H "x-cron-key: $($env:CRON_SECRET)" "$($env:SITE_URL)/api/payments/reconcile"
# Admin SMS test
curl.exe --fail -H "Authorization: Bearer $($env:CRON_SECRET)" "$($env:SITE_URL)/api/cron/test-admin-sms?msg=Hello%20Admin"
```

macOS/Linux:
```bash
export CRON_SECRET='<your-cron-secret>'
export SITE_URL='https://discreetkit.com'
# Escalations
curl --fail -H "Authorization: Bearer $CRON_SECRET" "$SITE_URL/api/cron/check-escalations"
# Release reservations
curl --fail -H "Authorization: Bearer $CRON_SECRET" "$SITE_URL/api/cron/release-reservations"
# Reconcile payments
curl --fail -H "x-cron-key: $CRON_SECRET" "$SITE_URL/api/payments/reconcile"
# Admin SMS test
curl --fail -H "Authorization: Bearer $CRON_SECRET" "$SITE_URL/api/cron/test-admin-sms?msg=Hello%20Admin"
```

## Notes

- Ensure `CRON_SECRET` is identical across GitHub Actions and Vercel.
- `ADMIN_PHONES` must be set to valid E.164 numbers; Ghana: replace leading `0` with `+233`.
