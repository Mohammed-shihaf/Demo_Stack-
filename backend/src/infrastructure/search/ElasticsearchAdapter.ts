import { Client } from '@elastic/elasticsearch';
import { SearchPort } from '../../application/use-cases/RecordUseCases';

export class ElasticsearchAdapter implements SearchPort {
  public index: string;
  public inMemoryIndex: Map<string, any>;
  public client: Client | null;

  constructor(options: { node?: string; index?: string } = {}) {
    this.index = options.index || 'records';
    this.inMemoryIndex = new Map();
    if (process.env.NODE_ENV !== 'test') {
      try {
        this.client = new Client({
          node: options.node || 'http://localhost:9200',
          requestTimeout: 1000,
          maxRetries: 0,
        });
      } catch (e) {
        this.client = null;
      }
    } else {
      this.client = null;
    }
  }

  async ensureIndex(): Promise<void> {
    if (!this.client) return;
    try {
      const exists = await this.client.indices.exists({ index: this.index });
      if (!exists) {
        await this.client.indices.create({
          index: this.index,
          mappings: {
            properties: {
              id: { type: 'keyword' },
              title: { type: 'text' },
              description: { type: 'text' },
              createdAt: { type: 'date' },
            },
          },
        });
      }
    } catch (err: any) {
      console.warn(`[ElasticsearchAdapter] ensureIndex warning: ${err.message}`);
    }
  }

  async indexRecord(record: any): Promise<void> {
    this.inMemoryIndex.set(record.id, record);

    if (!this.client) return;
    try {
      await this.client.index({
        index: this.index,
        id: record.id,
        document: {
          id: record.id,
          title: record.title,
          description: record.description,
          createdAt: record.createdAt,
        },
        refresh: true,
      });
    } catch (err: any) {
      console.warn(`[ElasticsearchAdapter] indexRecord warning: ${err.message}`);
    }
  }

  async search(query: string): Promise<any[]> {
    if (!query) return [];

    if (this.client) {
      try {
        const response: any = await this.client.search({
          index: this.index,
          query: {
            multi_match: {
              query,
              fields: ['title^2', 'description'],
            },
          },
        });
        const hits = response.hits?.hits || [];
        return hits.map((hit: any) => hit._source);
      } catch (err: any) {
        console.warn(`[ElasticsearchAdapter] ES search failed: ${err.message}, fallback to in-memory.`);
      }
    }

    const q = query.toLowerCase();
    return Array.from(this.inMemoryIndex.values()).filter(
      (r: any) =>
        (r.title && r.title.toLowerCase().includes(q)) ||
        (r.description && r.description.toLowerCase().includes(q))
    );
  }
}

export default ElasticsearchAdapter;
