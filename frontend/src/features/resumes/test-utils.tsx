import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { ResumesProvider, resumesRoutes } from '.';
import type { ResumeVersion } from './types';

// Test helper: renders this feature's routes at `path` with a fresh resumes provider.
export function renderAt(path: string, initialResumes?: ResumeVersion[]) {
  const router = createMemoryRouter(resumesRoutes, { initialEntries: [path] });
  render(
    <ResumesProvider initialResumes={initialResumes}>
      <RouterProvider router={router} />
    </ResumesProvider>,
  );
  return router;
}
