import { sanitizeInput, maskCardPan } from './internal-diagnostics';

describe('internal-diagnostics utility (frontend)', () => {
  it('sanitizes harmful HTML inputs', () => {
    const input = '<script>alert(1)</script> Safe Content';
    expect(sanitizeInput(input)).toBe('scriptalert(1)/script Safe Content');
  });

  it('masks credit card PANs', () => {
    const pan = '4111-2222-3333-4444';
    expect(maskCardPan(pan)).toBe('411122******4444');
  });
});
