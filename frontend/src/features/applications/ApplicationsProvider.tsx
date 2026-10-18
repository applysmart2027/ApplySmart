import type { ReactNode } from 'react';
import { sampleApplications } from './sampleData';
import { ApplicationsContext } from './store';
import type { ApplicationRecord } from './types';

export function ApplicationsProvider({
  children,
  initialRecords = sampleApplications,
}: {
  children: ReactNode;
  initialRecords?: ApplicationRecord[];
}) {
  return <ApplicationsContext value={initialRecords}>{children}</ApplicationsContext>;
}
