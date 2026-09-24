'use strict';

const assert = require('assert');
const {
  DataFlowPathService,
  DataFlowProcessingError,
} = require('../src/domain/services/DataFlowPathService');

describe('DataFlowPathService Domain Tests', () => {
  describe('Multi-Definition Variable Flow Tests', () => {
    it('exercises TIER_1_OPTIMAL multi-def branch when score > threshold and bias > 0', () => {
      const result = DataFlowPathService.evaluateMultiDefinitionFlow(150, 100, 5);
      assert.strictEqual(result.outcomeStatus, 'TIER_1_OPTIMAL');
      assert.strictEqual(result.adjustmentFactor, 1.25);
      assert.strictEqual(result.adjustedScore, 187.5);
      assert.strictEqual(result.guardedDiagnostic, 'nominal');
    });

    it('exercises TIER_2_STANDARD multi-def branch when score > threshold and bias <= 0', () => {
      const result = DataFlowPathService.evaluateMultiDefinitionFlow(120, 100, 0);
      assert.strictEqual(result.outcomeStatus, 'TIER_2_STANDARD');
      assert.strictEqual(result.adjustmentFactor, 1.1);
      assert.strictEqual(result.adjustedScore, 132);
    });

    it('exercises TIER_3_EQUAL multi-def branch when score equals threshold', () => {
      const result = DataFlowPathService.evaluateMultiDefinitionFlow(100, 100, 0);
      assert.strictEqual(result.outcomeStatus, 'TIER_3_EQUAL');
      assert.strictEqual(result.adjustmentFactor, 1.0);
      assert.strictEqual(result.adjustedScore, 100);
    });

    it('exercises TIER_4_SUBOPTIMAL multi-def branch when score < threshold', () => {
      const result = DataFlowPathService.evaluateMultiDefinitionFlow(80, 100, 0);
      assert.strictEqual(result.outcomeStatus, 'TIER_4_SUBOPTIMAL');
      assert.strictEqual(result.adjustmentFactor, 0.85);
      assert.strictEqual(result.adjustedScore, 68);
    });
  });

  describe('Cross-Function Variable Flow & Pipeline Tests', () => {
    it('propagates variable state across validation, transform, and aggregate stages (Platinum)', () => {
      const input = { id: 'rec-101', value: 100, tier: 'PLATINUM' };
      const result = DataFlowPathService.executeCrossFunctionPipeline(input, null, [20, 30]);

      assert.strictEqual(result.recordId, 'rec-101');
      assert.strictEqual(result.multiplier, 3.5);
      assert.strictEqual(result.weightedScore, 350);
      assert.strictEqual(result.qualifiesForBonus, true);
      assert.strictEqual(result.totalScore, 400); // 350 + 20 + 30
      assert.strictEqual(result.clearanceLevel, 'ALPHA');
      assert.strictEqual(result.appliedModifierCount, 2);
    });

    it('propagates variable state with Gold tier and Beta clearance', () => {
      const input = { id: 'rec-102', value: 50, tier: 'GOLD' };
      const result = DataFlowPathService.executeCrossFunctionPipeline(input, null, [10]);

      assert.strictEqual(result.multiplier, 2.0);
      assert.strictEqual(result.weightedScore, 100);
      assert.strictEqual(result.totalScore, 110);
      assert.strictEqual(result.clearanceLevel, 'BETA');
    });

    it('propagates variable state with Silver tier and Gamma clearance', () => {
      const input = { id: 'rec-103', value: 40, tier: 'SILVER' };
      const result = DataFlowPathService.executeCrossFunctionPipeline(input, null, []);

      assert.strictEqual(result.multiplier, 1.5);
      assert.strictEqual(result.weightedScore, 60);
      assert.strictEqual(result.totalScore, 60);
      assert.strictEqual(result.clearanceLevel, 'GAMMA');
    });

    it('supports customMultiplier override reaching definition', () => {
      const input = { id: 'rec-104', value: 20, tier: 'STANDARD' };
      const result = DataFlowPathService.executeCrossFunctionPipeline(input, 5.0, [5]);

      assert.strictEqual(result.multiplier, 5.0);
      assert.strictEqual(result.weightedScore, 100);
      assert.strictEqual(result.totalScore, 105);
      assert.strictEqual(result.clearanceLevel, 'BETA');
    });

    it('handles empty or malformed inputs gracefully with default definitions', () => {
      const result = DataFlowPathService.executeCrossFunctionPipeline(null, 0, null);
      assert.strictEqual(result.recordId, 'unknown');
      assert.strictEqual(result.multiplier, 1.0);
      assert.strictEqual(result.totalScore, 0);
      assert.strictEqual(result.clearanceLevel, 'GAMMA');
    });

    it('instantiates DataFlowProcessingError with message and details', () => {
      const err = new DataFlowProcessingError('Test error', { code: 'DF_01' });
      assert.strictEqual(err.name, 'DataFlowProcessingError');
      assert.strictEqual(err.message, 'Test error');
      assert.strictEqual(err.details.code, 'DF_01');
    });
  });
});
