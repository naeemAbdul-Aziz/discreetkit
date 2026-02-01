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
