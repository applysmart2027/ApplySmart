import { createContext, useContext, type Dispatch } from 'react';
import type { ApplicationRecord } from './types';

type ApplicationsAction = { type: 'created'; record: ApplicationRecord };

export function applicationsReducer(
  records: ApplicationRecord[],
  action: ApplicationsAction,
): ApplicationRecord[] {
  return [...records, action.record];
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
