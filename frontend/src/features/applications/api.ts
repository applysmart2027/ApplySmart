import { csrfToken } from '../../shared/csrf';
import type { ApplicationDraft, ApplicationRecord } from './types';

const RECORDS_URL = '/api/applications/';

async function readJson(response: Response) {
  // A 403 means the session has ended; reloading brings back the sign-in screen.
  if (response.status === 403) window.location.reload();
  if (!response.ok) throw new Error(`Application records request failed: ${response.status}`);
  return response.json();
}

// The backend numbers its records; the routes and the store use string ids.
function toRecord(json: ApplicationRecord): ApplicationRecord {
  return { ...json, id: String(json.id) };
}

export async function listApplications(): Promise<ApplicationRecord[]> {
  const records: ApplicationRecord[] = await readJson(await fetch(RECORDS_URL));
  return records.map(toRecord);
}

export async function createApplication(draft: ApplicationDraft): Promise<ApplicationRecord> {
  const response = await fetch(RECORDS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken() },
    body: JSON.stringify(draft),
  });
  return toRecord(await readJson(response));
}
