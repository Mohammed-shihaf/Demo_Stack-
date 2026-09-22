import { Router, Request, Response } from 'express';
import { PerformanceController } from '../controllers/PerformanceController';

export function createPerformanceRouter(performanceController: PerformanceController): Router {
  const router = Router();

  router.get('/soak', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      uptimeSeconds: process.uptime(),
      memoryUsage: process.memoryUsage(),
    });
  });

  router.get('/spike', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      trafficSpikeHandled: true,
      simulatedConcurrentUsers: 100,
    });
  });

  router.get('/cache-stats', (req: Request, res: Response) => {
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

export default createPerformanceRouter;
