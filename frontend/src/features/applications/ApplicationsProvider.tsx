import { useReducer, type ReactNode } from 'react';
import { sampleApplications } from './sampleData';
import { ApplicationsContext, applicationsReducer } from './store';
import type { ApplicationRecord } from './types';

export function ApplicationsProvider({
  children,
  initialRecords = sampleApplications,
}: {
  children: ReactNode;
  initialRecords?: ApplicationRecord[];
}) {
  const [records, dispatch] = useReducer(applicationsReducer, initialRecords);
  return <ApplicationsContext value={{ records, dispatch }}>{children}</ApplicationsContext>;
}
