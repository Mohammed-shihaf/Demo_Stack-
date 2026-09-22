'use strict';

class ComplianceDomainService {
  /**
   * PCI-DSS PAN masking: Masks Primary Account Numbers (credit card numbers),
   * showing only the first 6 digits and last 4 digits (e.g. 411122******1111).
   */
  static maskCardholderPan(pan) {
    if (!pan || typeof pan !== 'string') return '';
    const cleaned = pan.replace(/[\s-]/g, '');
    if (cleaned.length < 10) {
      return '*'.repeat(cleaned.length);
    }
    const first6 = cleaned.slice(0, 6);
    const last4 = cleaned.slice(-4);
    const maskedMiddle = '*'.repeat(cleaned.length - 10);
    return `${first6}${maskedMiddle}${last4}`;
  }

  /**
   * FERPA / COPPA: Redacts student personally identifiable information (PII)
   * such as student ID, email address, and home address.
   */
  static redactStudentPii(record) {
    if (!record || typeof record !== 'object') return record;
    const sanitized = { ...record };

    if (sanitized.studentId) {
      sanitized.studentId = `STU-***-${String(sanitized.studentId).slice(-3)}`;
    }
    if (sanitized.email && typeof sanitized.email === 'string') {
      const parts = sanitized.email.split('@');
      if (parts.length === 2) {
        sanitized.email = `${parts[0].charAt(0)}***@${parts[1]}`;
      }
    }
    if (sanitized.address) {
      sanitized.address = '[REDACTED FOR FERPA COMPLIANCE]';
    }
    if (sanitized.dateOfBirth) {
      sanitized.dateOfBirth = '[REDACTED]';
    }

    return sanitized;
  }

  /**
   * COPPA: Checks if user is under 13 and verifies parental consent flag.
   */
  static verifyCoppaConsent({ age, hasParentalConsent, consentTimestamp }) {
    const isUnder13 = typeof age === 'number' && age < 13;
    if (!isUnder13) {
      return { compliant: true, requiresConsent: false };
    }

    const hasValidConsent = Boolean(hasParentalConsent && consentTimestamp);
    return {
      compliant: hasValidConsent,
      requiresConsent: true,
      reason: hasValidConsent ? 'Verified parental consent present' : 'Missing verifiable parental consent for child under 13',
    };
  }

  /**
   * HIPAA: Sanitizes ePHI (electronic Protected Health Information) identifiers.
   */
  static sanitizeEphi(healthRecord) {
    if (!healthRecord || typeof healthRecord !== 'object') return healthRecord;
    const sanitized = { ...healthRecord };

    delete sanitized.ssn;
    delete sanitized.mrn; // Medical Record Number
    delete sanitized.biometricIdentifiers;

    if (sanitized.patientName) {
      sanitized.patientName = '[DE-IDENTIFIED]';
    }

    return sanitized;
  }
}

module.exports = ComplianceDomainService;
