import { csrfToken } from '../../shared/csrf';
import type { ResumeVersion } from './types';

const RESUMES_URL = '/api/resumes/';

// The backend refused the upload (400 or 409) and said why. Nothing was stored.
export class UploadRefusedError extends Error {
  readonly field: 'file' | 'name';

  constructor(field: 'file' | 'name', message: string) {
    super(message);
    this.field = field;
  }
}

async function readJson(response: Response) {
  // A 403 means the session has ended; reloading brings back the sign-in screen.
  if (response.status === 403) window.location.reload();
  if (!response.ok) throw new Error(`Resumes request failed: ${response.status}`);
  return response.json();
}

// The backend numbers its versions; the routes and the store use string ids.
function toVersion(json: ResumeVersion): ResumeVersion {
  return { ...json, id: String(json.id) };
}

export async function listResumes(): Promise<ResumeVersion[]> {
  const versions: ResumeVersion[] = await readJson(await fetch(RESUMES_URL));
  return versions.map(toVersion);
}

export async function uploadResume(file: File, versionName: string): Promise<ResumeVersion> {
  const body = new FormData();
  body.append('file', file);
  body.append('versionName', versionName);
  // No Content-Type header: the browser adds the multipart boundary itself.
  const response = await fetch(RESUMES_URL, {
    method: 'POST',
    headers: { 'X-CSRFToken': csrfToken() },
    body,
  });
  if (response.status === 400 || response.status === 409) {
    const refusal: { file?: string; versionName?: string; detail?: string } = await response.json();
    if (refusal.versionName) throw new UploadRefusedError('name', refusal.versionName);
    throw new UploadRefusedError('file', refusal.file ?? refusal.detail ?? '');
  }
  return toVersion(await readJson(response));
}
