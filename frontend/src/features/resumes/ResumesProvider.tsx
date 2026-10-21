import { useReducer, type ReactNode } from 'react';
import { sampleResumeVersions } from './sampleData';
import { ResumesContext, resumesReducer } from './store';
import type { ResumeVersion } from './types';

export function ResumesProvider({
  children,
  initialResumes = sampleResumeVersions,
}: {
  children: ReactNode;
  initialResumes?: ResumeVersion[];
}) {
  const [resumes, dispatch] = useReducer(resumesReducer, initialResumes);
  return <ResumesContext value={{ resumes, dispatch }}>{children}</ResumesContext>;
}
