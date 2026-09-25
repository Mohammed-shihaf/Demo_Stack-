'use strict';

/**
 * Deliberate data-flow fixtures: multiple definitions of the same variable,
 * cross-function parameter passing, computational vs. predicate use, and an
 * unreachable-use branch. Exists to give All-Definition/All-Uses coverage
 * analyzers concrete def-use pairs to trace, not to model real behavior.
 */
class DataFlowSampleService {
  /**
   * `total` is defined three times (multiple-definitions handling) and used
   * both computationally (the running sum) and as a predicate (the early-exit
   * check), giving C-Use and P-Use detection something to distinguish.
   */
  static accumulateWithEarlyExit(values, ceiling) {
    let total = 0; // definition #1
    for (const v of values) {
      total = total + v; // definition #2 (redefinition)
      if (total > ceiling) {
        // predicate use of `total`
        total = ceiling; // definition #3
        break;
      }
    }
    return total; // computational use of `total`
  }

  /**
   * Passes a definition across a function boundary (cross-function use), and
   * includes one branch whose assigned value is never read afterward
   * (unreachable-use detection).
   */
  static deriveDiscountTier(orderTotal) {
    const tier = DataFlowSampleService._classifyTier(orderTotal); // cross-function def
    let discountRate = 0;
    if (tier === 'gold') {
      discountRate = 0.15;
    } else if (tier === 'silver') {
      discountRate = 0.08;
    } else {
      discountRate = 0; // reachable but never changes downstream outcome
      return { tier, discountRate, note: 'no discount applied' }; // early return
    }
    const unusedFlag = true; // defined, never used again on this path
    return { tier, discountRate };
  }

  static _classifyTier(orderTotal) {
    if (orderTotal >= 1000) return 'gold';
    if (orderTotal >= 250) return 'silver';
    return 'standard';
  }

  /**
   * Multiple definitions of the same parameter across nested loops, so
   * Partial-Uses-Coverage and Coverage-Reporting-Validation checks have a
   * realistic partially-covered function to measure.
   */
  static buildAdjacencySample(nodeCount) {
    let edgeCount = 0; // definition #1
    const adjacency = [];
    for (let i = 0; i < nodeCount; i++) {
      const row = [];
      for (let j = 0; j < nodeCount; j++) {
        const connected = (i + j) % 3 === 0;
        row.push(connected);
        if (connected) {
          edgeCount = edgeCount + 1; // definition #2, computational use of prior value
        }
      }
      adjacency.push(row);
    }
    return { adjacency, edgeCount };
  }
}

module.exports = DataFlowSampleService;
