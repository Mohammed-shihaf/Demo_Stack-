import { RecordEntity } from '../../domain/entities/Record.entity';

export class CreateRecordDto {
  public readonly title: string;
  public readonly description: string;

  constructor(input: { title?: string; description?: string }) {
    if (!input.title || typeof input.title !== 'string' || !input.title.trim()) {
      throw new Error('Title is required and must be a non-empty string');
    }
    this.title = input.title.trim();
    this.description = typeof input.description === 'string' ? input.description.trim() : '';
  }
}

export class RecordResponseDto {
  public readonly id: string;
  public readonly title: string;
  public readonly description: string;
  public readonly createdAt: string;

  constructor(recordEntity: RecordEntity) {
    this.id = recordEntity.id ? String(recordEntity.id) : '';
    this.title = recordEntity.title;
    this.description = recordEntity.description;
    this.createdAt = recordEntity.createdAt instanceof Date
      ? recordEntity.createdAt.toISOString()
      : String(recordEntity.createdAt);
  }
}

export default {
  CreateRecordDto,
  RecordResponseDto,
};
