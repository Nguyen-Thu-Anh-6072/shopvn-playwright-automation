import fs from 'fs';
import path from 'path';

/**
 * Loads JSON test data from the data folder.
 *
 * Keeping data outside the specs makes the suite data-driven: adding a case
 * is an edit to JSON rather than another copy of the test body.
 */
export function loadData<T>(fileName: string): T {
  const filePath = path.resolve(__dirname, '..', 'data', fileName);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}
