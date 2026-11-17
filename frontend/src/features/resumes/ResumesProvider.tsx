import { useEffect, useReducer, useState, type ReactNode } from 'react';
import { listResumes } from './api';
import { sampleResumeVersions } from './sampleData';
import { ResumesContext, resumesReducer, type LoadStatus } from './store';
import type { ResumeVersion } from './types';

// Loads the signed-in student's versions from the backend and lists them after the sample
// versions, so the Review and Resolve screens can still be shown before parsing exists. The
// samples are not saved. Tests can pass `initialResumes` instead, which skips the request.
export function ResumesProvider({
  children,
  initialResumes,
}: {
  children: ReactNode;
  initialResumes?: ResumeVersion[];
}) {
  const loadFromApi = initialResumes === undefined;
  const [resumes, dispatch] = useReducer(resumesReducer, initialResumes ?? []);
  const [status, setStatus] = useState<LoadStatus>(loadFromApi ? 'loading' : 'ready');

  useEffect(() => {
    if (!loadFromApi) return;
    listResumes()
      .then((loaded) => {
        dispatch({ type: 'loaded', resumes: [...sampleResumeVersions, ...loaded] });
        setStatus('ready');
      })
      .catch(() => setStatus('failed'));
  }, [loadFromApi]);

  return <ResumesContext value={{ resumes, status, dispatch }}>{children}</ResumesContext>;
}
