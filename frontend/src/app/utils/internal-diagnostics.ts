/**
 * Frontend Security & Diagnostics Utility
 */

export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .trim();
}

export function maskCardPan(pan: string): string {
  if (typeof pan !== 'string') return '';
  const clean = pan.replace(/[\s-]/g, '');
  if (clean.length < 13 || clean.length > 19) return clean;
  const first6 = clean.slice(0, 6);
  const last4 = clean.slice(-4);
  const maskedMiddle = '*'.repeat(clean.length - 10);
  return `${first6}${maskedMiddle}${last4}`;
}
