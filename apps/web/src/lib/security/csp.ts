export function publicApiOrigin() {
  const url = new URL(
    process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001',
  );
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    url.search ||
    url.hash
  )
    throw new Error('Invalid public API origin');
  return url.origin;
}
export function contentSecurityPolicy(
  nonce: string,
  origin: string,
  development: boolean,
) {
  return [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${development ? " 'unsafe-eval'" : ''}`,
    `style-src 'self' ${development ? "'unsafe-inline'" : "'nonce-" + nonce + "'"}`,
    `connect-src 'self' ${origin}${development ? ' ws: wss:' : ''}`,
    "img-src 'self' data:",
    "font-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "frame-src 'none'",
  ].join('; ');
}
