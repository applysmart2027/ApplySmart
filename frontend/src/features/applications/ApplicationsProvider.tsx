import { useEffect, useReducer, useState, type ReactNode } from 'react';
import { listApplications } from './api';
import { ApplicationsContext, applicationsReducer, type LoadStatus } from './store';

export function ApplicationsProvider({ children }: { children: ReactNode }) {
  const [records, dispatch] = useReducer(applicationsReducer, []);
  const [status, setStatus] = useState<LoadStatus>('loading');

  useEffect(() => {
    listApplications()
      .then((loaded) => {
        dispatch({ type: 'loaded', records: loaded });
        setStatus('ready');
      })
      .catch(() => setStatus('failed'));
  }, []);

  return (
    <ApplicationsContext value={{ records, status, dispatch }}>{children}</ApplicationsContext>
  );
}
