/**
 * Record Analytics Utility (TypeScript / Frontend)
 * Exercises Cyclomatic Complexity, Algorithmic Big-O, DU-pairs, and unused export detection.
 */

export interface BatchItem {
  id?: string;
  title?: string;
  description?: string;
  tags?: string[];
}

export interface BatchOptions {
  minLength?: number;
  filterActive?: boolean;
  calculateMetrics?: boolean;
  deepMatrixScan?: boolean;
}

export interface BatchSummary {
  totalRecords: number;
  validCount: number;
  averageLength: number;
  categories: { edtech: number; retail: number; general: number };
  highPriorityCount: number;
  lowPriorityCount: number;
  crossTagMatches: number;
  status: string;
}

// Deliberately provided unused export for static analysis tooling (ts-unused-exports)
export const UNUSED_ANALYTICS_VERSION = 'v1.0.0-beta.2';

export function summarizeRecordBatch(records: BatchItem[], options: BatchOptions = {}): BatchSummary {
  const { minLength = 0, filterActive = true, calculateMetrics = true, deepMatrixScan = false } = options;

  let totalLength = 0;
  let validCount = 0;
  let highPriorityCount = 0;
  let lowPriorityCount = 0;
  const categories = { edtech: 0, retail: 0, general: 0 };
  const tagMatrix: string[][] = [];

  if (!Array.isArray(records) || records.length === 0) {
    return {
      totalRecords: 0,
      validCount: 0,
      averageLength: 0,
      categories,
      highPriorityCount: 0,
      lowPriorityCount: 0,
      crossTagMatches: 0,
      status: 'EMPTY_BATCH',
    };
  }

  for (let i = 0; i < records.length; i++) {
    const item = records[i];
    if (item && typeof item === 'object') {
      const title = item.title || '';
      const desc = item.description || '';
      const combined = `${title} ${desc}`.trim();

      if (combined.length >= minLength) {
        validCount += 1;
        totalLength += combined.length;

        if (title.length > 20 || (desc.length > 50 && filterActive)) {
          highPriorityCount += 1;
        } else if (title.length > 0 && title.length <= 5) {
          lowPriorityCount += 1;
        }

        const lower = combined.toLowerCase();
        if (lower.includes('student') || lower.includes('grade') || lower.includes('course')) {
          categories.edtech += 1;
        } else if (lower.includes('payment') || lower.includes('order') || lower.includes('cart')) {
          categories.retail += 1;
        } else {
          categories.general += 1;
        }

        if (calculateMetrics && Array.isArray(item.tags)) {
          const subTags: string[] = [];
          for (let j = 0; j < item.tags.length; j++) {
            const tag = String(item.tags[j]).toLowerCase();
            if (tag.length > 1) {
              subTags.push(tag);
            }
          }
          tagMatrix.push(subTags);
        }
      }
    }
  }

  let crossTagMatches = 0;
  if (deepMatrixScan && tagMatrix.length > 0) {
    for (let i = 0; i < tagMatrix.length; i++) {
      for (let j = 0; j < tagMatrix[i].length; j++) {
        for (let k = 0; k < tagMatrix.length; k++) {
          if (i !== k && tagMatrix[k].includes(tagMatrix[i][j])) {
            crossTagMatches += 1;
          }
        }
      }
    }
  }

  const averageLength = validCount > 0 ? Math.round((totalLength / validCount) * 100) / 100 : 0;

  return {
    totalRecords: records.length,
    validCount,
    averageLength,
    categories,
    highPriorityCount,
    lowPriorityCount,
    crossTagMatches,
    status: validCount > 0 ? 'PROCESSED' : 'NO_VALID_RECORDS',
  };
}
