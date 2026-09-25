# Security & Compliance Governance Policy

This platform stack adheres to enterprise security standards:

- **OWASP Top 10 Mitigation**: Strict input sanitization against XSS, SQL/NoSQL injection, and path traversal.
- **PCI-DSS Compliance**: Credit card PAN masking algorithm preserving only first 6 and last 4 digits.
- **FERPA & COPPA**: Automated redaction of student PII and parental consent validation for users under 13.
- **HIPAA**: Automatic stripping of Electronic Protected Health Information (ePHI).
- **HTTP Security Headers**: HSTS, CSP, X-Frame-Options, nosniff, and safe referrer policy.
