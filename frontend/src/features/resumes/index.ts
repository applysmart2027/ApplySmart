import type { RouteObject } from 'react-router';
import { ResolveFirstFailedResume, ResolveResumePage } from './ResolveResumePage';
import { ResumesPage } from './ResumesPage';
import { ReviewResumePage } from './ReviewResumePage';

export { ResumesProvider } from './ResumesProvider';

export const resumesRoutes: RouteObject[] = [
  { path: 'resumes', Component: ResumesPage },
  { path: 'resumes/resolve', Component: ResolveFirstFailedResume },
  { path: 'resumes/:id/resolve', Component: ResolveResumePage },
  { path: 'resumes/:id/review', Component: ReviewResumePage },
];
