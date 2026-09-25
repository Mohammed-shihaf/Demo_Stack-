const assert = require('assert');
const request = require('supertest');
const app = require('../server');

describe('JavaScript SPA Client Tests', () => {
  it('GET /health returns 200 with status UP', async () => {
    const res = await request(app).get('/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'UP');
    assert.strictEqual(res.body.client, 'JavaScript SPA');
  });

  it('GET / serves index.html', async () => {
    const res = await request(app).get('/');
    assert.strictEqual(res.status, 200);
    assert.ok(res.text.includes('Demo_Stack Platform Testbed'));
  });
});
