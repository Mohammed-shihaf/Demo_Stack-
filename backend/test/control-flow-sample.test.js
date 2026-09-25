'use strict';

const assert = require('assert');
const ControlFlowSampleService = require('../src/domain/services/ControlFlowSampleService');

describe('Control Flow Sample Service Tests', () => {
  it('rejects empty input via the early-exit path', () => {
    const result = ControlFlowSampleService.parseStrictInteger('');
    assert.strictEqual(result.ok, false);
    assert.strictEqual(result.reason, 'empty-input');
  });

  it('parses a valid integer via the normal-return path', () => {
    const result = ControlFlowSampleService.parseStrictInteger('42');
    assert.strictEqual(result.ok, true);
    assert.strictEqual(result.value, 42);
  });

  it('catches a non-numeric string via the exception path', () => {
    const result = ControlFlowSampleService.parseStrictInteger('not-a-number');
    assert.strictEqual(result.ok, false);
    assert.ok(result.reason.includes('Not an integer'));
  });

  it('runs the summing loop zero times on empty input', () => {
    const result = ControlFlowSampleService.sumUntilThreshold([], 10);
    assert.strictEqual(result.sum, 0);
    assert.strictEqual(result.stoppedEarly, false);
    assert.strictEqual(result.itemsSeen, 0);
  });

  it('runs the summing loop to completion without crossing the threshold', () => {
    const result = ControlFlowSampleService.sumUntilThreshold([1, 2, 3], 100);
    assert.strictEqual(result.sum, 6);
    assert.strictEqual(result.stoppedEarly, false);
  });

  it('stops the summing loop early once the threshold is crossed', () => {
    const result = ControlFlowSampleService.sumUntilThreshold([10, 10, 10, 10], 15);
    assert.strictEqual(result.stoppedEarly, true);
    assert.ok(result.sum >= 15);
  });

  it('classifies a fragile international shipment', () => {
    assert.strictEqual(ControlFlowSampleService.classifyShipment(15, true, 'international'), 'freight-fragile-intl');
    assert.strictEqual(ControlFlowSampleService.classifyShipment(5, true, 'international'), 'priority-fragile-intl');
  });

  it('classifies a fragile domestic shipment', () => {
    assert.strictEqual(ControlFlowSampleService.classifyShipment(25, true, 'domestic'), 'freight-fragile-domestic');
    assert.strictEqual(ControlFlowSampleService.classifyShipment(5, true, 'domestic'), 'priority-fragile-domestic');
  });

  it('classifies a non-fragile international shipment', () => {
    assert.strictEqual(ControlFlowSampleService.classifyShipment(35, false, 'international'), 'freight-intl');
    assert.strictEqual(ControlFlowSampleService.classifyShipment(5, false, 'international'), 'standard-intl');
  });

  it('classifies a non-fragile domestic shipment', () => {
    assert.strictEqual(ControlFlowSampleService.classifyShipment(60, false, 'domestic'), 'freight-domestic');
    assert.strictEqual(ControlFlowSampleService.classifyShipment(5, false, 'domestic'), 'standard-domestic');
  });

  it('rejects a non-positive weight', () => {
    assert.throws(() => ControlFlowSampleService.classifyShipment(0, false, 'domestic'), RangeError);
  });
});
