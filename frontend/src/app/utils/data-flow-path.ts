/**
 * Data Flow & Path Coverage Utility (Frontend / TypeScript)
 *
 * Provides deliberate variable definition-use mapping (DU-pairs, All-Defs, All-Uses,
 * C-uses, P-uses, multi-definition handling, and cross-function propagation)
 * for ts-all-defs-uses and static data flow analysers.
 */

export interface DataFlowRecord {
  id?: string | number;
  value?: number;
  tier?: 'PLATINUM' | 'GOLD' | 'SILVER' | 'STANDARD' | string;
}

export interface DataFlowContext {
  recordId: string;
  baseValue: number;
  tier: string;
  isValid: boolean;
  timestamp: number;
  multiplier?: number;
  weightedScore?: number;
  qualifiesForBonus?: boolean;
}

export interface DataFlowAggregatedResult extends DataFlowContext {
  totalScore: number;
  clearanceLevel: 'ALPHA' | 'BETA' | 'GAMMA';
  appliedModifierCount: number;
}

export interface DataFlowMultiDefResult {
  inputScore: number;
  threshold: number;
  outcomeStatus: string;
  adjustmentFactor: number;
  adjustedScore: number;
  guardedDiagnostic: string;
}

export class DataFlowError extends Error {
  constructor(message: string, public readonly details: Record<string, unknown> = {}) {
    super(message);
    this.name = 'DataFlowError';
  }
}

/**
 * Step 1: Inter-procedural validation stage.
 * Defines validated context structure and passes down the pipeline.
 */
export function validateStage(record?: DataFlowRecord | null): DataFlowContext {
  const recordId = record && record.id !== undefined ? String(record.id) : 'unknown';
  const baseValue = record && typeof record.value === 'number' ? record.value : 0;
  const rawTier = record && record.tier ? String(record.tier).toUpperCase() : 'STANDARD';

  return {
    recordId,
    baseValue,
    tier: rawTier,
    isValid: baseValue >= 0,
    timestamp: Date.now(),
  };
}

/**
 * Step 2: Multi-definition stage for multiplier based on tier predicate.
 */
export function transformStage(context: DataFlowContext, customMultiplier?: number): DataFlowContext {
  let multiplier: number; // Definition 0

  // Multi-definition branch: reaching definitions
  if (typeof customMultiplier === 'number' && customMultiplier > 0) {
    multiplier = customMultiplier; // Definition 1
  } else if (context.tier === 'PLATINUM') {
    multiplier = 3.5; // Definition 2
  } else if (context.tier === 'GOLD') {
    multiplier = 2.0; // Definition 3
  } else if (context.tier === 'SILVER') {
    multiplier = 1.5; // Definition 4
  } else {
    multiplier = 1.0; // Definition 5
  }

  // Computational use (C-Use) of multiplier & baseValue
  const weightedScore = context.baseValue * multiplier;

  // Predicate use (P-Use) of weightedScore
  const qualifiesForBonus = weightedScore >= 100;

  return {
    ...context,
    multiplier,
    weightedScore,
    qualifiesForBonus,
  };
}

/**
 * Step 3: Inter-procedural aggregation with loop accumulator re-definitions.
 */
export function aggregateStage(context: DataFlowContext, modifiers: number[] = []): DataFlowAggregatedResult {
  let totalScore = context.weightedScore ?? context.baseValue; // Definition 1

  // Loop re-definitions (Def 2 reaching next iteration & loop exit)
  const activeModifiers = Array.isArray(modifiers) ? modifiers : [];
  for (let i = 0; i < activeModifiers.length; i++) {
    const mod = activeModifiers[i];
    if (typeof mod === 'number') {
      totalScore = totalScore + mod; // C-Use of mod and totalScore; Def 2
    }
  }

  // Predicate use (P-Use) of totalScore determining clearance level
  let clearanceLevel: 'ALPHA' | 'BETA' | 'GAMMA';
  if (totalScore >= 250) {
    clearanceLevel = 'ALPHA'; // Def 1
  } else if (totalScore >= 100) {
    clearanceLevel = 'BETA'; // Def 2
  } else {
    clearanceLevel = 'GAMMA'; // Def 3
  }

  return {
    ...context,
    totalScore,
    clearanceLevel,
    appliedModifierCount: activeModifiers.length,
  };
}

/**
 * Cross-function pipeline executing all stages sequentially.
 */
export function executeCrossFunctionPipeline(
  record?: DataFlowRecord | null,
  customMultiplier?: number,
  modifiers: number[] = []
): DataFlowAggregatedResult {
  const validated = validateStage(record);
  const transformed = transformStage(validated, customMultiplier);
  return aggregateStage(transformed, modifiers);
}

/**
 * Branch-based multi-definition evaluation with All-Defs / All-Uses pairs.
 */
export function evaluateMultiDefinitionFlow(
  score: number,
  threshold: number,
  bias = 0
): DataFlowMultiDefResult {
  let outcomeStatus: string;
  let adjustmentFactor = 1.0;

  // Multi-definition branch decisions (P-Uses of score, threshold, bias)
  if (score > threshold && bias > 0) {
    outcomeStatus = 'TIER_1_OPTIMAL'; // Def 1
    adjustmentFactor = 1.25;
  } else if (score > threshold) {
    outcomeStatus = 'TIER_2_STANDARD'; // Def 2
    adjustmentFactor = 1.1;
  } else if (score === threshold) {
    outcomeStatus = 'TIER_3_EQUAL'; // Def 3
    adjustmentFactor = 1.0;
  } else {
    outcomeStatus = 'TIER_4_SUBOPTIMAL'; // Def 4
    adjustmentFactor = 0.85;
  }

  // Computational use (C-Use) of adjustmentFactor and score
  const adjustedScore = Math.round(score * adjustmentFactor * 100) / 100;

  // Guarded unreachable pattern for data flow analysers
  let guardedDiagnostic = 'nominal';
  const unreachableGuard = false;
  if (unreachableGuard) {
    guardedDiagnostic = 'redefined_in_debug_path';
  }

  return {
    inputScore: score,
    threshold,
    outcomeStatus,
    adjustmentFactor,
    adjustedScore,
    guardedDiagnostic,
  };
}
