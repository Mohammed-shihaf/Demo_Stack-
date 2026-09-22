import assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import { GrpcRecordServer } from '../src/infrastructure/grpc/GrpcRecordServer';
import { GrpcRecordClient } from '../src/infrastructure/grpc/GrpcRecordClient';
import { MongoRecordRepository } from '../src/infrastructure/database/repositories/MongoRecordRepository';
import { GetRecordByIdUseCase } from '../src/application/use-cases/RecordUseCases';
import { recordEventBus, RECORD_EVENTS } from '../src/domain/events/recordEvents';

describe('TypeScript Unified Backend gRPC Integration Tests', () => {
  let grpcServer: GrpcRecordServer;
  let grpcClient: GrpcRecordClient;
  const testPort = 50053;
  const protoPath = fs.existsSync(path.resolve(__dirname, '../../shared/proto/record.proto'))
    ? path.resolve(__dirname, '../../shared/proto/record.proto')
    : path.resolve(__dirname, '../../../shared/proto/record.proto');
  let recordRepository: MongoRecordRepository;

  before(async () => {
    recordRepository = new MongoRecordRepository();
    await recordRepository.create({ title: 'gRPC Sample', description: 'Testing proto streaming' });

    const getRecordUseCase = new GetRecordByIdUseCase(recordRepository);

    grpcServer = new GrpcRecordServer({
      protoPath,
      host: '127.0.0.1',
      port: testPort,
      getRecordUseCase,
    });
    await grpcServer.start();

    grpcClient = new GrpcRecordClient({
      protoPath,
      host: '127.0.0.1',
      port: testPort,
    });
  });

  after(() => {
    if (grpcClient) grpcClient.close();
    if (grpcServer) grpcServer.stop();
  });

  it('unary GetRecord fetches record by id', async () => {
    const record = await recordRepository.create({ title: 'gRPC Unary Test', description: 'Desc' });
    const response = await grpcClient.getRecord(record.id!);

    assert.strictEqual(response.id, record.id);
    assert.strictEqual(response.title, 'gRPC Unary Test');
  });

  it('streaming WatchRecords receives stream updates when records are created', (done) => {
    let called = false;
    const stream = grpcClient.watchRecords(
      (data: any) => {
        if (!called) {
          called = true;
          try {
            assert.strictEqual(data.title, 'Streamed Record 101');
            stream.cancel();
            done();
          } catch (err) {
            done(err);
          }
        }
      },
      (err: any) => {
        if (!called && err.code !== 1) {
          called = true;
          done(err);
        }
      }
    );

    setTimeout(() => {
      recordEventBus.emit(RECORD_EVENTS.RECORD_CREATED, {
        id: 'stream-101',
        title: 'Streamed Record 101',
        description: 'Pushed via gRPC stream',
        createdAt: new Date().toISOString(),
      });
    }, 100);
  });
});
