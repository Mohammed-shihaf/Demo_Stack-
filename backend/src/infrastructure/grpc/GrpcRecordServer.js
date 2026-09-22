'use strict';

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { recordEventBus, RECORD_EVENTS } = require('../../domain/events/recordEvents');

class GrpcRecordServer {
  constructor({ protoPath, host = '0.0.0.0', port = 50051, getRecordUseCase }) {
    this.protoPath = protoPath;
    this.host = host;
    this.port = port;
    this.getRecordUseCase = getRecordUseCase;
    this.server = null;
    this.activeStreams = new Set();

    // Listen to in-process domain events and push to active gRPC subscribers
    recordEventBus.on(RECORD_EVENTS.RECORD_CREATED, (record) => {
      this.broadcastRecord(record);
    });
  }

  broadcastRecord(record) {
    const payload = {
      id: String(record.id || ''),
      title: String(record.title || ''),
      description: String(record.description || ''),
      createdAt: typeof record.createdAt === 'string' ? record.createdAt : new Date(record.createdAt).toISOString(),
    };

    for (const stream of this.activeStreams) {
      try {
        stream.write(payload);
      } catch (err) {
        console.warn(`[GrpcRecordServer] Stream write failed: ${err.message}`);
        this.activeStreams.delete(stream);
      }
    }
  }

  start() {
    const packageDefinition = protoLoader.loadSync(this.protoPath, {
      keepCase: false,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });
    const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
    const ceplatform = protoDescriptor.ceplatform;

    this.server = new grpc.Server();

    this.server.addService(ceplatform.RecordService.service, {
      getRecord: async (call, callback) => {
        try {
          const { id } = call.request;
          const record = await this.getRecordUseCase.execute(id);
          if (!record) {
            return callback({
              code: grpc.status.NOT_FOUND,
              message: `Record with id ${id} not found`,
            });
          }
          callback(null, {
            id: String(record.id),
            title: record.title,
            description: record.description || '',
            createdAt: typeof record.createdAt === 'string' ? record.createdAt : new Date(record.createdAt).toISOString(),
          });
        } catch (err) {
          callback({
            code: grpc.status.INTERNAL,
            message: err.message,
          });
        }
      },
      watchRecords: (call) => {
        this.activeStreams.add(call);
        call.on('cancelled', () => {
          this.activeStreams.delete(call);
        });
        call.on('end', () => {
          this.activeStreams.delete(call);
        });
        call.on('error', () => {
          this.activeStreams.delete(call);
        });
      },
    });

    return new Promise((resolve, reject) => {
      this.server.bindAsync(
        `${this.host}:${this.port}`,
        grpc.ServerCredentials.createInsecure(),
        (err, boundPort) => {
          if (err) {
            return reject(err);
          }
          console.log(`[GrpcRecordServer] gRPC Server listening on ${this.host}:${boundPort}`);
          resolve(boundPort);
        }
      );
    });
  }

  stop() {
    for (const stream of this.activeStreams) {
      try {
        stream.end();
      } catch (e) {}
    }
    this.activeStreams.clear();

    if (this.server) {
      this.server.forceShutdown();
    }
  }
}

module.exports = GrpcRecordServer;
