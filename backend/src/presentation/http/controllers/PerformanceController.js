'use strict';

const RecordAnalyticsDomainService = require('../../../domain/services/RecordAnalyticsDomainService');

class PerformanceController {
  /**
   * Endpoint for $O(n^3)$ cubic complexity benchmark test.
   */
  cubicComplexity = async (req, res, next) => {
    try {
      const size = Math.min(parseInt(req.query.size || '30', 10), 100);
      const items = Array.from({ length: size }, (_, i) => `item-${i + 1}`);
      const start = process.hrtime.bigint();
      const result = RecordAnalyticsDomainService.computeCubicCombinations(items);
      const end = process.hrtime.bigint();
      const elapsedMs = Number(end - start) / 1e6;

      return res.status(200).json({
        ...result,
        executionTimeMs: elapsedMs,
        complexityNotation: 'O(n^3)',
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * Endpoint for N+1 query loop pattern detection.
   */
  nPlusOne = async (req, res, next) => {
    try {
      const parentCount = parseInt(req.query.count || '10', 10);
      const result = RecordAnalyticsDomainService.simulateNPlusOneQueryPattern(
        parentCount,
        (i) => ({ parentId: i, meta: `Child metadata ${i}` })
      );
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  /**
   * Endpoint for memory allocation / garbage collection telemetry.
   */
  memoryTelemetry = async (req, res, next) => {
    try {
      const chunks = parseInt(req.query.chunks || '50', 10);
      const chunkSize = parseInt(req.query.size || '2048', 10);
      const result = RecordAnalyticsDomainService.generateMemoryAllocations(chunks, chunkSize);
      return res.status(200).json({
        ...result,
        currentProcessMemory: process.memoryUsage(),
      });
    } catch (err) {
      next(err);
    }
  };
}

module.exports = PerformanceController;
