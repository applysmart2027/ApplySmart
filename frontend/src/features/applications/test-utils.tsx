import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { ApplicationsProvider, applicationsRoutes } from '.';
import type { ApplicationRecord } from './types';

// Test helper: renders this feature's routes at `path` with a fresh records provider.
export function renderAt(path: string, initialRecords?: ApplicationRecord[]) {
  const router = createMemoryRouter(applicationsRoutes, { initialEntries: [path] });
  render(
    <ApplicationsProvider initialRecords={initialRecords}>
      <RouterProvider router={router} />
    </ApplicationsProvider>,
  );
}

export function heading() {
  return screen.getByRole('heading', { level: 1 });
}
