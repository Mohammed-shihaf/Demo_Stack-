import assert from 'assert';
import request from 'supertest';
import { createApp } from '../src/app';
import { ComplianceDomainService } from '../src/domain/services/ComplianceDomainService';

describe('TypeScript Compliance Tests', () => {
  let app: any;

  beforeEach(() => {
    const context = createApp();
    app = context.app;
  });

  describe('PCI-DSS Compliance Tests', () => {
    it('masks credit card PAN keeping first 6 and last 4 digits', () => {
      const pan = '4111222233334444';
      const masked = ComplianceDomainService.maskCardholderPan(pan);
      assert.strictEqual(masked, '411122******4444');
    });

    it('POST /api/compliance/pci/mask-pan returns masked cardholder number', async () => {
      const res = await request(app)
        .post('/api/compliance/pci/mask-pan')
        .send({ pan: '4000123456789010' });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.maskedPan, '400012******9010');
      assert.strictEqual(res.body.isPciCompliant, true);
    });
  });

  describe('FERPA & COPPA Student Privacy Tests', () => {
    it('redacts student PII fields correctly', () => {
      const student = {
        name: 'Alice Smith',
        studentId: '12345678',
        email: 'alice@school.edu',
        address: '123 Campus Way',
        dateOfBirth: '2005-04-12',
      };
      const redacted = ComplianceDomainService.redactStudentPii(student);
      assert.strictEqual(redacted.studentId, 'STU-***-678');
      assert.strictEqual(redacted.email, 'a***@school.edu');
      assert.strictEqual(redacted.address, '[REDACTED FOR FERPA COMPLIANCE]');
      assert.strictEqual(redacted.dateOfBirth, '[REDACTED]');
    });

    it('POST /api/compliance/ferpa/redact-student redacts payload', async () => {
      const res = await request(app)
        .post('/api/compliance/ferpa/redact-student')
        .send({ studentId: '987654321', email: 'john@university.edu' });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.redacted.studentId, 'STU-***-321');
      assert.strictEqual(res.body.isFerpaCompliant, true);
    });

    it('POST /api/compliance/coppa/verify-consent evaluates child consent rules', async () => {
      const resUnder13NoConsent = await request(app)
        .post('/api/compliance/coppa/verify-consent')
        .send({ age: 10, hasParentalConsent: false });

      assert.strictEqual(resUnder13NoConsent.status, 200);
      assert.strictEqual(resUnder13NoConsent.body.compliant, false);
      assert.strictEqual(resUnder13NoConsent.body.requiresConsent, true);

      const resUnder13WithConsent = await request(app)
        .post('/api/compliance/coppa/verify-consent')
        .send({ age: 10, hasParentalConsent: true, consentTimestamp: '2026-05-20T10:00:00Z' });

      assert.strictEqual(resUnder13WithConsent.status, 200);
      assert.strictEqual(resUnder13WithConsent.body.compliant, true);

      const resOver13 = await request(app)
        .post('/api/compliance/coppa/verify-consent')
        .send({ age: 16 });

      assert.strictEqual(resOver13.status, 200);
      assert.strictEqual(resOver13.body.compliant, true);
      assert.strictEqual(resOver13.body.requiresConsent, false);
    });
  });

  describe('HIPAA Compliance Tests', () => {
    it('POST /api/compliance/hipaa/sanitize-ephi strips identifiers', async () => {
      const res = await request(app)
        .post('/api/compliance/hipaa/sanitize-ephi')
        .send({
          patientName: 'John Doe',
          ssn: '000-11-2222',
          mrn: 'MRN-999',
          diagnosis: 'Healthy',
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.sanitized.patientName, '[DE-IDENTIFIED]');
      assert.strictEqual(res.body.sanitized.ssn, undefined);
      assert.strictEqual(res.body.sanitized.mrn, undefined);
      assert.strictEqual(res.body.sanitized.diagnosis, 'Healthy');
    });
  });
});
