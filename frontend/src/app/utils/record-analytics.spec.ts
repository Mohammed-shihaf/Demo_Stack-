import { summarizeRecordBatch } from './record-analytics';

describe('record-analytics utility (frontend)', () => {
  it('handles empty batches cleanly', () => {
    const res = summarizeRecordBatch([]);
    expect(res.totalRecords).toBe(0);
    expect(res.status).toBe('EMPTY_BATCH');
  });

  it('categorizes batches into EdTech and Retail domains', () => {
    const mockData = [
      { id: '1', title: 'Student Transcript Request', description: 'Grade card retrieval' },
      { id: '2', title: 'Payment Confirmation', description: 'Credit card transaction receipt' },
      { id: '3', title: 'A', description: 'Short' },
    ];
    const res = summarizeRecordBatch(mockData);
    expect(res.totalRecords).toBe(3);
    expect(res.categories.edtech).toBe(1);
    expect(res.categories.retail).toBe(1);
    expect(res.lowPriorityCount).toBe(1);
  });

  it('handles tag matrices with deepMatrixScan', () => {
    const data = [
      { id: '1', title: 'T1', description: 'D1', tags: ['angular', 'rxjs'] },
      { id: '2', title: 'T2', description: 'D2', tags: ['rxjs', 'esbuild'] },
    ];
    const res = summarizeRecordBatch(data, { deepMatrixScan: true });
    expect(res.crossTagMatches).toBeGreaterThanOrEqual(0);
  });
});
