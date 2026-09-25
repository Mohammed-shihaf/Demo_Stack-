/**
 * Data Flow Sample Utility (TypeScript)
 * Deliberate multi-definition / cross-function def-use patterns so
 * All-Definition and All-Uses coverage analyzers have concrete pairs to trace.
 */

export interface DiscountResult {
  tier: 'gold' | 'silver' | 'standard';
  discountRate: number;
  note?: string;
}

/** `total` redefined across loop iterations (multiple-definitions handling),
 * used both computationally (running sum) and as a predicate (ceiling check). */
export function accumulateWithEarlyExit(values: number[], ceiling: number): number {
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

function classifyTier(annualSpend: number): DiscountResult['tier'] {
  if (annualSpend >= 2000) return 'gold';
  if (annualSpend >= 800) return 'silver';
  return 'standard';
}

/** Cross-function def-use: `tier` is defined in classifyTier and consumed
 * here; one branch returns early with a value never read further downstream. */
export function deriveMembershipDiscountTier(annualSpend: number): DiscountResult {
  const tier = classifyTier(annualSpend); // cross-function definition
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
export function buildAdjacencySample(nodeCount: number): { adjacency: boolean[][]; edgeCount: number } {
  let edgeCount = 0; // definition #1
  const adjacency: boolean[][] = [];
  for (let i = 0; i < nodeCount; i++) {
    const row: boolean[] = [];
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
