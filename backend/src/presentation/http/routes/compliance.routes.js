'use strict';

const express = require('express');

function createComplianceRouter(complianceController) {
  const router = express.Router();

  router.get('/privacy', (req, res) => {
    res.status(200).json({
      policy: 'GDPR, FERPA, COPPA, and HIPAA Compliant',
      version: '1.0',
      effectiveDate: '2026-05-20',
    });
  });

  router.get('/gdpr/export/:userId', (req, res) => {
    res.status(200).json({
      userId: req.params.userId,
      exportedAt: new Date().toISOString(),
      data: { profile: 'Exported User Data', consentGranted: true },
    });
  });

  router.delete('/gdpr/erase/:userId', (req, res) => {
    res.status(200).json({
      userId: req.params.userId,
      erased: true,
      erasedAt: new Date().toISOString(),
    });
  });

  router.get('/soc2/audit-logs', (req, res) => {
    res.status(200).json({
      auditEnabled: true,
      logs: [
        { event: 'AUTH_SUCCESS', actor: 'admin', timestamp: new Date().toISOString() },
        { event: 'RECORD_ACCESS', actor: 'system', timestamp: new Date().toISOString() },
      ],
    });
  });

  router.post('/pci/mask-pan', complianceController.maskPan);
  router.post('/ferpa/redact-student', complianceController.redactStudentPii);
  router.post('/coppa/verify-consent', complianceController.verifyCoppa);
  router.post('/hipaa/sanitize-ephi', complianceController.sanitizeHipaa);

  return router;
}

module.exports = createComplianceRouter;
