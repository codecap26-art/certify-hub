import { describe, it, expect } from 'vitest';
import { parseRecipientCSV, generateSampleCSV } from '../lib/csv/parser';

describe('CSV Parser Utility', () => {
  it('should parse valid CSV data with header mapping', async () => {
    const csvContent = `name,email,registrationNumber,department,course,achievement
Subash P,subash@example.com,23CS101,CSE,React Workshop,Participant
Arun Kumar,arun@example.com,23CS102,CSE,React Workshop,First Place`;

    const result = await parseRecipientCSV(csvContent);
    expect(result.totalRows).toBe(2);
    expect(result.validRows.length).toBe(2);
    expect(result.invalidRows.length).toBe(0);
    expect(result.validRows[0].name).toBe('Subash P');
    expect(result.validRows[1].achievement).toBe('First Place');
  });

  it('should identify invalid rows with missing required full name', async () => {
    const csvContent = `name,email,registrationNumber
,invalid@example.com,23CS103
Divya M,divya@example.com,23CS104`;

    const result = await parseRecipientCSV(csvContent);
    expect(result.validRows.length).toBe(1);
    expect(result.invalidRows.length).toBe(1);
    expect(result.invalidRows[0].error).toBe('Full name is required');
  });

  it('should detect duplicate emails within the file and against existing recipients', async () => {
    const csvContent = `name,email
Priya S,priya@example.com
Priya Duplicate,priya@example.com`;

    const existing = ['subash@example.com'];
    const result = await parseRecipientCSV(csvContent, existing);

    expect(result.duplicateCount).toBe(1);
    expect(result.validRows[1].isDuplicate).toBe(true);
  });

  it('should generate valid sample CSV text', () => {
    const sample = generateSampleCSV();
    expect(sample).toContain('name,email,registrationNumber');
    expect(sample).toContain('Subash P');
  });
});
