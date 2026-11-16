import { createContext, useContext, type Dispatch } from 'react';
import { restrictedApplicationId } from './sampleData';
import type { ApplicationRecord } from './types';

export type LoadStatus = 'loading' | 'ready' | 'failed';

type ApplicationsAction =
  | { type: 'loaded'; records: ApplicationRecord[] }
  | { type: 'created' | 'updated'; record: ApplicationRecord }
  | { type: 'removed'; id: string };

export function applicationsReducer(
  records: ApplicationRecord[],
  action: ApplicationsAction,
): ApplicationRecord[] {
  switch (action.type) {
    case 'loaded':
      return action.records;
    case 'created':
      return [...records, action.record];
    case 'updated':
      return records.map((r) => (r.id === action.record.id ? action.record : r));
    case 'removed':
      return records.filter((r) => r.id !== action.id);
  }
}

export const ApplicationsContext = createContext<{
  records: ApplicationRecord[];
  status: LoadStatus;
  dispatch: Dispatch<ApplicationsAction>;
} | null>(null);

export function useApplications() {
  const value = useContext(ApplicationsContext);
  if (!value) throw new Error('useApplications must be used inside ApplicationsProvider');
  return value;
}

export function useApplication(id: string | undefined) {
  const { records, status } = useApplications();
  if (status !== 'ready') return status;
  if (id === restrictedApplicationId) return 'denied';
  return records.find((r) => r.id === id) ?? 'not-found';
}
