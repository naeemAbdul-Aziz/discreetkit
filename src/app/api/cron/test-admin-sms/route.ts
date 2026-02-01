import { NextResponse } from 'next/server'
import { sendSMS } from '@/lib/server-utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Test endpoint to send a sample SMS to ADMIN_PHONES
 * Auth: Authorization: Bearer <CRON_SECRET>
 * Optional: ?msg=Your%20message
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  const sanitize = (v?: string | null) => (v ?? '').replace(/^"|"$/g, '').trim()
  const cronSecret = sanitize(process.env.CRON_SECRET)
  const providedAuth = sanitize(authHeader)
  const expectedAuth = `Bearer ${cronSecret}`

  if (!cronSecret || providedAuth !== expectedAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(req.url)
  const msg = url.searchParams.get('msg') || 'Test admin alert from cron test endpoint.'

  const adminPhones = (process.env.ADMIN_PHONES || '')
    .split(',')
    .map(p => p.trim())
    .filter(p => p.length > 5)

  if (adminPhones.length === 0) {
    return NextResponse.json({ ok: false, error: 'No ADMIN_PHONES configured' }, { status: 200 })
  }

  const results = await Promise.allSettled(adminPhones.map(phone => sendSMS(phone, msg)))
  const delivered = results.filter(r => r.status === 'fulfilled').length
  const failed = results.length - delivered

  return NextResponse.json({ ok: true, delivered, failed, phones: adminPhones })
}
