'use strict';

const assert = require('assert');
const request = require('supertest');
const createApp = require('../src/app');
const RecordAnalyticsDomainService = require('../src/domain/services/RecordAnalyticsDomainService');

describe('Unified Backend Performance & Complexity Tests', () => {
  let app;

  beforeEach(() => {
    const context = createApp();
    app = context.app;
  });

  describe('Cubic Complexity O(n^3) Benchmark Tests', () => {
    it('computes O(n^3) cubic iterations accurately', () => {
      const items = ['a', 'b', 'c', 'd', 'e'];
      const result = RecordAnalyticsDomainService.computeCubicCombinations(items);
      assert.strictEqual(result.inputSize, 5);
      assert.strictEqual(result.iterations, 125); // 5^3
      assert.strictEqual(result.tripletCount, 10); // 5 choose 3
    });

    it('GET /api/performance/cubic-complexity responds with execution telemetry', async () => {
      const res = await request(app).get('/api/performance/cubic-complexity?size=15');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.inputSize, 15);
      assert.strictEqual(res.body.iterations, 3375); // 15^3
      assert.strictEqual(res.body.complexityNotation, 'O(n^3)');
      assert.ok(typeof res.body.executionTimeMs === 'number');
    });
  });

  describe('N+1 Query Detection Pattern Tests', () => {
    it('simulates and detects N+1 queries', () => {
      const result = RecordAnalyticsDomainService.simulateNPlusOneQueryPattern(5);
      assert.strictEqual(result.parentCount, 5);
      assert.strictEqual(result.totalQueriesExecuted, 6); // 1 parent + 5 children
      assert.strictEqual(result.isNPlusOneDetected, true);
    });

    it('GET /api/performance/n-plus-one returns query telemetry', async () => {
      const res = await request(app).get('/api/performance/n-plus-one?count=8');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.parentCount, 8);
      assert.strictEqual(res.body.totalQueriesExecuted, 9);
      assert.strictEqual(res.body.isNPlusOneDetected, true);
    });
  });

  describe('Memory Allocation & GC Telemetry Tests', () => {
    it('generates memory allocations without leak', () => {
      const result = RecordAnalyticsDomainService.generateMemoryAllocations(10, 1024);
      assert.strictEqual(result.chunkCount, 10);
      assert.strictEqual(result.totalBytesAllocated, 10240);
    });

    it('GET /api/performance/memory-telemetry returns memory usage metrics', async () => {
      const res = await request(app).get('/api/performance/memory-telemetry?chunks=20&size=512');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.chunkCount, 20);
      assert.strictEqual(res.body.totalBytesAllocated, 10240);
      assert.ok(res.body.currentProcessMemory.heapUsed > 0);
    });
  });
});
