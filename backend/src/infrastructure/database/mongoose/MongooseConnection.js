'use strict';

const mongoose = require('mongoose');

class MongooseConnection {
  static async connect(uri, options = {}) {
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }
    const defaultOptions = {
      serverSelectionTimeoutMS: 2000,
      ...options,
    };
    try {
      await mongoose.connect(uri, defaultOptions);
      return mongoose.connection;
    } catch (err) {
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

module.exports = MongooseConnection;
