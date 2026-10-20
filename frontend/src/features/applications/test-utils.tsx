import { fireEvent, render, screen } from '@testing-library/react';
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
  return router;
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
