import { fireEvent, screen, within } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { detail, heading, renderAt } from './test-utils';

test('the details show every field of the selected record', async () => {
  await renderAt('/applications/app-1');

  expect(heading()).toHaveTextContent('Software Developer');
  expect(screen.getByText('Halvorsen Analytics')).toBeInTheDocument();
  expect(detail('Status')).toHaveTextContent('Applied');
  expect(detail('Deadline')).toHaveTextContent('Nov 14, 2026');
  expect(within(detail('Job posting')).getByRole('link')).toHaveAttribute(
    'href',
    'https://careers.halvorsen-analytics.example/jobs/4821',
  );
  expect(detail('Resume')).toHaveTextContent('Software resume, September 2026.pdf');
  expect(detail('Notes')).toHaveTextContent('Applied through the company site.');
  expect(detail('Contact')).toHaveTextContent('Priya Raman');
  expect(
    within(detail('Contact')).getByRole('link', {
      name: 'priya.raman@halvorsen-analytics.example',
    }),
  ).toHaveAttribute('href', 'mailto:priya.raman@halvorsen-analytics.example');
});

test('a record without a resume, notes or contact says so', async () => {
  await renderAt('/applications/app-3');

  expect(detail('Resume')).toHaveTextContent('No resume attached');
  expect(detail('Notes')).toHaveTextContent('No notes');
  expect(detail('Contact')).toHaveTextContent('No contact recorded');
});

test('a record without a deadline or posting link says so', async () => {
  await renderAt('/applications/app-6');

  expect(detail('Deadline')).toHaveTextContent('No deadline');
  expect(detail('Job posting')).toHaveTextContent('Not provided');
});

test('the actions lead to edit, delete and back to the list', async () => {
  await renderAt('/applications/app-1');

  expect(screen.getByRole('link', { name: 'Edit application' })).toHaveAttribute(
    'href',
    '/applications/app-1/edit',
  );
  expect(screen.getByRole('link', { name: 'Delete application' })).toHaveAttribute(
    'href',
    '/applications/app-1/delete',
  );

  fireEvent.click(screen.getByRole('link', { name: 'Back to Application Records' }));
  expect(heading()).toHaveTextContent('Application Records');
});

test('an unknown address shows that the record was not found', async () => {
  await renderAt('/applications/app-999');

  expect(heading()).toHaveTextContent('Application not found');
  fireEvent.click(screen.getByRole('link', { name: 'Back to Application Records' }));
  expect(heading()).toHaveTextContent('Application Records');
});

test("another student's record shows access denied", async () => {
  await renderAt('/applications/app-restricted');

  expect(heading()).toHaveTextContent('You cannot view this application');
});

test('View in the list opens the details of that row', async () => {
  await renderAt('/applications');

  fireEvent.click(
    screen.getByRole('link', { name: 'View Cloud Engineer at Lakeshore Transit Authority' }),
  );

  expect(heading()).toHaveTextContent('Cloud Engineer');
});

test('when the records cannot be loaded, a record page says so instead of not found', async () => {
  await renderAt(
    '/applications/app-1',
    vi.fn().mockRejectedValue(new TypeError('Failed to fetch')),
  );

  expect(heading()).toHaveTextContent('Application could not be loaded');
  expect(screen.getByText(/Check that the backend is running/)).toBeInTheDocument();
});
