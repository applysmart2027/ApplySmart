import { act, fireEvent, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { detail, fill, heading, renderAt, simulateFailure, submit } from './test-utils';

test('Edit application on the details screen opens that record in the form', async () => {
  await renderAt('/applications/app-2');

  fireEvent.click(screen.getByRole('link', { name: 'Edit application' }));

  expect(heading()).toHaveTextContent('Edit Application Record');
  expect(screen.getByLabelText('Job title (required)')).toHaveValue('Cloud Engineer');
});

test('the form is prefilled with every field of the record', async () => {
  await renderAt('/applications/app-1/edit');

  expect(screen.getByText('Software Developer at Halvorsen Analytics')).toBeInTheDocument();
  expect(screen.getByLabelText('Job title (required)')).toHaveValue('Software Developer');
  expect(screen.getByLabelText('Employer (required)')).toHaveValue('Halvorsen Analytics');
  expect(screen.getByLabelText('Job posting URL')).toHaveValue(
    'https://careers.halvorsen-analytics.example/jobs/4821',
  );
  expect(screen.getByLabelText('Status')).toHaveValue('Applied');
  expect(screen.getByLabelText('Deadline')).toHaveValue('2026-11-14');
  expect(screen.getByLabelText('Notes')).toHaveValue(
    'Applied through the company site. A coding assessment link should arrive within a week.',
  );
  expect(screen.getByLabelText('Contact name')).toHaveValue('Priya Raman');
  expect(screen.getByLabelText('Contact email')).toHaveValue(
    'priya.raman@halvorsen-analytics.example',
  );
});

test('cancel returns to the details without saving the edits', async () => {
  await renderAt('/applications/app-1/edit');
  fill('Job title (required)', 'Senior Software Developer');

  fireEvent.click(screen.getByRole('link', { name: 'Cancel' }));

  expect(heading().textContent).toBe('Software Developer');
});

test('saving shows the changes on the details screen without adding a record', async () => {
  await renderAt('/applications/app-1/edit');
  fill('Job title (required)', 'Senior Software Developer');
  fill('Status', 'Interview');

  submit('Save changes');

  expect(heading().textContent).toBe('Senior Software Developer');
  expect(detail('Status')).toHaveTextContent('Interview');

  fireEvent.click(screen.getByRole('link', { name: 'Back to Application Records' }));
  expect(screen.getAllByRole('row')).toHaveLength(7);
  expect(screen.getByRole('row', { name: /Senior Software Developer/ })).toBeInTheDocument();
});

test('clearing a required field explains it and keeps the student on the form', async () => {
  await renderAt('/applications/app-1/edit');
  fill('Job title (required)', '');

  submit('Save changes');

  const jobTitle = screen.getByLabelText('Job title (required)');
  expect(jobTitle).toHaveFocus();
  expect(jobTitle).toHaveAccessibleDescription('Enter the job title.');
  expect(heading()).toHaveTextContent('Edit Application Record');
});

test('an invalid posting URL is explained and focused', async () => {
  await renderAt('/applications/app-1/edit');
  fill('Job posting URL', 'halvorsen careers page');

  submit('Save changes');

  const postingUrl = screen.getByLabelText('Job posting URL');
  expect(postingUrl).toHaveFocus();
  expect(postingUrl).toHaveAccessibleDescription(
    'Enter a full web address starting with https://, or leave this blank.',
  );
  expect(heading()).toHaveTextContent('Edit Application Record');
});

test('a simulated failure keeps the edits and leaves the record unchanged', async () => {
  await renderAt('/applications/app-1/edit');
  fill('Job title (required)', 'Senior Software Developer');
  simulateFailure('save');

  submit('Save changes');

  expect(screen.getByRole('alert')).toHaveTextContent('The application could not be saved.');
  expect(screen.getByLabelText('Job title (required)')).toHaveValue('Senior Software Developer');

  fireEvent.click(screen.getByRole('link', { name: 'Cancel' }));
  expect(heading().textContent).toBe('Software Developer');
});

test.each([
  ['app-999', 'Application not found'],
  ['app-restricted', 'You cannot view this application'],
])('editing %s shows "%s"', async (id, message) => {
  await renderAt(`/applications/${id}/edit`);

  expect(heading()).toHaveTextContent(message);
});

test("moving straight to another record's edit page shows that record", async () => {
  const { router } = await renderAt('/applications/app-1/edit');

  await act(() => router.navigate('/applications/app-2/edit'));

  expect(screen.getByLabelText('Job title (required)')).toHaveValue('Cloud Engineer');
});

test('the page says edits are not saved yet', async () => {
  await renderAt('/applications/app-1/edit');

  expect(
    screen.getByText('Changes here are not saved yet and disappear when you reload the page.'),
  ).toBeInTheDocument();
});
