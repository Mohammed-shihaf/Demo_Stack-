import { describe, it, expect } from 'vitest';
import {
  evaluateMultiDefinitionFlow,
  executeCrossFunctionPipeline,
  evaluateLoopPaths,
  executeExceptionHandlingPath,
  routeMultiFunctionPath,
  DataFlowError,
} from './data-flow-path';

describe('data-flow-path utility (frontend)', () => {
  describe('evaluateMultiDefinitionFlow', () => {
    it('exercises TIER_1_OPTIMAL multi-def branch', () => {
      const res = evaluateMultiDefinitionFlow(150, 100, 2);
      expect(res.outcomeStatus).toBe('TIER_1_OPTIMAL');
      expect(res.adjustmentFactor).toBe(1.25);
      expect(res.adjustedScore).toBe(187.5);
      expect(res.guardedDiagnostic).toBe('nominal');
    });

    it('exercises TIER_2_STANDARD multi-def branch', () => {
      const res = evaluateMultiDefinitionFlow(120, 100, 0);
      expect(res.outcomeStatus).toBe('TIER_2_STANDARD');
      expect(res.adjustmentFactor).toBe(1.1);
      expect(res.adjustedScore).toBe(132);
    });

    it('exercises TIER_3_EQUAL multi-def branch', () => {
      const res = evaluateMultiDefinitionFlow(100, 100, 0);
      expect(res.outcomeStatus).toBe('TIER_3_EQUAL');
      expect(res.adjustmentFactor).toBe(1.0);
      expect(res.adjustedScore).toBe(100);
    });

    it('exercises TIER_4_SUBOPTIMAL multi-def branch', () => {
      const res = evaluateMultiDefinitionFlow(80, 100, 0);
      expect(res.outcomeStatus).toBe('TIER_4_SUBOPTIMAL');
      expect(res.adjustmentFactor).toBe(0.85);
      expect(res.adjustedScore).toBe(68);
    });
  });

  describe('executeCrossFunctionPipeline', () => {
    it('propagates state across discrete stages with PLATINUM tier', () => {
      const res = executeCrossFunctionPipeline({ id: 'f-101', value: 100, tier: 'PLATINUM' }, 0, [25, 25]);
      expect(res.recordId).toBe('f-101');
      expect(res.multiplier).toBe(3.5);
      expect(res.weightedScore).toBe(350);
      expect(res.qualifiesForBonus).toBe(true);
      expect(res.totalScore).toBe(400);
      expect(res.clearanceLevel).toBe('ALPHA');
      expect(res.appliedModifierCount).toBe(2);
    });

    it('handles GOLD, SILVER, and STANDARD tiers correctly', () => {
      const gold = executeCrossFunctionPipeline({ id: 'f-102', value: 50, tier: 'GOLD' });
      expect(gold.multiplier).toBe(2.0);
      expect(gold.clearanceLevel).toBe('BETA');

      const silver = executeCrossFunctionPipeline({ id: 'f-103', value: 40, tier: 'SILVER' });
      expect(silver.multiplier).toBe(1.5);
      expect(silver.clearanceLevel).toBe('GAMMA');

      const standard = executeCrossFunctionPipeline({ id: 'f-104', value: 30, tier: 'STANDARD' });
      expect(standard.multiplier).toBe(1.0);
    });

    it('allows customMultiplier definition to override tier logic', () => {
      const custom = executeCrossFunctionPipeline({ id: 'f-105', value: 20 }, 4.0);
      expect(custom.multiplier).toBe(4.0);
      expect(custom.weightedScore).toBe(80);
    });

    it('handles empty / default inputs', () => {
      const empty = executeCrossFunctionPipeline(null);
      expect(empty.recordId).toBe('unknown');
      expect(empty.totalScore).toBe(0);
      expect(empty.clearanceLevel).toBe('GAMMA');
    });

    it('instantiates DataFlowError', () => {
      const err = new DataFlowError('Validation failure', { step: 1 });
      expect(err.name).toBe('DataFlowError');
      expect(err.message).toBe('Validation failure');
      expect(err.details['step']).toBe(1);
    });
  });

  describe('evaluateLoopPaths', () => {
    it('executes zero-iteration loop path', () => {
      const res = evaluateLoopPaths([]);
      expect(res.iterationCount).toBe(0);
      expect(res.hasZeroIterations).toBe(true);
      expect(res.hasSingleIteration).toBe(false);
      expect(res.hasMultipleIterations).toBe(false);
      expect(res.breakTriggered).toBe(false);
    });

    it('executes single-iteration loop path', () => {
      const res = evaluateLoopPaths([77]);
      expect(res.iterationCount).toBe(1);
      expect(res.hasZeroIterations).toBe(false);
      expect(res.hasSingleIteration).toBe(true);
      expect(res.totalSum).toBe(77);
    });

    it('executes multi-iteration loop path', () => {
      const res = evaluateLoopPaths([1, 2, 3, 4]);
      expect(res.iterationCount).toBe(4);
      expect(res.hasMultipleIterations).toBe(true);
      expect(res.totalSum).toBe(10);
    });

    it('triggers early break on maxLimit', () => {
      const res = evaluateLoopPaths([10, 20, 30], { maxLimit: 1 });
      expect(res.breakTriggered).toBe(true);
      expect(res.processedCount).toBe(1);
      expect(res.totalSum).toBe(10);
    });

    it('skips items on continue conditions', () => {
      const res = evaluateLoopPaths([10, null, -5, undefined, 20], { filterNegatives: true });
      expect(res.skippedCount).toBe(3);
      expect(res.processedCount).toBe(2);
      expect(res.totalSum).toBe(30);
    });
  });

  describe('executeExceptionHandlingPath', () => {
    it('executes success path and verifies finally block', () => {
      const res = executeExceptionHandlingPath({ value: 15 });
      expect(res.executionStatus).toBe('SUCCESS');
      expect(res.resultValue).toBe(30);
      expect(res.finalCleanupExecuted).toBe(true);
    });

    it('executes recovered fallback path on invalid input', () => {
      const res = executeExceptionHandlingPath(null, { fallbackValue: 0 });
      expect(res.executionStatus).toBe('RECOVERED');
      expect(res.resultValue).toBe(0);
      expect(res.caughtErrorMessage).toContain('numerical value is required');
      expect(res.finalCleanupExecuted).toBe(true);
    });

    it('executes recovered fallback path on negative value', () => {
      const res = executeExceptionHandlingPath({ value: -1 }, { fallbackValue: 5 });
      expect(res.executionStatus).toBe('RECOVERED');
      expect(res.resultValue).toBe(5);
      expect(res.finalCleanupExecuted).toBe(true);
    });

    it('re-throws when rethrowFatal is enabled', () => {
      expect(() => {
        executeExceptionHandlingPath(null, { rethrowFatal: true });
      }).toThrowError(DataFlowError);
    });
  });

  describe('routeMultiFunctionPath', () => {
    it('routes through EXPRESS path', () => {
      const res = routeMultiFunctionPath({ value: 10 }, 'EXPRESS');
      expect(res.executedPath).toBe('EXPRESS');
      expect(res.computedScore).toBe(15);
    });

    it('routes through DETAILED path (high bonus vs regular bonus)', () => {
      const high = routeMultiFunctionPath({ value: 60 }, 'DETAILED');
      expect(high.executedPath).toBe('DETAILED');
      expect(high.computedScore).toBe(145);

      const reg = routeMultiFunctionPath({ value: 10 }, 'DETAILED');
      expect(reg.computedScore).toBe(25);
    });

    it('routes through RECOVERY path', () => {
      const res = routeMultiFunctionPath(null, 'RECOVERY');
      expect(res.executedPath).toBe('RECOVERY');
      expect(res.isFallbackApplied).toBe(true);
    });

    it('routes through DEFAULT path', () => {
      const res = routeMultiFunctionPath({ value: 22 }, 'UNKNOWN');
      expect(res.executedPath).toBe('DEFAULT');
      expect(res.computedScore).toBe(22);
    });
  });
});
