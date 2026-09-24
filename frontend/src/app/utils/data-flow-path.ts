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

export interface LoopPathOptions {
  maxLimit?: number;
  filterNegatives?: boolean;
}

export interface LoopPathResult {
  totalInputItems: number;
  iterationCount: number;
  processedCount: number;
  skippedCount: number;
  breakTriggered: boolean;
  totalSum: number;
  processedItems: number[];
  hasZeroIterations: boolean;
  hasSingleIteration: boolean;
  hasMultipleIterations: boolean;
}

export interface ExceptionPathOptions {
  fallbackValue?: number;
  rethrowFatal?: boolean;
  forceError?: boolean;
}

export interface ExceptionPathResult {
  executionStatus: 'SUCCESS' | 'RECOVERED' | 'PENDING';
  resultValue: number | null;
  caughtErrorMessage: string | null;
  finalCleanupExecuted: boolean;
}

export interface MultiFunctionRouteResult {
  executedPath: 'EXPRESS' | 'DETAILED' | 'RECOVERY' | 'DEFAULT';
  priorityWeight: number;
  computedScore: number;
  isFallbackApplied?: boolean;
}

export function evaluateLoopPaths(items?: unknown[] | null, options: LoopPathOptions = {}): LoopPathResult {
  const list = Array.isArray(items) ? items : [];
  const maxLimit = typeof options.maxLimit === 'number' ? options.maxLimit : Infinity;
  const filterNegatives = Boolean(options.filterNegatives);

  let iterationCount = 0;
  let breakTriggered = false;
  let skippedCount = 0;
  let totalSum = 0;
  const processedItems: number[] = [];

  for (let i = 0; i < list.length; i++) {
    iterationCount++;

    if (processedItems.length >= maxLimit) {
      breakTriggered = true;
      break;
    }

    const item = list[i];
    if (item === null || item === undefined || (filterNegatives && typeof item === 'number' && item < 0)) {
      skippedCount++;
      continue;
    }

    const numVal = typeof item === 'number' ? item : (Number(item) || 0);
    totalSum += numVal;
    processedItems.push(numVal);
  }

  return {
    totalInputItems: list.length,
    iterationCount,
    processedCount: processedItems.length,
    skippedCount,
    breakTriggered,
    totalSum,
    processedItems,
    hasZeroIterations: iterationCount === 0,
    hasSingleIteration: iterationCount === 1,
    hasMultipleIterations: iterationCount > 1,
  };
}

export function executeExceptionHandlingPath(
  input?: { value?: number } | null,
  options: ExceptionPathOptions = {}
): ExceptionPathResult {
  const { fallbackValue = 0, rethrowFatal = false, forceError = false } = options;
  let finalCleanupExecuted = false;
  let executionStatus: 'SUCCESS' | 'RECOVERED' | 'PENDING' = 'PENDING';
  let resultValue: number | null = null;
  let caughtErrorMessage: string | null = null;

  try {
    if (forceError || !input || typeof input.value !== 'number') {
      throw new DataFlowError('Invalid payload: numerical value is required', {
        received: input,
      });
    }

    if (input.value < 0) {
      throw new DataFlowError('Value out of bounds: negative value prohibited', {
        receivedValue: input.value,
      });
    }

    resultValue = input.value * 2;
    executionStatus = 'SUCCESS';
  } catch (err: unknown) {
    caughtErrorMessage = err instanceof Error ? err.message : String(err);
    if (rethrowFatal) {
      throw err;
    }
    resultValue = fallbackValue;
    executionStatus = 'RECOVERED';
  } finally {
    finalCleanupExecuted = true;
  }

  return {
    executionStatus,
    resultValue,
    caughtErrorMessage,
    finalCleanupExecuted,
  };
}

function pathExpress(record?: DataFlowRecord | null): MultiFunctionRouteResult {
  const val = record && typeof record.value === 'number' ? record.value : 0;
  return {
    executedPath: 'EXPRESS',
    priorityWeight: 1.0,
    computedScore: val * 1.5,
  };
}

function pathDetailed(record?: DataFlowRecord | null): MultiFunctionRouteResult {
  const val = record && typeof record.value === 'number' ? record.value : 0;
  const bonus = val > 50 ? 25 : 5;
  return {
    executedPath: 'DETAILED',
    priorityWeight: 2.0,
    computedScore: val * 2.0 + bonus,
  };
}

function pathRecovery(): MultiFunctionRouteResult {
  return {
    executedPath: 'RECOVERY',
    priorityWeight: 0.5,
    computedScore: 10,
    isFallbackApplied: true,
  };
}

function pathDefault(record?: DataFlowRecord | null): MultiFunctionRouteResult {
  const val = record && typeof record.value === 'number' ? record.value : 0;
  return {
    executedPath: 'DEFAULT',
    priorityWeight: 1.0,
    computedScore: val,
  };
}

export function routeMultiFunctionPath(
  record?: DataFlowRecord | null,
  strategy = 'DEFAULT'
): MultiFunctionRouteResult {
  const normalized = String(strategy).toUpperCase();

  if (normalized === 'EXPRESS') {
    return pathExpress(record);
  } else if (normalized === 'DETAILED') {
    return pathDetailed(record);
  } else if (normalized === 'RECOVERY') {
    return pathRecovery();
  }

  return pathDefault(record);
}
