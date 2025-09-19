export function buildCsp(nonce: string, reportOnly: boolean) {
  const directives = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}'`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob:`,
    `connect-src 'self' http://localhost:3200 https://localhost:3200`,
    `font-src 'self' data:`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `frame-ancestors 'none'`,
    `upgrade-insecure-requests`,
    `report-uri /api/csp-report`,
  ];
  return {
    header: reportOnly ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy',
    value: directives.join('; ')
  };
}