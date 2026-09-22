'use strict';

const RecordEntity = require('../../domain/entities/Record.entity');
const { CreateRecordDto, RecordResponseDto } = require('../dtos/Record.dto');
const { recordEventBus, RECORD_EVENTS } = require('../../domain/events/recordEvents');

class CreateRecordUseCase {
  constructor({ recordRepository, searchAdapter, snsPublisher, sesNotifier }) {
    this.recordRepository = recordRepository;
    this.searchAdapter = searchAdapter;
    this.snsPublisher = snsPublisher;
    this.sesNotifier = sesNotifier;
  }

  async execute(input) {
    const dto = new CreateRecordDto(input);
    const savedEntity = await this.recordRepository.create(dto);
    const responseDto = new RecordResponseDto(savedEntity);

    // Emit in-process domain event
    recordEventBus.emit(RECORD_EVENTS.RECORD_CREATED, responseDto);

    // Index to Elasticsearch if available
    if (this.searchAdapter && typeof this.searchAdapter.indexRecord === 'function') {
      try {
        await this.searchAdapter.indexRecord(responseDto);
      } catch (err) {
        console.warn(`[CreateRecordUseCase] Search indexing warning: ${err.message}`);
      }
    }

    // Publish to SNS if available
    if (this.snsPublisher && typeof this.snsPublisher.publishRecordCreated === 'function') {
      try {
        await this.snsPublisher.publishRecordCreated(responseDto);
      } catch (err) {
        console.warn(`[CreateRecordUseCase] SNS publish warning: ${err.message}`);
      }
    }

    // Send SES notification if available
    if (this.sesNotifier && typeof this.sesNotifier.sendRecordCreatedNotification === 'function') {
      try {
        await this.sesNotifier.sendRecordCreatedNotification(responseDto);
      } catch (err) {
        console.warn(`[CreateRecordUseCase] SES notification warning: ${err.message}`);
      }
    }

    return responseDto;
  }
}

class GetRecordByIdUseCase {
  constructor({ recordRepository }) {
    this.recordRepository = recordRepository;
  }

  async execute(id) {
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

class ListRecordsUseCase {
  constructor({ recordRepository }) {
    this.recordRepository = recordRepository;
  }

  async execute(options = {}) {
    const entities = await this.recordRepository.findAll(options);
    return entities.map((entity) => new RecordResponseDto(entity));
  }
}

class SearchRecordsUseCase {
  constructor({ searchAdapter, recordRepository }) {
    this.searchAdapter = searchAdapter;
    this.recordRepository = recordRepository;
  }

  async execute(query) {
    if (!query || typeof query !== 'string' || !query.trim()) {
      return [];
    }

    if (this.searchAdapter && typeof this.searchAdapter.search === 'function') {
      try {
        return await this.searchAdapter.search(query.trim());
      } catch (err) {
        console.warn(`[SearchRecordsUseCase] Elasticsearch search failed: ${err.message}. Falling back to DB search.`);
      }
    }

    // Fallback: search in MongoDB repository
    if (this.recordRepository && typeof this.recordRepository.findByTitleOrDescription === 'function') {
      const entities = await this.recordRepository.findByTitleOrDescription(query.trim());
      return entities.map((e) => new RecordResponseDto(e));
    }

    return [];
  }
}

class ExportFormatUseCase {
  constructor({ recordRepository }) {
    this.recordRepository = recordRepository;
  }

  async execute(format = 'json') {
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

module.exports = {
  CreateRecordUseCase,
  GetRecordByIdUseCase,
  ListRecordsUseCase,
  SearchRecordsUseCase,
  ExportFormatUseCase,
};
