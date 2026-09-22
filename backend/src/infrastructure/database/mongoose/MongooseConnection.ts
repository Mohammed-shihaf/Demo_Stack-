import mongoose from 'mongoose';

export class MongooseConnection {
  static async connect(uri: string, options: mongoose.ConnectOptions = {}) {
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }
    const defaultOptions: mongoose.ConnectOptions = {
      serverSelectionTimeoutMS: 2000,
      ...options,
    };
    try {
      await mongoose.connect(uri, defaultOptions);
      return mongoose.connection;
    } catch (err: any) {
      console.warn(`[MongooseConnection] Connection failed: ${err.message}`);
      return null;
    }
  }

  static async disconnect() {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

export default MongooseConnection;
