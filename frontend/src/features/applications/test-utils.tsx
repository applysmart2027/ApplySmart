import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { expect, vi, type Mock } from 'vitest';
import { ApplicationsProvider, applicationsRoutes } from '.';
import { sampleApplications } from './sampleData';
import type { ApplicationRecord } from './types';

// Test helper: answers the records API the way the backend does, from an in-memory list.
export function fakeRecordsBackend(records = sampleApplications) {
  const saved = [...records];
  return vi.fn<typeof fetch>(async (_input, init) => {
    if (init?.method !== 'POST') return Response.json(saved);
    const record = { ...JSON.parse(init.body as string), id: saved.length + 1 };
    saved.push(record);
    return Response.json(record, { status: 201 });
  });
}

// Test helper: renders this feature's routes at `path` once the records have loaded.
// `backend` is the records the fake backend starts with, or a fetch to use in its place.
export async function renderAt(
  path: string,
  backend: ApplicationRecord[] | Mock<typeof fetch> = sampleApplications,
) {
  const fetchMock = Array.isArray(backend) ? fakeRecordsBackend(backend) : backend;
  vi.stubGlobal('fetch', fetchMock);
  const router = createMemoryRouter(applicationsRoutes, { initialEntries: [path] });
  render(
    <ApplicationsProvider>
      <RouterProvider router={router} />
    </ApplicationsProvider>,
  );
  await waitFor(() => expect(screen.queryByText(/^Loading/)).not.toBeInTheDocument());
  return { router, fetchMock };
}

export function heading() {
  return screen.getByRole('heading', { level: 1 });
}

export function fill(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

export function detail(term: string) {
  return screen.getByText(term, { selector: 'dt' }).nextElementSibling as HTMLElement;
}

export function submit(name: string) {
  fireEvent.click(screen.getByRole('button', { name }));
}

export function simulateFailure(action: 'save' | 'delete') {
  fireEvent.click(
    screen.getByRole('checkbox', { name: `Simulate a ${action} failure (prototype only)` }),
  );
}
