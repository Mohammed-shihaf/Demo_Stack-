import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

export class GrpcRecordClient {
  private protoPath: string;
  private target: string;
  public client: any;

  constructor(options: { protoPath: string; host?: string; port?: number }) {
    this.protoPath = options.protoPath;
    this.target = `${options.host || 'localhost'}:${options.port || 50051}`;
    this.init();
  }

  init() {
    const packageDefinition = protoLoader.loadSync(this.protoPath, {
      keepCase: false,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });
    const protoDescriptor: any = grpc.loadPackageDefinition(packageDefinition);
    this.client = new protoDescriptor.ceplatform.RecordService(
      this.target,
      grpc.credentials.createInsecure()
    );
  }

  getRecord(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.getRecord({ id }, (err: any, response: any) => {
        if (err) return reject(err);
        resolve(response);
      });
    });
  }

  watchRecords(onData?: (data: any) => void, onError?: (err: any) => void): any {
    const stream = this.client.watchRecords({});
    if (typeof onData === 'function') {
      stream.on('data', onData);
    }
    if (typeof onError === 'function') {
      stream.on('error', onError);
    }
    return stream;
  }

  close() {
    if (this.client) {
      grpc.closeClient(this.client);
    }
  }
}

export default GrpcRecordClient;
