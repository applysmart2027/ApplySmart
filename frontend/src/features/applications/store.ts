import { createContext, useContext, type Dispatch } from 'react';
import { restrictedApplicationId } from './sampleData';
import type { ApplicationRecord } from './types';

type ApplicationsAction = { type: 'created' | 'updated'; record: ApplicationRecord };

export function applicationsReducer(
  records: ApplicationRecord[],
  action: ApplicationsAction,
): ApplicationRecord[] {
  switch (action.type) {
    case 'created':
      return [...records, action.record];
    case 'updated':
      return records.map((r) => (r.id === action.record.id ? action.record : r));
  }
}

export const ApplicationsContext = createContext<{
  records: ApplicationRecord[];
  dispatch: Dispatch<ApplicationsAction>;
} | null>(null);

export function useApplications() {
  const value = useContext(ApplicationsContext);
  if (!value) throw new Error('useApplications must be used inside ApplicationsProvider');
  return value;
}

export function useApplication(id: string | undefined) {
  const { records } = useApplications();
  if (id === restrictedApplicationId) return 'denied';
  return records.find((r) => r.id === id) ?? 'not-found';
}
