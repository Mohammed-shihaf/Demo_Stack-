'use strict';

const assert = require('assert');
const request = require('supertest');
const createApp = require('../src/app');

describe('Unified Backend REST API Tests', () => {
  let app;
  let recordRepository;

  beforeEach(() => {
    const context = createApp();
    app = context.app;
    recordRepository = context.recordRepository;
  });

  it('GET /health returns 200 with status UP', async () => {
    const res = await request(app).get('/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'UP');
    assert.ok(res.body.timestamp);
  });

  it('GET /ready returns 200 with status READY', async () => {
    const res = await request(app).get('/ready');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'READY');
  });

  it('Enforces security headers (HSTS, CSP, X-Frame-Options, nosniff)', async () => {
    const res = await request(app).get('/health');
    assert.strictEqual(res.headers['x-frame-options'], 'DENY');
    assert.strictEqual(res.headers['x-content-type-options'], 'nosniff');
    assert.ok(res.headers['strict-transport-security']);
    assert.ok(res.headers['content-security-policy']);
  });

  it('POST /api/records creates a new record and returns 201', async () => {
    const res = await request(app)
      .post('/api/records')
      .send({ title: 'Test Record 1', description: 'Enterprise DDD Architecture' });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.title, 'Test Record 1');
    assert.strictEqual(res.body.description, 'Enterprise DDD Architecture');
    assert.ok(res.body.id);
  });

  it('POST /api/records rejects empty title with 400 Bad Request', async () => {
    const res = await request(app)
      .post('/api/records')
      .send({ title: '', description: 'No title' });

    assert.strictEqual(res.status, 400);
  });

  it('GET /api/records lists all created records', async () => {
    await request(app).post('/api/records').send({ title: 'Rec A', description: 'Desc A' });
    await request(app).post('/api/records').send({ title: 'Rec B', description: 'Desc B' });

    const res = await request(app).get('/api/records');
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body));
    assert.strictEqual(res.body.length, 2);
  });

  it('GET /api/records/:id returns specific record or 404', async () => {
    const created = await request(app).post('/api/records').send({ title: 'Fetch Me', description: 'Fetch Desc' });
    const id = created.body.id;

    const resFound = await request(app).get(`/api/records/${id}`);
    assert.strictEqual(resFound.status, 200);
    assert.strictEqual(resFound.body.title, 'Fetch Me');

    const resNotFound = await request(app).get('/api/records/non-existent-id');
    assert.strictEqual(resNotFound.status, 404);
  });

  it('GET /api/records/export exports records in JSON, CSV, and XML', async () => {
    await request(app).post('/api/records').send({ title: 'Export Item 1', description: 'Desc 1' });

    const resJson = await request(app).get('/api/records/export?format=json');
    assert.strictEqual(resJson.status, 200);
    assert.ok(Array.isArray(resJson.body));

    const resCsv = await request(app).get('/api/records/export?format=csv');
    assert.strictEqual(resCsv.status, 200);
    assert.ok(resCsv.text.includes('Export Item 1'));

    const resXml = await request(app).get('/api/records/export?format=xml');
    assert.strictEqual(resXml.status, 200);
    assert.ok(resXml.text.includes('<title>Export Item 1</title>'));
  });

  it('Returns 404 for unknown endpoints', async () => {
    const res = await request(app).get('/api/unknown-endpoint');
    assert.strictEqual(res.status, 404);
  });
});
