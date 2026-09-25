import { describe, it, expect } from 'vitest';
import { accumulateWithEarlyExit, deriveDiscountTier, buildAdjacencySample } from './data-flow-sample';

describe('data-flow-sample utility (frontend)', () => {
  it('accumulates values and stops early once the ceiling is crossed', () => {
    expect(accumulateWithEarlyExit([10, 20, 30, 40], 45)).toBe(45);
  });

  it('accumulates without hitting the ceiling when values stay low', () => {
    expect(accumulateWithEarlyExit([1, 2, 3], 100)).toBe(6);
  });

  it('classifies a gold-tier order and applies the discount', () => {
    const result = deriveDiscountTier(1500);
    expect(result.tier).toBe('gold');
    expect(result.discountRate).toBe(0.15);
  });

  it('classifies a silver-tier order and applies the discount', () => {
    const result = deriveDiscountTier(500);
    expect(result.tier).toBe('silver');
    expect(result.discountRate).toBe(0.08);
  });

  it('returns early with no discount for a standard-tier order', () => {
    const result = deriveDiscountTier(50);
    expect(result.tier).toBe('standard');
    expect(result.discountRate).toBe(0);
    expect(result.note).toBe('no discount applied');
  });

  it('builds an adjacency sample and counts connected edges', () => {
    const { adjacency, edgeCount } = buildAdjacencySample(4);
    expect(adjacency.length).toBe(4);
    expect(edgeCount).toBeGreaterThan(0);
  });

  it('builds an empty adjacency sample when node count is zero', () => {
    const { adjacency, edgeCount } = buildAdjacencySample(0);
    expect(adjacency.length).toBe(0);
    expect(edgeCount).toBe(0);
  });
});
