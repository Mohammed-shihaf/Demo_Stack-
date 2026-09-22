import { Request, Response, NextFunction } from 'express';
import { ComplianceDomainService } from '../../../domain/services/ComplianceDomainService';

export class ComplianceController {
  maskPan = async (req: Request, res: Response, next: NextFunction) => {
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

  redactStudentPii = async (req: Request, res: Response, next: NextFunction) => {
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

  verifyCoppa = async (req: Request, res: Response, next: NextFunction) => {
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

  sanitizeHipaa = async (req: Request, res: Response, next: NextFunction) => {
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

export default ComplianceController;
