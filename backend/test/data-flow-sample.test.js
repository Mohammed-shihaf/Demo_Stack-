'use strict';

const assert = require('assert');
const DataFlowSampleService = require('../src/domain/services/DataFlowSampleService');

describe('Data Flow Sample Service Tests', () => {
  it('accumulates values and stops early once the ceiling is crossed', () => {
    const result = DataFlowSampleService.accumulateWithEarlyExit([10, 20, 30, 40], 45);
    assert.strictEqual(result, 45);
  });

  it('accumulates without hitting the ceiling when values stay low', () => {
    const result = DataFlowSampleService.accumulateWithEarlyExit([1, 2, 3], 100);
    assert.strictEqual(result, 6);
  });

  it('classifies a gold-tier order and applies the discount', () => {
    const result = DataFlowSampleService.deriveDiscountTier(1500);
    assert.strictEqual(result.tier, 'gold');
    assert.strictEqual(result.discountRate, 0.15);
  });

  it('classifies a silver-tier order and applies the discount', () => {
    const result = DataFlowSampleService.deriveDiscountTier(500);
    assert.strictEqual(result.tier, 'silver');
    assert.strictEqual(result.discountRate, 0.08);
  });

  it('returns early with no discount for a standard-tier order', () => {
    const result = DataFlowSampleService.deriveDiscountTier(50);
    assert.strictEqual(result.tier, 'standard');
    assert.strictEqual(result.discountRate, 0);
    assert.strictEqual(result.note, 'no discount applied');
  });

  it('builds an adjacency sample and counts connected edges', () => {
    const { adjacency, edgeCount } = DataFlowSampleService.buildAdjacencySample(4);
    assert.strictEqual(adjacency.length, 4);
    assert.ok(edgeCount > 0);
  });

  it('builds an empty adjacency sample when node count is zero', () => {
    const { adjacency, edgeCount } = DataFlowSampleService.buildAdjacencySample(0);
    assert.strictEqual(adjacency.length, 0);
    assert.strictEqual(edgeCount, 0);
  });
});
