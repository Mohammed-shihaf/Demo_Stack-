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

  describe('Control Flow & Loop Path Detection Tests', () => {
    it('executes zero-iteration loop path when collection is empty', () => {
      const result = DataFlowPathService.evaluateLoopPaths([]);
      assert.strictEqual(result.iterationCount, 0);
      assert.strictEqual(result.processedCount, 0);
      assert.strictEqual(result.hasZeroIterations, true);
      assert.strictEqual(result.hasSingleIteration, false);
      assert.strictEqual(result.hasMultipleIterations, false);
      assert.strictEqual(result.breakTriggered, false);
    });

    it('executes exactly one iteration loop path', () => {
      const result = DataFlowPathService.evaluateLoopPaths([42]);
      assert.strictEqual(result.iterationCount, 1);
      assert.strictEqual(result.processedCount, 1);
      assert.strictEqual(result.hasZeroIterations, false);
      assert.strictEqual(result.hasSingleIteration, true);
      assert.strictEqual(result.totalSum, 42);
    });

    it('executes multi-iteration loop path with multiple items', () => {
      const result = DataFlowPathService.evaluateLoopPaths([10, 20, 30]);
      assert.strictEqual(result.iterationCount, 3);
      assert.strictEqual(result.processedCount, 3);
      assert.strictEqual(result.hasMultipleIterations, true);
      assert.strictEqual(result.totalSum, 60);
    });

    it('exercises early break condition path when maxLimit reached', () => {
      const result = DataFlowPathService.evaluateLoopPaths([10, 20, 30, 40], { maxLimit: 2 });
      assert.strictEqual(result.processedCount, 2);
      assert.strictEqual(result.breakTriggered, true);
      assert.strictEqual(result.totalSum, 30); // 10 + 20
    });

    it('exercises continue condition path skipping null, undefined, and filtered negative items', () => {
      const result = DataFlowPathService.evaluateLoopPaths([15, null, -10, undefined, 25], { filterNegatives: true });
      assert.strictEqual(result.skippedCount, 3);
      assert.strictEqual(result.processedCount, 2);
      assert.strictEqual(result.totalSum, 40);
    });
  });

  describe('Exception Handling & Branch Recovery Path Tests', () => {
    it('executes success path without exceptions and verifies finally block completion', () => {
      const result = DataFlowPathService.executeExceptionHandlingPath({ value: 50 });
      assert.strictEqual(result.executionStatus, 'SUCCESS');
      assert.strictEqual(result.resultValue, 100);
      assert.strictEqual(result.caughtErrorMessage, null);
      assert.strictEqual(result.finalCleanupExecuted, true);
    });

    it('executes caught exception and recovery fallback path when input is invalid', () => {
      const result = DataFlowPathService.executeExceptionHandlingPath(null, { fallbackValue: -999 });
      assert.strictEqual(result.executionStatus, 'RECOVERED');
      assert.strictEqual(result.resultValue, -999);
      assert.ok(result.caughtErrorMessage.includes('numerical value is required'));
      assert.strictEqual(result.finalCleanupExecuted, true);
    });

    it('executes caught exception and recovery when value is negative out-of-bounds', () => {
      const result = DataFlowPathService.executeExceptionHandlingPath({ value: -5 }, { fallbackValue: 0 });
      assert.strictEqual(result.executionStatus, 'RECOVERED');
      assert.ok(result.caughtErrorMessage.includes('negative value prohibited'));
      assert.strictEqual(result.finalCleanupExecuted, true);
    });

    it('re-throws exception when rethrowFatal is enabled and runs finally', () => {
      assert.throws(
        () => {
          DataFlowPathService.executeExceptionHandlingPath(null, { rethrowFatal: true });
        },
        (err) => err instanceof DataFlowProcessingError
      );
    });
  });

  describe('Multi-Function Branch Routing Tests', () => {
    it('routes through EXPRESS path', () => {
      const result = DataFlowPathService.routeMultiFunctionPath({ value: 20 }, 'EXPRESS');
      assert.strictEqual(result.executedPath, 'EXPRESS');
      assert.strictEqual(result.computedScore, 30);
    });

    it('routes through DETAILED path (high value bonus)', () => {
      const result = DataFlowPathService.routeMultiFunctionPath({ value: 60 }, 'DETAILED');
      assert.strictEqual(result.executedPath, 'DETAILED');
      assert.strictEqual(result.computedScore, 145); // 60*2 + 25
    });

    it('routes through DETAILED path (standard bonus)', () => {
      const result = DataFlowPathService.routeMultiFunctionPath({ value: 10 }, 'DETAILED');
      assert.strictEqual(result.executedPath, 'DETAILED');
      assert.strictEqual(result.computedScore, 25); // 10*2 + 5
    });

    it('routes through RECOVERY path', () => {
      const result = DataFlowPathService.routeMultiFunctionPath(null, 'RECOVERY');
      assert.strictEqual(result.executedPath, 'RECOVERY');
      assert.strictEqual(result.isFallbackApplied, true);
    });

    it('routes through DEFAULT path for unrecognised strategy', () => {
      const result = DataFlowPathService.routeMultiFunctionPath({ value: 33 }, 'UNKNOWN');
      assert.strictEqual(result.executedPath, 'DEFAULT');
      assert.strictEqual(result.computedScore, 33);
    });
  });
});
