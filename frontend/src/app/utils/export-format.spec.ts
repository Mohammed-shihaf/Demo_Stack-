import { formatRecordToCsvRow, exportRecordsToCsv } from './export-format';

describe('export-format utility (frontend)', () => {
  it('formats single record to CSV row', () => {
    const row = formatRecordToCsvRow({ id: '10', title: 'Test', description: 'Desc', createdAt: '2026-09-22' });
    expect(row).toBe('"10","Test","Desc","2026-09-22"');
  });

  it('exports multiple records to CSV format with header', () => {
    const csv = exportRecordsToCsv([{ id: '1', title: 'T', description: 'D' }]);
    expect(csv).toContain('id,title,description,createdAt\n');
    expect(csv).toContain('"1","T","D"');
  });
});
