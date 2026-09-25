'use strict';

const assert = require('assert');
const request = require('supertest');
const createApp = require('../src/app');
const ElasticsearchAdapter = require('../src/infrastructure/search/ElasticsearchAdapter');

describe('Unified Backend Search Tests', () => {
  let app;

  beforeEach(() => {
    const context = createApp();
    app = context.app;
  });

  it('GET /api/search returns empty list for blank query', async () => {
    const res = await request(app).get('/api/search?q=');
    assert.strictEqual(res.status, 200);
    assert.deepStrictEqual(res.body, []);
  });

  it('GET /api/search finds indexed record by matching query in fallback mode', async () => {
    await request(app).post('/api/records').send({
      title: 'Elasticsearch Indexing Item',
      description: 'Searchable content for verification',
    });

    const res = await request(app).get('/api/search?q=Searchable');
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body));
    assert.ok(res.body.length >= 1);
    assert.strictEqual(res.body[0].title, 'Elasticsearch Indexing Item');
  });

  it('GET /api/search treats regex metacharacters in the query as literal text (regex-injection safe)', async () => {
    await request(app).post('/api/records').send({
      title: 'Price is $5 (special)',
      description: 'Contains regex metacharacters: ( ) $ .',
    });

    // A raw `new RegExp(q)` would either throw on unbalanced input or match
    // far more broadly than intended; escaping first keeps this a literal match.
    const res = await request(app).get('/api/search?q=' + encodeURIComponent('$5 (special)'));
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body));
    assert.ok(res.body.some((r) => r.title === 'Price is $5 (special)'));
  });

  it('ElasticsearchAdapter handles null client gracefully', async () => {
    const adapter = new ElasticsearchAdapter({ node: 'http://invalid-es-node:9200' });
    adapter.client = null;
    await adapter.indexRecord({ id: 'test-1', title: 'Test Title', description: 'Desc' });
    const results = await adapter.search('Test');
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].id, 'test-1');
  });
});
