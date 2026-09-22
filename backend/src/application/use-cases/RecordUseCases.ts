import { CreateRecordDto, RecordResponseDto } from '../dtos/Record.dto';
import { recordEventBus, RECORD_EVENTS } from '../../domain/events/recordEvents';

export interface RecordRepositoryPort {
  create(data: { title: string; description: string }): Promise<any>;
  findById(id: string): Promise<any>;
  findAll(options?: { limit?: number; skip?: number }): Promise<any[]>;
  findByTitleOrDescription?(text: string): Promise<any[]>;
}

export interface SearchPort {
  indexRecord?(record: any): Promise<void>;
  search(query: string): Promise<any[]>;
}

export interface SnsPort {
  publishRecordCreated?(record: any): Promise<any>;
}

export interface SesPort {
  sendRecordCreatedNotification?(record: any, recipient?: string): Promise<any>;
}

export class CreateRecordUseCase {
  constructor(
    private readonly dependencies: {
      recordRepository: RecordRepositoryPort;
      searchAdapter?: SearchPort;
      snsPublisher?: SnsPort;
      sesNotifier?: SesPort;
    }
  ) {}

  async execute(input: { title: string; description?: string }): Promise<RecordResponseDto> {
    const dto = new CreateRecordDto(input);
    const savedEntity = await this.dependencies.recordRepository.create(dto);
    const responseDto = new RecordResponseDto(savedEntity);

    recordEventBus.emit(RECORD_EVENTS.RECORD_CREATED, responseDto);

    if (this.dependencies.searchAdapter && typeof this.dependencies.searchAdapter.indexRecord === 'function') {
      try {
        await this.dependencies.searchAdapter.indexRecord(responseDto);
      } catch (err: any) {
        console.warn(`[CreateRecordUseCase] Search indexing warning: ${err.message}`);
      }
    }

    if (this.dependencies.snsPublisher && typeof this.dependencies.snsPublisher.publishRecordCreated === 'function') {
      try {
        await this.dependencies.snsPublisher.publishRecordCreated(responseDto);
      } catch (err: any) {
        console.warn(`[CreateRecordUseCase] SNS publish warning: ${err.message}`);
      }
    }

    if (this.dependencies.sesNotifier && typeof this.dependencies.sesNotifier.sendRecordCreatedNotification === 'function') {
      try {
        await this.dependencies.sesNotifier.sendRecordCreatedNotification(responseDto);
      } catch (err: any) {
        console.warn(`[CreateRecordUseCase] SES notification warning: ${err.message}`);
      }
    }

    return responseDto;
  }
}

export class GetRecordByIdUseCase {
  constructor(private readonly recordRepository: RecordRepositoryPort) {}

  async execute(id: string): Promise<RecordResponseDto | null> {
    if (!id) {
      throw new Error('Record ID is required');
    }
    const recordEntity = await this.recordRepository.findById(id);
    if (!recordEntity) {
      return null;
    }
    return new RecordResponseDto(recordEntity);
  }
}

export class ListRecordsUseCase {
  constructor(private readonly recordRepository: RecordRepositoryPort) {}

  async execute(options: { limit?: number; skip?: number } = {}): Promise<RecordResponseDto[]> {
    const entities = await this.recordRepository.findAll(options);
    return entities.map((entity) => new RecordResponseDto(entity));
  }
}

export class SearchRecordsUseCase {
  constructor(
    private readonly searchAdapter: SearchPort,
    private readonly recordRepository?: RecordRepositoryPort
  ) {}

  async execute(query: string): Promise<any[]> {
    if (!query || typeof query !== 'string' || !query.trim()) {
      return [];
    }

    if (this.searchAdapter && typeof this.searchAdapter.search === 'function') {
      try {
        return await this.searchAdapter.search(query.trim());
      } catch (err: any) {
        console.warn(`[SearchRecordsUseCase] Elasticsearch search failed: ${err.message}. Falling back to DB search.`);
      }
    }

    if (this.recordRepository && typeof this.recordRepository.findByTitleOrDescription === 'function') {
      const entities = await this.recordRepository.findByTitleOrDescription(query.trim());
      return entities.map((e) => new RecordResponseDto(e));
    }

    return [];
  }
}

export class ExportFormatUseCase {
  constructor(private readonly recordRepository: RecordRepositoryPort) {}

  async execute(format: string = 'json'): Promise<any> {
    const records = await this.recordRepository.findAll();
    const dtos = records.map((r) => new RecordResponseDto(r));

    if (format === 'csv') {
      const header = 'id,title,description,createdAt\n';
      const rows = dtos.map((d) => `"${d.id}","${d.title.replace(/"/g, '""')}","${d.description.replace(/"/g, '""')}","${d.createdAt}"`).join('\n');
      return header + rows;
    }

    if (format === 'xml') {
      const items = dtos.map((d) => `  <record>\n    <id>${d.id}</id>\n    <title>${d.title}</title>\n    <description>${d.description}</description>\n    <createdAt>${d.createdAt}</createdAt>\n  </record>`).join('\n');
      return `<records>\n${items}\n</records>`;
    }

    return dtos;
  }
}

export default {
  CreateRecordUseCase,
  GetRecordByIdUseCase,
  ListRecordsUseCase,
  SearchRecordsUseCase,
  ExportFormatUseCase,
};
