import env from './config/env.config';
import { createApp } from './app';
import { MongooseConnection } from './infrastructure/database/mongoose/MongooseConnection';
import { MongoRecordRepository } from './infrastructure/database/repositories/MongoRecordRepository';
import { ElasticsearchAdapter } from './infrastructure/search/ElasticsearchAdapter';
import { SnsEventPublisher } from './infrastructure/messaging/SnsEventPublisher';
import { SesEmailNotifier } from './infrastructure/messaging/SesEmailNotifier';
import { GrpcRecordServer } from './infrastructure/grpc/GrpcRecordServer';

export async function bootstrap() {
  console.log('[Server] Initializing TypeScript Unified Backend Service...');

  await MongooseConnection.connect(env.mongoUri);

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

  const { app, useCases } = createApp({
    recordRepository,
    searchAdapter,
    snsPublisher,
    sesNotifier,
  });

  let grpcServer: GrpcRecordServer | null = null;
  try {
    grpcServer = new GrpcRecordServer({
      protoPath: env.protoPath,
      host: env.grpcHost,
      port: env.grpcPort,
      getRecordUseCase: useCases.getRecordByIdUseCase,
    });
    await grpcServer.start();
  } catch (err: any) {
    console.warn(`[Server] gRPC Server startup warning: ${err.message}`);
  }

  const server = app.listen(env.port, () => {
    console.log(`[Server] TypeScript HTTP REST API listening on port ${env.port}`);
    console.log(`  - REST API:    http://localhost:${env.port}/api/records`);
    console.log(`  - Search API:  http://localhost:${env.port}/api/search?q=...`);
    console.log(`  - Compliance:  http://localhost:${env.port}/api/compliance/...`);
    console.log(`  - Performance: http://localhost:${env.port}/api/performance/...`);
    console.log(`  - gRPC Server: ${env.grpcHost}:${env.grpcPort}`);
  });

  const shutdown = async (signal: string) => {
    console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
    if (grpcServer) {
      grpcServer.stop();
    }
    server.close(async () => {
      await MongooseConnection.disconnect();
      console.log('[Server] Unified TypeScript backend stopped cleanly.');
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

export default bootstrap;
