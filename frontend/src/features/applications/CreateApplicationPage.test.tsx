import { fireEvent, screen, within } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { fill, heading, renderAt, simulateFailure, submit } from './test-utils';

test('cancel returns to the list without adding a record', async () => {
  await renderAt('/applications/new');
  fill('Job title (required)', 'Data Engineer');

  fireEvent.click(screen.getByRole('link', { name: 'Cancel' }));

  expect(heading()).toHaveTextContent('Application Records');
  expect(screen.getAllByRole('row')).toHaveLength(7);
  expect(screen.queryByText('Data Engineer')).not.toBeInTheDocument();
});

test('saving without the required fields shows both messages and focuses the job title', async () => {
  await renderAt('/applications/new');

  submit('Save application');

  const jobTitle = screen.getByLabelText('Job title (required)');
  expect(jobTitle).toHaveFocus();
  expect(jobTitle).toHaveAccessibleDescription('Enter the job title.');
  expect(screen.getByLabelText('Employer (required)')).toHaveAccessibleDescription(
    'Enter the employer.',
  );
  expect(heading()).toHaveTextContent('Create Application Record');
});

test('an invalid URL and email are explained and the typed values stay', async () => {
  await renderAt('/applications/new');
  fill('Job title (required)', 'Data Engineer');
  fill('Employer (required)', 'Maplestone Robotics');
  fill('Job posting URL', 'maplestone careers page');
  fill('Contact email', 'recruiting at maplestone');

  submit('Save application');

  const postingUrl = screen.getByLabelText('Job posting URL');
  expect(postingUrl).toHaveFocus();
  expect(postingUrl).toHaveValue('maplestone careers page');
  expect(postingUrl).toHaveAccessibleDescription(
    'Enter a full web address starting with https://, or leave this blank.',
  );
  expect(screen.getByLabelText('Contact email')).toHaveAccessibleDescription(
    'Enter an email address like name@example.com, or leave this blank.',
  );
  expect(screen.getByLabelText('Job title (required)')).toHaveValue('Data Engineer');
});

test('saving sends the record to the backend and lists the record it returns', async () => {
  const { fetchMock } = await renderAt('/applications/new');
  fill('Job title (required)', 'Data Engineer');
  fill('Employer (required)', 'Maplestone Robotics');
  fill('Status', 'Applied');
  fill('Deadline', '2026-12-18');

  submit('Save application');

  expect(screen.getByRole('button', { name: 'Save application' })).toBeDisabled();
  const row = await screen.findByRole('row', { name: /Data Engineer/ });
  expect(heading()).toHaveTextContent('Application Records');
  expect(within(row).getByText('Maplestone Robotics')).toBeInTheDocument();
  expect(within(row).getByText('Applied')).toBeInTheDocument();
  expect(within(row).getByText('Dec 18, 2026')).toBeInTheDocument();
  const [url, request] = fetchMock.mock.calls[1];
  expect(url).toBe('/api/applications/');
  expect(request?.method).toBe('POST');
  expect(JSON.parse(request?.body as string)).toMatchObject({
    jobTitle: 'Data Engineer',
    employer: 'Maplestone Robotics',
    deadline: '2026-12-18',
  });
});

test('when the backend cannot save, the entries stay and nothing is listed', async () => {
  const failingSave = vi.fn<typeof fetch>(async (_input, init) =>
    init?.method === 'POST' ? new Response(null, { status: 500 }) : Response.json([]),
  );
  await renderAt('/applications/new', failingSave);
  fill('Job title (required)', 'Data Engineer');
  fill('Employer (required)', 'Maplestone Robotics');

  submit('Save application');

  expect(await screen.findByRole('alert')).toHaveTextContent('The application could not be saved.');
  expect(screen.getByLabelText('Job title (required)')).toHaveValue('Data Engineer');
  expect(screen.getByRole('button', { name: 'Save application' })).toBeEnabled();
  expect(heading()).toHaveTextContent('Create Application Record');
});

test('a simulated save failure keeps the entries and creates nothing', async () => {
  await renderAt('/applications/new');
  fill('Job title (required)', 'Data Engineer');
  fill('Employer (required)', 'Maplestone Robotics');
  simulateFailure('save');

  submit('Save application');

  expect(screen.getByRole('alert')).toHaveTextContent('The application could not be saved.');
  expect(screen.getByLabelText('Job title (required)')).toHaveValue('Data Engineer');
  expect(heading()).toHaveTextContent('Create Application Record');

  simulateFailure('save');
  submit('Save application');

  expect(await screen.findByRole('row', { name: /Data Engineer/ })).toBeInTheDocument();
  expect(heading()).toHaveTextContent('Application Records');
});
