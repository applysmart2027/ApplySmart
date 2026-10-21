import { createContext, useContext, type Dispatch } from 'react';
import type { ResumeVersion } from './types';

type ResumesAction =
  | { type: 'created' | 'updated'; resume: ResumeVersion }
  | { type: 'removed' | 'madePrimary'; id: string };

export function resumesReducer(resumes: ResumeVersion[], action: ResumesAction): ResumeVersion[] {
  switch (action.type) {
    case 'created':
      return [...resumes, action.resume];
    case 'updated':
      return resumes.map((r) => (r.id === action.resume.id ? action.resume : r));
    case 'removed':
      return resumes.filter((r) => r.id !== action.id);
    case 'madePrimary':
      return resumes.map((r) => ({ ...r, isPrimary: r.id === action.id }));
  }
}

export const ResumesContext = createContext<{
  resumes: ResumeVersion[];
  dispatch: Dispatch<ResumesAction>;
} | null>(null);

export function useResumes() {
  const value = useContext(ResumesContext);
  if (!value) throw new Error('useResumes must be used inside ResumesProvider');
  return value;
}

export function useResume(id: string | undefined) {
  return useResumes().resumes.find((r) => r.id === id);
}
