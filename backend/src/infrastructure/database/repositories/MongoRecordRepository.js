'use strict';

const mongoose = require('mongoose');
const { RecordModel } = require('../mongoose/schemas/Record.schema');
const RecordEntity = require('../../../domain/entities/Record.entity');

class MongoRecordRepository {
  constructor(model = RecordModel) {
    this.model = model;
    this.inMemoryStore = new Map();
    this.inMemoryIdSeq = 1;
  }

  async create(data) {
    if (mongoose.connection.readyState === 1) {
      const doc = await this.model.create({
        title: data.title,
        description: data.description,
      });
      return new RecordEntity({
        id: doc._id.toString(),
        title: doc.title,
        description: doc.description,
        createdAt: doc.createdAt,
      });
    }

    // In-memory fallback
    const id = `rec-${this.inMemoryIdSeq++}`;
    const entity = new RecordEntity({
      id,
      title: data.title,
      description: data.description,
      createdAt: new Date(),
    });
    this.inMemoryStore.set(id, entity);
    return entity;
  }

  async findById(id) {
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      const doc = await this.model.findById(id).lean();
      if (!doc) return null;
      return new RecordEntity({
        id: doc._id.toString(),
        title: doc.title,
        description: doc.description,
        createdAt: doc.createdAt,
      });
    }

    // In-memory fallback
    const entity = this.inMemoryStore.get(id);
    return entity || null;
  }

  async findAll({ limit = 50, skip = 0 } = {}) {
    if (mongoose.connection.readyState === 1) {
      const docs = await this.model.find().skip(skip).limit(limit).lean();
      return docs.map((doc) => new RecordEntity({
        id: doc._id.toString(),
        title: doc.title,
        description: doc.description,
        createdAt: doc.createdAt,
      }));
    }

    // In-memory fallback
    const all = Array.from(this.inMemoryStore.values());
    return all.slice(skip, skip + limit);
  }

  async findByTitleOrDescription(text) {
    if (mongoose.connection.readyState === 1) {
      const regex = new RegExp(text, 'i');
      const docs = await this.model.find({
        $or: [{ title: regex }, { description: regex }],
      }).lean();
      return docs.map((doc) => new RecordEntity({
        id: doc._id.toString(),
        title: doc.title,
        description: doc.description,
        createdAt: doc.createdAt,
      }));
    }

    // In-memory fallback
    const q = text.toLowerCase();
    return Array.from(this.inMemoryStore.values()).filter(
      (r) => r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)
    );
  }
}

module.exports = MongoRecordRepository;
