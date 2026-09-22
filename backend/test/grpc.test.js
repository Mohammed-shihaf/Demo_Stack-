'use strict';

const assert = require('assert');
const path = require('path');
const GrpcRecordServer = require('../src/infrastructure/grpc/GrpcRecordServer');
const GrpcRecordClient = require('../src/infrastructure/grpc/GrpcRecordClient');
const MongoRecordRepository = require('../src/infrastructure/database/repositories/MongoRecordRepository');
const { GetRecordByIdUseCase } = require('../src/application/use-cases/RecordUseCases');
const { recordEventBus, RECORD_EVENTS } = require('../src/domain/events/recordEvents');

describe('Unified Backend gRPC Integration Tests', () => {
  let grpcServer;
  let grpcClient;
  const testPort = 50052;
  const protoPath = path.resolve(__dirname, '../../shared/proto/record.proto');
  let recordRepository;

  before(async () => {
    recordRepository = new MongoRecordRepository();
    // Pre-populate a test record
    await recordRepository.create({ title: 'gRPC Sample', description: 'Testing proto streaming' });

    const getRecordUseCase = new GetRecordByIdUseCase({ recordRepository });

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
    const response = await grpcClient.getRecord(record.id);

    assert.strictEqual(response.id, record.id);
    assert.strictEqual(response.title, 'gRPC Unary Test');
  });

  it('streaming WatchRecords receives stream updates when records are created', (done) => {
    let called = false;
    const stream = grpcClient.watchRecords(
      (data) => {
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
      (err) => {
        if (!called && err.code !== 1) { // Ignore CANCELLED code
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
