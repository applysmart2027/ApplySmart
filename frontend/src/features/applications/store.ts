import { createContext, useContext } from 'react';
import type { ApplicationRecord } from './types';

export const ApplicationsContext = createContext<ApplicationRecord[] | null>(null);

export function useApplications() {
  const records = useContext(ApplicationsContext);
  if (!records) throw new Error('useApplications must be used inside ApplicationsProvider');
  return records;
}
