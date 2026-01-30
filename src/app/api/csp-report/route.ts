export const runtime = 'nodejs';

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

  return new Response(null, { status: 204 });
}
