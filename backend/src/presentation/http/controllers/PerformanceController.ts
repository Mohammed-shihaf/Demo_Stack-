import { Request, Response, NextFunction } from 'express';
import { RecordAnalyticsDomainService } from '../../../domain/services/RecordAnalyticsDomainService';

export class PerformanceController {
  cubicComplexity = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const size = Math.min(parseInt((req.query.size as string) || '30', 10), 100);
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

  nPlusOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parentCount = parseInt((req.query.count as string) || '10', 10);
      const result = RecordAnalyticsDomainService.simulateNPlusOneQueryPattern(
        parentCount,
        (i) => ({ parentId: i, meta: `Child metadata ${i}` })
      );
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  memoryTelemetry = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const chunks = parseInt((req.query.chunks as string) || '50', 10);
      const chunkSize = parseInt((req.query.size as string) || '2048', 10);
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

export default PerformanceController;
