import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { recordEventBus, RECORD_EVENTS } from '../../domain/events/recordEvents';

export class GrpcRecordServer {
  private protoPath: string;
  private host: string;
  private port: number;
  private getRecordUseCase: any;
  public server: grpc.Server | null = null;
  private activeStreams: Set<any> = new Set();

  constructor(options: { protoPath: string; host?: string; port?: number; getRecordUseCase: any }) {
    this.protoPath = options.protoPath;
    this.host = options.host || '0.0.0.0';
    this.port = options.port || 50051;
    this.getRecordUseCase = options.getRecordUseCase;

    recordEventBus.on(RECORD_EVENTS.RECORD_CREATED, (record) => {
      this.broadcastRecord(record);
    });
  }

  broadcastRecord(record: any) {
    const payload = {
      id: String(record.id || ''),
      title: String(record.title || ''),
      description: String(record.description || ''),
      createdAt: typeof record.createdAt === 'string' ? record.createdAt : new Date(record.createdAt).toISOString(),
    };

    for (const stream of this.activeStreams) {
      try {
        stream.write(payload);
      } catch (err: any) {
        console.warn(`[GrpcRecordServer] Stream write failed: ${err.message}`);
        this.activeStreams.delete(stream);
      }
    }
  }

  start(): Promise<number> {
    const packageDefinition = protoLoader.loadSync(this.protoPath, {
      keepCase: false,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });
    const protoDescriptor: any = grpc.loadPackageDefinition(packageDefinition);
    const ceplatform = protoDescriptor.ceplatform;

    this.server = new grpc.Server();

    this.server.addService(ceplatform.RecordService.service, {
      getRecord: async (call: any, callback: any) => {
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
        } catch (err: any) {
          callback({
            code: grpc.status.INTERNAL,
            message: err.message,
          });
        }
      },
      watchRecords: (call: any) => {
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
      this.server!.bindAsync(
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

export default GrpcRecordServer;
