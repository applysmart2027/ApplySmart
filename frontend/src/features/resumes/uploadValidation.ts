import { formatUploaded } from './format';

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export type Problem = { field: 'file' | 'name'; message: string };

export function fileProblem(file: File): Problem | null {
  if (!/\.(pdf|docx)$/i.test(file.name)) {
    return { field: 'file', message: 'This file is not a PDF or DOCX. Choose a different file.' };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { field: 'file', message: 'This file is larger than 5 MB. Choose a smaller file.' };
  }
  return null;
}

// A blank version name falls back to the file name without its extension and today's date.
export function defaultVersionName(fileName: string, today: string) {
  return `${fileName.replace(/\.[^.]+$/, '')} - ${formatUploaded(today)}`;
}
