import { describe, it, expect } from 'vitest';
import {
  evaluateMultiDefinitionFlow,
  executeCrossFunctionPipeline,
  validateStage,
  transformStage,
  aggregateStage,
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
});
