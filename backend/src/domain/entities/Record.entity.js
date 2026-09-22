'use strict';

class RecordEntity {
  constructor({ id, title, description, createdAt = new Date() }) {
    if (!title || typeof title !== 'string' || !title.trim()) {
      throw new Error('Record title is required');
    }
    this.id = id;
    this.title = title.trim();
    this.description = description ? description.trim() : '';
    this.createdAt = createdAt instanceof Date ? createdAt : new Date(createdAt);
  }

  toWire() {
    return {
      id: this.id ? String(this.id) : '',
      title: this.title,
      description: this.description,
      createdAt: this.createdAt.toISOString(),
    };
  }
}

module.exports = RecordEntity;
