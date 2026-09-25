/**
 * Data Flow Sample Utility
 * Deliberate multi-definition / cross-function def-use patterns so
 * All-Definition and All-Uses coverage analyzers have concrete pairs to trace.
 */

/** `total` redefined across loop iterations (multiple-definitions handling),
 * used both computationally (running sum) and as a predicate (ceiling check). */
export function accumulateWithEarlyExit(values, ceiling) {
  let total = 0; // definition #1
  for (const v of values) {
    total = total + v; // definition #2
    if (total > ceiling) {
      total = ceiling; // definition #3
      break;
    }
  }
  return total; // computational use
}

function classifyTier(annualRent) {
  if (annualRent >= 60000) return 'gold';
  if (annualRent >= 24000) return 'silver';
  return 'standard';
}

/** Cross-function def-use: `tier` is defined in classifyTier and consumed
 * here; one branch returns early with a value never read further downstream. */
export function deriveLeaseDiscountTier(annualRent) {
  const tier = classifyTier(annualRent); // cross-function definition
  let discountRate = 0;
  if (tier === 'gold') {
    discountRate = 0.15;
  } else if (tier === 'silver') {
    discountRate = 0.08;
  } else {
    discountRate = 0; // defined, immediately returned, never re-read
    return { tier, discountRate, note: 'no discount applied' };
  }
  return { tier, discountRate };
}

/** Multiple definitions of `edgeCount` across nested loops. */
export function buildAdjacencySample(nodeCount) {
  let edgeCount = 0; // definition #1
  const adjacency = [];
  for (let i = 0; i < nodeCount; i++) {
    const row = [];
    for (let j = 0; j < nodeCount; j++) {
      const connected = (i + j) % 3 === 0;
      row.push(connected);
      if (connected) {
        edgeCount = edgeCount + 1; // definition #2
      }
    }
    adjacency.push(row);
  }
  return { adjacency, edgeCount };
}
