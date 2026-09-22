'use strict';

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

class GrpcRecordClient {
  constructor({ protoPath, host = 'localhost', port = 50051 }) {
    this.protoPath = protoPath;
    this.target = `${host}:${port}`;
    this.client = null;
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
    const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
    this.client = new protoDescriptor.ceplatform.RecordService(
      this.target,
      grpc.credentials.createInsecure()
    );
  }

  getRecord(id) {
    return new Promise((resolve, reject) => {
      this.client.getRecord({ id }, (err, response) => {
        if (err) return reject(err);
        resolve(response);
      });
    });
  }

  watchRecords(onData, onError) {
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

module.exports = GrpcRecordClient;
