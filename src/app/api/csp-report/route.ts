export const runtime = 'nodejs';

import * as Sentry from '@sentry/node';

let sentryInitialized = false;
function initSentry() {
  if (sentryInitialized) return;
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;
  try {
    Sentry.init({
      dsn,
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'production',
      tracesSampleRate: 0,
      release: process.env.VERCEL_GIT_COMMIT_SHA,
    });
    sentryInitialized = true;
  } catch {}
}

export async function POST(request: Request) {
  const contentType = request.headers.get('content-type') || '';
  const userAgent = request.headers.get('user-agent') || '';

  let raw = '';
  try {
    raw = await request.text();
  } catch {}

  let parsed: any = {};
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = {};
  }

  const report = parsed['csp-report'] ?? parsed ?? {};

  const payload = {
    effectiveDirective: report.effectiveDirective || report['effective-directive'] || '',
    violatedDirective: report.violatedDirective || report['violated-directive'] || '',
    blockedURI: report.blockedURI || report['blocked-uri'] || '',
    documentURI: report.documentURI || report['document-uri'] || '',
    referrer: report.referrer || '',
    sourceFile: report.sourceFile || report['source-file'] || '',
    lineNumber: report.lineNumber || report['line-number'] || 0,
    columnNumber: report.columnNumber || report['column-number'] || 0,
    disposition: report.disposition || '',
    userAgent,
    timestamp: Date.now(),
  };

  try {
    console.warn('CSP Violation', payload);
  } catch {}

  // Forward to Sentry if configured
  try {
    initSentry();
    if (sentryInitialized) {
      Sentry.withScope(scope => {
        scope.setLevel('warning');
        scope.setContext('csp', payload as Record<string, any>);
        scope.setTag('csp.effectiveDirective', String(payload.effectiveDirective || ''));
        scope.setTag('csp.blockedURI', String(payload.blockedURI || ''));
        scope.setTag('csp.documentURI', String(payload.documentURI || ''));
        scope.setTag('csp.disposition', String(payload.disposition || 'report-only'));
        Sentry.captureMessage('CSP Violation');
      });
      await Sentry.flush(500);
    }
  } catch {}

  return new Response(null, { status: 204 });
}
