'use strict';

const express = require('express');
const cors = require('cors');

const {
  securityHeadersMiddleware,
  globalErrorHandler,
  requestMetricsMiddleware,
} = require('./presentation/http/middlewares/HttpMiddlewares');

const MongoRecordRepository = require('./infrastructure/database/repositories/MongoRecordRepository');
const ElasticsearchAdapter = require('./infrastructure/search/ElasticsearchAdapter');
const SnsEventPublisher = require('./infrastructure/messaging/SnsEventPublisher');
const SesEmailNotifier = require('./infrastructure/messaging/SesEmailNotifier');

const {
  CreateRecordUseCase,
  GetRecordByIdUseCase,
  ListRecordsUseCase,
  SearchRecordsUseCase,
  ExportFormatUseCase,
} = require('./application/use-cases/RecordUseCases');

const RecordController = require('./presentation/http/controllers/RecordController');
const SearchController = require('./presentation/http/controllers/SearchController');
const ComplianceController = require('./presentation/http/controllers/ComplianceController');
const PerformanceController = require('./presentation/http/controllers/PerformanceController');

const createRecordRouter = require('./presentation/http/routes/record.routes');
const createSearchRouter = require('./presentation/http/routes/search.routes');
const createComplianceRouter = require('./presentation/http/routes/compliance.routes');
const createPerformanceRouter = require('./presentation/http/routes/performance.routes');

function createApp(customDependencies = {}) {
  const app = express();

  // Infrastructure instances
  const recordRepository = customDependencies.recordRepository || new MongoRecordRepository();
  const searchAdapter = customDependencies.searchAdapter || new ElasticsearchAdapter();
  const snsPublisher = customDependencies.snsPublisher || new SnsEventPublisher();
  const sesNotifier = customDependencies.sesNotifier || new SesEmailNotifier();

  // Application Use Cases
  const createRecordUseCase = new CreateRecordUseCase({
    recordRepository,
    searchAdapter,
    snsPublisher,
    sesNotifier,
  });
  const getRecordByIdUseCase = new GetRecordByIdUseCase({ recordRepository });
  const listRecordsUseCase = new ListRecordsUseCase({ recordRepository });
  const searchRecordsUseCase = new SearchRecordsUseCase({ searchAdapter, recordRepository });
  const exportFormatUseCase = new ExportFormatUseCase({ recordRepository });

  // Controllers
  const recordController = new RecordController({
    createRecordUseCase,
    getRecordByIdUseCase,
    listRecordsUseCase,
    exportFormatUseCase,
  });
  const searchController = new SearchController({ searchRecordsUseCase });
  const complianceController = new ComplianceController();
  const performanceController = new PerformanceController();

  // Global Middlewares
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(securityHeadersMiddleware);
  app.use(requestMetricsMiddleware);

  // Health and Readiness probes
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
  });

  app.get('/ready', (req, res) => {
    res.status(200).json({ status: 'READY', timestamp: new Date().toISOString() });
  });

  // Presentation API Routes
  app.use('/api/records', createRecordRouter(recordController));
  app.use('/api/search', createSearchRouter(searchController));
  app.use('/api/compliance', createComplianceRouter(complianceController));
  app.use('/api/performance', createPerformanceRouter(performanceController));

  // 404 Route
  app.use((req, res) => {
    res.status(404).json({ error: `Not Found - ${req.method} ${req.path}` });
  });

  // Global Error Handler
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

module.exports = createApp;
