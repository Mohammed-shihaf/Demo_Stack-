import assert from 'assert';
import { SanitizationAdapter } from '../src/infrastructure/security/SanitizationAdapter';

describe('TypeScript Security Sanitization Adapter Tests', () => {
  it('escapes HTML special characters to prevent XSS', () => {
    const malicious = '<script>alert("xss")</script>&foo';
    const escaped = SanitizationAdapter.escapeHtml(malicious);
    assert.strictEqual(escaped, '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;&amp;foo');
  });

  it('sanitizes file paths preventing directory traversal', () => {
    const safe = SanitizationAdapter.sanitizeFilePath('subfolder/data.json', 'C:\\workspace');
    assert.ok(safe.includes('data.json'));

    assert.throws(() => {
      SanitizationAdapter.sanitizeFilePath('../../../etc/passwd', 'C:\\workspace');
    });
  });

  it('escapes special regex characters to prevent ReDoS / injection', () => {
    const raw = '[test] (foo)*+?.';
    const escaped = SanitizationAdapter.escapeRegex(raw);
    assert.strictEqual(escaped, '\\[test\\] \\(foo\\)\\*\\+\\?\\.');
  });
});
