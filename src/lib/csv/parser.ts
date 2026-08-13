import Papa from 'papaparse';
import { CSVParseResult, CSVRecipientRow } from '@/types';

export function parseRecipientCSV(
  fileContent: string,
  existingEmails: string[] = []
): Promise<CSVParseResult> {
  return new Promise((resolve) => {
    Papa.parse<Record<string, string>>(fileContent, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (h) => h.trim().toLowerCase(),
      complete: (results) => {
        const rows = results.data;
        const validRows: CSVRecipientRow[] = [];
        const invalidRows: CSVRecipientRow[] = [];
        let duplicateCount = 0;

        const seenInFile = new Set<string>();

        rows.forEach((row) => {
          // Normalize header keys
          const name = row['name'] || row['fullname'] || row['full_name'] || row['student name'] || '';
          const email = row['email'] || row['email address'] || '';
          const regNum =
            row['registrationnumber'] ||
            row['regnumber'] ||
            row['reg_num'] ||
            row['roll number'] ||
            row['registration number'] ||
            '';
          const dept = row['department'] || row['dept'] || row['branch'] || '';
          const course = row['course'] || row['workshop'] || row['program'] || '';
          const achievement = row['achievement'] || row['position'] || row['role'] || '';

          const trimmedName = name.trim();
          const trimmedEmail = email.trim().toLowerCase();

          if (!trimmedName) {
            invalidRows.push({
              name: name || '[Empty Name]',
              email,
              registrationNumber: regNum,
              department: dept,
              course,
              achievement,
              isValid: false,
              error: 'Full name is required',
            });
            return;
          }

          let isDuplicate = false;
          let duplicateMessage = '';

          if (trimmedEmail) {
            if (seenInFile.has(trimmedEmail)) {
              isDuplicate = true;
              duplicateMessage = 'Duplicate email found in file';
            } else if (existingEmails.map((e) => e.toLowerCase()).includes(trimmedEmail)) {
              isDuplicate = true;
              duplicateMessage = 'Recipient email already exists in event';
            } else {
              seenInFile.add(trimmedEmail);
            }
          }

          if (isDuplicate) {
            duplicateCount++;
          }

          validRows.push({
            name: trimmedName,
            email: trimmedEmail,
            registrationNumber: regNum.trim(),
            department: dept.trim(),
            course: course.trim(),
            achievement: achievement.trim(),
            isValid: true,
            isDuplicate,
            error: duplicateMessage ? duplicateMessage : undefined,
          });
        });

        resolve({
          totalRows: rows.length,
          validRows,
          invalidRows,
          duplicateCount,
        });
      },
    });
  });
}

export function generateSampleCSV(): string {
  const headers = 'name,email,registrationNumber,department,course,achievement\n';
  const sampleData = [
    'Subash P,subash@example.com,23CS101,CSE,React Workshop,Participant',
    'Arun Kumar,arun@example.com,23CS102,CSE,React Workshop,Participant',
    'Priya S,priya@example.com,23CS103,IT,React Workshop,First Place',
    'Kavin R,kavin@example.com,23CS104,ECE,React Workshop,Participant',
    'Divya M,divya@example.com,23CS105,CSE,React Workshop,Second Place',
  ].join('\n');

  return headers + sampleData;
}
