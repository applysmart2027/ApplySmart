import { fireEvent, render, screen, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { expect, test } from 'vitest';
import { routes } from './routes';

function renderAt(path: string) {
  render(<RouterProvider router={createMemoryRouter(routes, { initialEntries: [path] })} />);
}

function sidebar() {
  return within(screen.getByRole('navigation', { name: 'Main' }));
}

test('the dashboard lists every area in the sidebar and in the page', () => {
  renderAt('/');

  expect(screen.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeInTheDocument();
  expect(sidebar().getAllByRole('link')).toHaveLength(5);
  expect(within(screen.getByRole('main')).getAllByRole('link')).toHaveLength(4);
});

test.each([
  ['Applications', 'Application Records'],
  ['Resumes', 'Resume Management and Parsing'],
  ['Matching', 'Resume Matching and Gap Analysis'],
  ['Recommendations', 'Recommendations, Analytics and Follow-ups'],
])('the "%s" link opens its page and is the only current link', (linkName, heading) => {
  renderAt('/');

  fireEvent.click(sidebar().getByRole('link', { name: linkName }));

  expect(screen.getByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
  expect(sidebar().getByRole('link', { current: 'page' })).toHaveAccessibleName(linkName);
});

test('an unknown address shows page not found and links back to the dashboard', () => {
  renderAt('/no-such-page');

  expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('link', { name: 'Go to the dashboard' }));
  expect(screen.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeInTheDocument();
});
