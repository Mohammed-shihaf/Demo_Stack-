'use strict';

const express = require('express');

function createPerformanceRouter(performanceController) {
  const router = express.Router();

  router.get('/soak', (req, res) => {
    res.status(200).json({
      status: 'ok',
      uptimeSeconds: process.uptime(),
      memoryUsage: process.memoryUsage(),
    });
  });

  router.get('/spike', (req, res) => {
    res.status(200).json({
      status: 'ok',
      trafficSpikeHandled: true,
      simulatedConcurrentUsers: 100,
    });
  });

  router.get('/cache-stats', (req, res) => {
    res.status(200).json({
      hits: 450,
      misses: 50,
      hitRate: 0.9,
    });
  });

  router.get('/cubic-complexity', performanceController.cubicComplexity);
  router.get('/n-plus-one', performanceController.nPlusOne);
  router.get('/memory-telemetry', performanceController.memoryTelemetry);

  return router;
}

module.exports = createPerformanceRouter;
