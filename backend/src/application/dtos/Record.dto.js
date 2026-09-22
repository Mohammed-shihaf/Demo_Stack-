'use strict';

class CreateRecordDto {
  constructor({ title, description }) {
    if (!title || typeof title !== 'string' || !title.trim()) {
      throw new Error('Title is required and must be a non-empty string');
    }
    this.title = title.trim();
    this.description = typeof description === 'string' ? description.trim() : '';
  }
}

class RecordResponseDto {
  constructor(recordEntity) {
    this.id = recordEntity.id ? String(recordEntity.id) : '';
    this.title = recordEntity.title;
    this.description = recordEntity.description;
    this.createdAt = recordEntity.createdAt instanceof Date
      ? recordEntity.createdAt.toISOString()
      : recordEntity.createdAt;
  }
}

module.exports = {
  CreateRecordDto,
  RecordResponseDto,
};
