'use strict';

const env = require('./config/env.config');
const createApp = require('./app');
const MongooseConnection = require('./infrastructure/database/mongoose/MongooseConnection');
const MongoRecordRepository = require('./infrastructure/database/repositories/MongoRecordRepository');
const ElasticsearchAdapter = require('./infrastructure/search/ElasticsearchAdapter');
const SnsEventPublisher = require('./infrastructure/messaging/SnsEventPublisher');
const SesEmailNotifier = require('./infrastructure/messaging/SesEmailNotifier');
const GrpcRecordServer = require('./infrastructure/grpc/GrpcRecordServer');

async function bootstrap() {
  console.log('[Server] Initializing Single Unified Backend Service...');

  // 1. Database Connection (MongoDB)
  await MongooseConnection.connect(env.mongoUri);

  // 2. Repositories and Adapters
  const recordRepository = new MongoRecordRepository();
  const searchAdapter = new ElasticsearchAdapter({
    node: env.elasticsearchNode,
    index: env.elasticsearchIndex,
  });
  await searchAdapter.ensureIndex();

  const snsPublisher = new SnsEventPublisher({
    region: env.awsRegion,
    endpoint: env.awsEndpoint,
    topicArn: env.snsTopicArn,
  });

  const sesNotifier = new SesEmailNotifier({
    region: env.awsRegion,
    endpoint: env.awsEndpoint,
    fromEmail: env.sesFromEmail,
  });

  // 3. Create Express Application
  const { app, useCases } = createApp({
    recordRepository,
    searchAdapter,
    snsPublisher,
    sesNotifier,
  });

  // 4. Start gRPC Server
  let grpcServer;
  try {
    grpcServer = new GrpcRecordServer({
      protoPath: env.protoPath,
      host: env.grpcHost,
      port: env.grpcPort,
      getRecordUseCase: useCases.getRecordByIdUseCase,
    });
    await grpcServer.start();
  } catch (err) {
    console.warn(`[Server] gRPC Server startup warning: ${err.message}`);
  }

  // 5. Start HTTP Express Server
  const server = app.listen(env.port, () => {
    console.log(`[Server] HTTP REST API listening on port ${env.port}`);
    console.log(`[Server] Endpoints:`);
    console.log(`  - REST API:    http://localhost:${env.port}/api/records`);
    console.log(`  - Search API:  http://localhost:${env.port}/api/search?q=...`);
    console.log(`  - Compliance:  http://localhost:${env.port}/api/compliance/...`);
    console.log(`  - Performance: http://localhost:${env.port}/api/performance/...`);
    console.log(`  - gRPC Server: ${env.grpcHost}:${env.grpcPort}`);
  });

  // Graceful shutdown handling
  const shutdown = async (signal) => {
    console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
    if (grpcServer) {
      grpcServer.stop();
    }
    server.close(async () => {
      await MongooseConnection.disconnect();
      console.log('[Server] Unified backend stopped cleanly.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  return { server, grpcServer, app };
}

if (require.main === module) {
  bootstrap().catch((err) => {
    console.error('[Server] Fatal bootstrap error:', err);
    process.exit(1);
  });
}

module.exports = bootstrap;
