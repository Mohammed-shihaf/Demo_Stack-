'use strict';

const ComplianceDomainService = require('../../../domain/services/ComplianceDomainService');

class ComplianceController {
  /**
   * Endpoint for PCI-DSS PAN masking verification.
   */
  maskPan = async (req, res, next) => {
    try {
      const { pan } = req.body || {};
      const masked = ComplianceDomainService.maskCardholderPan(pan);
      return res.status(200).json({
        originalLength: (pan || '').length,
        maskedPan: masked,
        isPciCompliant: true,
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * Endpoint for FERPA / COPPA student PII redaction.
   */
  redactStudentPii = async (req, res, next) => {
    try {
      const studentData = req.body || {};
      const sanitized = ComplianceDomainService.redactStudentPii(studentData);
      return res.status(200).json({
        redacted: sanitized,
        isFerpaCompliant: true,
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * Endpoint for COPPA consent verification.
   */
  verifyCoppa = async (req, res, next) => {
    try {
      const { age, hasParentalConsent, consentTimestamp } = req.body || {};
      const result = ComplianceDomainService.verifyCoppaConsent({
        age: Number(age),
        hasParentalConsent: Boolean(hasParentalConsent),
        consentTimestamp,
      });
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  /**
   * Endpoint for HIPAA ePHI sanitization.
   */
  sanitizeHipaa = async (req, res, next) => {
    try {
      const healthData = req.body || {};
      const sanitized = ComplianceDomainService.sanitizeEphi(healthData);
      return res.status(200).json({
        sanitized,
        isHipaaCompliant: true,
      });
    } catch (err) {
      next(err);
    }
  };
}

module.exports = ComplianceController;
