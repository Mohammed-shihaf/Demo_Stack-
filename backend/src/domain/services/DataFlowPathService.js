'use strict';

/**
 * DataFlowPathService
 *
 * Implements deliberate data flow patterns (All-Defs, All-Uses, DU-chains,
 * multi-definition handling, cross-function variable flow, and predicate/computational uses)
 * for static data flow analysis tools (js-all-defs-uses, ts-all-defs-uses) and CFG/DFG analyzers.
 */

class DataFlowProcessingError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'DataFlowProcessingError';
    this.details = details;
  }
}

class DataFlowPathService {
  /**
   * Helper function for cross-function data flow: Step 1 Validation.
   * Receives input record, defines validated context, and propagates to next stage.
   */
  static _stageValidate(inputRecord) {
    const rawId = inputRecord && inputRecord.id ? String(inputRecord.id) : 'unknown';
    const rawValue = inputRecord && typeof inputRecord.value === 'number' ? inputRecord.value : 0;
    const tier = inputRecord && inputRecord.tier ? String(inputRecord.tier).toUpperCase() : 'STANDARD';

    return {
      recordId: rawId,
      baseValue: rawValue,
      tier,
      isValid: rawValue >= 0,
      timestamp: Date.now(),
    };
  }

  /**
   * Helper function for cross-function data flow: Step 2 Transformation.
   * Multi-definition mapping for multiplier based on tier predicate.
   */
  static _stageTransform(context, customMultiplier) {
    let multiplier; // Definition 0

    // Multi-definition branch: reaching definitions for multiplier
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

    // Computational use (C-Use) of multiplier & context.baseValue
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
   * Helper function for cross-function data flow: Step 3 Aggregation.
   * Demonstrates cross-function accumulator and loop re-definitions.
   */
  static _stageAggregate(context, modifiers = []) {
    let totalScore = context.weightedScore; // Definition 1 of totalScore

    // Loop with multi-definition reassignments of totalScore (Def 2)
    const activeModifiers = Array.isArray(modifiers) ? modifiers : [];
    for (let i = 0; i < activeModifiers.length; i++) {
      const mod = activeModifiers[i];
      if (typeof mod === 'number') {
        // C-Use of mod and totalScore; Def 2 of totalScore reaching next iteration & exit
        totalScore = totalScore + mod;
      }
    }

    // Predicate use (P-Use) of totalScore
    let clearanceLevel; // Definition of clearanceLevel
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
   * Inter-procedural / cross-function pipeline executing all stages.
   * Demonstrates variable propagation across multiple discrete functions.
   */
  static executeCrossFunctionPipeline(inputRecord, customMultiplier, modifiers) {
    const validated = this._stageValidate(inputRecord);
    const transformed = this._stageTransform(validated, customMultiplier);
    const aggregated = this._stageAggregate(transformed, modifiers);

    return aggregated;
  }

  /**
   * Deliberate multi-definition evaluation with branch-based variable assignments.
   * All-Defs / All-Uses metric coverage.
   */
  static evaluateMultiDefinitionFlow(score, threshold, bias = 0) {
    let outcomeStatus; // Variable definition
    let adjustmentFactor = 1.0; // Variable definition

    // Multi-definition branch decisions (P-Uses of score, threshold, bias)
    if (score > threshold && bias > 0) {
      outcomeStatus = 'TIER_1_OPTIMAL'; // Def 1
      adjustmentFactor = 1.25; // Def 1
    } else if (score > threshold) {
      outcomeStatus = 'TIER_2_STANDARD'; // Def 2
      adjustmentFactor = 1.10; // Def 2
    } else if (score === threshold) {
      outcomeStatus = 'TIER_3_EQUAL'; // Def 3
      adjustmentFactor = 1.0; // Def 3
    } else {
      outcomeStatus = 'TIER_4_SUBOPTIMAL'; // Def 4
      adjustmentFactor = 0.85; // Def 4
    }

    // Computational use (C-Use) of adjustmentFactor and score
    const adjustedScore = Math.round(score * adjustmentFactor * 100) / 100;

    // Guarded unreachable pattern for data flow analyzers (guarded dead definition/use)
    let guardedDiagnostic = 'nominal';
    const isUnreachableEnabled = Boolean(process.env.TESTABLE_DATAFLOW_UNREACHABLE_DEBUG);
    if (isUnreachableEnabled) {
      guardedDiagnostic = 'redefined_in_debug_path';
      return { outcomeStatus, adjustedScore, guardedDiagnostic };
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
}

module.exports = {
  DataFlowPathService,
  DataFlowProcessingError,
};
