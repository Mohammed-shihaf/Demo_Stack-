import express, { Express, Request, Response } from 'express';
import cors from 'cors';

import {
  securityHeadersMiddleware,
  globalErrorHandler,
  requestMetricsMiddleware,
} from './presentation/http/middlewares/HttpMiddlewares';

import { MongoRecordRepository } from './infrastructure/database/repositories/MongoRecordRepository';
import { ElasticsearchAdapter } from './infrastructure/search/ElasticsearchAdapter';
import { SnsEventPublisher } from './infrastructure/messaging/SnsEventPublisher';
import { SesEmailNotifier } from './infrastructure/messaging/SesEmailNotifier';

import {
  CreateRecordUseCase,
  GetRecordByIdUseCase,
  ListRecordsUseCase,
  SearchRecordsUseCase,
  ExportFormatUseCase,
} from './application/use-cases/RecordUseCases';

import { RecordController } from './presentation/http/controllers/RecordController';
import { SearchController } from './presentation/http/controllers/SearchController';
import { ComplianceController } from './presentation/http/controllers/ComplianceController';
import { PerformanceController } from './presentation/http/controllers/PerformanceController';

import { createRecordRouter } from './presentation/http/routes/record.routes';
import { createSearchRouter } from './presentation/http/routes/search.routes';
import { createComplianceRouter } from './presentation/http/routes/compliance.routes';
import { createPerformanceRouter } from './presentation/http/routes/performance.routes';

export function createApp(customDependencies: any = {}) {
  const app: Express = express();

  const recordRepository = customDependencies.recordRepository || new MongoRecordRepository();
  const searchAdapter = customDependencies.searchAdapter || new ElasticsearchAdapter();
  const snsPublisher = customDependencies.snsPublisher || new SnsEventPublisher();
  const sesNotifier = customDependencies.sesNotifier || new SesEmailNotifier();

  const createRecordUseCase = new CreateRecordUseCase({
    recordRepository,
    searchAdapter,
    snsPublisher,
    sesNotifier,
  });
  const getRecordByIdUseCase = new GetRecordByIdUseCase(recordRepository);
  const listRecordsUseCase = new ListRecordsUseCase(recordRepository);
  const searchRecordsUseCase = new SearchRecordsUseCase(searchAdapter, recordRepository);
  const exportFormatUseCase = new ExportFormatUseCase(recordRepository);

  const recordController = new RecordController({
    createRecordUseCase,
    getRecordByIdUseCase,
    listRecordsUseCase,
    exportFormatUseCase,
  });
  const searchController = new SearchController({ searchRecordsUseCase });
  const complianceController = new ComplianceController();
  const performanceController = new PerformanceController();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(securityHeadersMiddleware);
  app.use(requestMetricsMiddleware);

  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
  });

  app.get('/ready', (req: Request, res: Response) => {
    res.status(200).json({ status: 'READY', timestamp: new Date().toISOString() });
  });

  app.use('/api/records', createRecordRouter(recordController));
  app.use('/api/search', createSearchRouter(searchController));
  app.use('/api/compliance', createComplianceRouter(complianceController));
  app.use('/api/performance', createPerformanceRouter(performanceController));

  app.use((req: Request, res: Response) => {
    res.status(404).json({ error: `Not Found - ${req.method} ${req.path}` });
  });

  app.use(globalErrorHandler);

  return {
    app,
    recordRepository,
    searchAdapter,
    snsPublisher,
    sesNotifier,
    useCases: {
      createRecordUseCase,
      getRecordByIdUseCase,
      listRecordsUseCase,
      searchRecordsUseCase,
      exportFormatUseCase,
    },
  };
}

export default createApp;
