import { render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { expect, vi, type Mock } from 'vitest';
import { ResumesProvider, resumesRoutes } from '.';
import { todayIso } from './format';
import { sampleResumeVersions } from './sampleData';
import { emptySections, type ResumeVersion } from './types';

// Test helper: answers the resumes API the way the backend does, from an in-memory list.
// A POST stores a new Processing version, unless `refusal` gives the response to send instead.
export function fakeResumesBackend(versions: ResumeVersion[] = [], refusal?: () => Response) {
  const saved = [...versions];
  return vi.fn<typeof fetch>(async (_input, init) => {
    if (init?.method !== 'POST') return Response.json(saved);
    if (refusal) return refusal();
    const form = init.body as FormData;
    const version: ResumeVersion = {
      id: String(saved.length + 1),
      versionName: String(form.get('versionName')),
      parseStatus: 'Processing',
      isPrimary: false,
      uploaded: todayIso(),
      parseAttempts: 1,
      failureReason: '',
      sections: emptySections(),
    };
    saved.push(version);
    return Response.json(version, { status: 201 });
  });
}

// Test helper: renders this feature's routes at `path`, starting from `initialResumes` without
// waiting for a load. Uploads go to `backend`, a fake resumes API by default.
export function renderAt(
  path: string,
  initialResumes: ResumeVersion[] = sampleResumeVersions,
  backend: Mock<typeof fetch> = fakeResumesBackend(initialResumes),
) {
  vi.stubGlobal('fetch', backend);
  const router = createMemoryRouter(resumesRoutes, { initialEntries: [path] });
  render(
    <ResumesProvider initialResumes={initialResumes}>
      <RouterProvider router={router} />
    </ResumesProvider>,
  );
  return router;
}

// Test helper: renders `path` with the versions loaded from `backend`, as the app does.
export async function renderFromApi(path: string, backend: Mock<typeof fetch>) {
  vi.stubGlobal('fetch', backend);
  const router = createMemoryRouter(resumesRoutes, { initialEntries: [path] });
  render(
    <ResumesProvider>
      <RouterProvider router={router} />
    </ResumesProvider>,
  );
  await waitFor(() => expect(screen.queryByText(/^Loading/)).not.toBeInTheDocument());
  return router;
}
