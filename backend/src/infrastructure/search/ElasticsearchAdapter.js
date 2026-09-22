'use strict';

const { Client } = require('@elastic/elasticsearch');

class ElasticsearchAdapter {
  constructor({ node = 'http://localhost:9200', index = 'records' } = {}) {
    this.index = index;
    this.inMemoryIndex = new Map();
    if (process.env.NODE_ENV !== 'test') {
      try {
        this.client = new Client({
          node,
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

  async ensureIndex() {
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
    } catch (err) {
      console.warn(`[ElasticsearchAdapter] ensureIndex warning: ${err.message}`);
    }
  }

  async indexRecord(record) {
    // Store in fallback map
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
    } catch (err) {
      console.warn(`[ElasticsearchAdapter] indexRecord warning: ${err.message}`);
    }
  }

  async search(query) {
    if (!query) return [];

    if (this.client) {
      try {
        const response = await this.client.search({
          index: this.index,
          query: {
            multi_match: {
              query,
              fields: ['title^2', 'description'],
            },
          },
        });
        const hits = response.hits?.hits || [];
        return hits.map((hit) => hit._source);
      } catch (err) {
        console.warn(`[ElasticsearchAdapter] ES search failed: ${err.message}, fallback to in-memory.`);
      }
    }

    // In-memory search fallback
    const q = query.toLowerCase();
    return Array.from(this.inMemoryIndex.values()).filter(
      (r) =>
        (r.title && r.title.toLowerCase().includes(q)) ||
        (r.description && r.description.toLowerCase().includes(q))
    );
  }
}

module.exports = ElasticsearchAdapter;
