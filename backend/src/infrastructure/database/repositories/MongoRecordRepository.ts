import mongoose, { Model } from 'mongoose';
import { RecordModel, IRecordDocument } from '../mongoose/schemas/Record.schema';
import { RecordEntity } from '../../../domain/entities/Record.entity';
import { RecordRepositoryPort } from '../../../application/use-cases/RecordUseCases';

export class MongoRecordRepository implements RecordRepositoryPort {
  private inMemoryStore: Map<string, RecordEntity> = new Map();
  private inMemoryIdSeq: number = 1;

  constructor(private readonly model: Model<IRecordDocument> = RecordModel) {}

  async create(data: { title: string; description?: string }): Promise<RecordEntity> {
    if (mongoose.connection.readyState === 1) {
      const doc = await this.model.create({
        title: data.title,
        description: data.description || '',
      });
      return new RecordEntity({
        id: (doc._id as any).toString(),
        title: doc.title,
        description: doc.description,
        createdAt: doc.createdAt,
      });
    }

    const id = `rec-${this.inMemoryIdSeq++}`;
    const entity = new RecordEntity({
      id,
      title: data.title,
      description: data.description || '',
      createdAt: new Date(),
    });
    this.inMemoryStore.set(id, entity);
    return entity;
  }

  async findById(id: string): Promise<RecordEntity | null> {
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      const doc = await this.model.findById(id).lean();
      if (!doc) return null;
      return new RecordEntity({
        id: (doc._id as any).toString(),
        title: (doc as any).title,
        description: (doc as any).description,
        createdAt: (doc as any).createdAt,
      });
    }

    const entity = this.inMemoryStore.get(id);
    return entity || null;
  }

  async findAll(options: { limit?: number; skip?: number } = {}): Promise<RecordEntity[]> {
    const limit = options.limit || 50;
    const skip = options.skip || 0;

    if (mongoose.connection.readyState === 1) {
      const docs = await this.model.find().skip(skip).limit(limit).lean();
      return docs.map((doc: any) => new RecordEntity({
        id: doc._id.toString(),
        title: doc.title,
        description: doc.description,
        createdAt: doc.createdAt,
      }));
    }

    const all = Array.from(this.inMemoryStore.values());
    return all.slice(skip, skip + limit);
  }

  async findByTitleOrDescription(text: string): Promise<RecordEntity[]> {
    if (mongoose.connection.readyState === 1) {
      const regex = new RegExp(text, 'i');
      const docs = await this.model.find({
        $or: [{ title: regex }, { description: regex }],
      }).lean();
      return docs.map((doc: any) => new RecordEntity({
        id: doc._id.toString(),
        title: doc.title,
        description: doc.description,
        createdAt: doc.createdAt,
      }));
    }

    const q = text.toLowerCase();
    return Array.from(this.inMemoryStore.values()).filter(
      (r) => r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)
    );
  }
}

export default MongoRecordRepository;
