import { fireEvent, screen, within } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { renderAt } from './test-utils';

function jobTitlesInTable() {
  return screen
    .getAllByRole('row')
    .slice(1)
    .map((row) => within(row).getAllByRole('cell')[0].textContent);
}

test("the list shows the signed-in student's records from the backend", async () => {
  const { fetchMock } = await renderAt('/applications');

  expect(fetchMock).toHaveBeenCalledWith('/api/applications/');
  expect(jobTitlesInTable()).toHaveLength(6);
});

test('when the records cannot be loaded the page says what to do next', async () => {
  await renderAt('/applications', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

  expect(screen.getByText(/Your application records could not be loaded/)).toHaveTextContent(
    'Your application records could not be loaded. Check that the backend is running, then reload the page.',
  );
  expect(screen.getByRole('link', { name: 'New application' })).toBeInTheDocument();
  expect(screen.queryByRole('table')).not.toBeInTheDocument();
});

test('the table shows each sample record with its employer, status and deadline', async () => {
  await renderAt('/applications');

  const row = screen.getByRole('row', { name: /Software Developer/ });
  expect(within(row).getByText('Halvorsen Analytics')).toBeInTheDocument();
  expect(within(row).getByText('Applied')).toBeInTheDocument();
  expect(within(row).getByText('Nov 14, 2026')).toBeInTheDocument();
  const undated = screen.getByRole('row', { name: /IT Support Analyst/ });
  expect(within(undated).getByText('No deadline')).toBeInTheDocument();
});

test('search matches the employer or the job title, ignoring case', async () => {
  await renderAt('/applications');
  const search = screen.getByRole('searchbox', { name: 'Search' });

  fireEvent.change(search, { target: { value: 'tamarack' } });
  expect(jobTitlesInTable()).toEqual(['Junior Data Analyst']);

  fireEvent.change(search, { target: { value: 'ENGINEER' } });
  expect(jobTitlesInTable()).toEqual(['Cloud Engineer']);
});

test('the status filter shows only records with that status', async () => {
  await renderAt('/applications');

  fireEvent.change(screen.getByRole('combobox', { name: 'Status' }), {
    target: { value: 'Offer' },
  });

  expect(jobTitlesInTable()).toEqual(['QA Automation Co-op']);
});

test('records sort by soonest deadline by default and by employer on request', async () => {
  await renderAt('/applications');

  expect(jobTitlesInTable()).toEqual([
    'Front-end Developer Intern',
    'QA Automation Co-op',
    'Cloud Engineer',
    'Software Developer',
    'Junior Data Analyst',
    'IT Support Analyst',
  ]);

  fireEvent.change(screen.getByRole('combobox', { name: 'Sort by' }), {
    target: { value: 'employer' },
  });

  expect(jobTitlesInTable()).toEqual([
    'IT Support Analyst',
    'Software Developer',
    'QA Automation Co-op',
    'Cloud Engineer',
    'Front-end Developer Intern',
    'Junior Data Analyst',
  ]);
});

test('a search with no matches says so and can be cleared', async () => {
  await renderAt('/applications');

  fireEvent.change(screen.getByRole('searchbox', { name: 'Search' }), {
    target: { value: 'astronaut' },
  });
  expect(screen.getByText('No applications match your search.')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Clear search and filters' }));
  expect(jobTitlesInTable()).toHaveLength(6);
  expect(screen.getByRole('searchbox', { name: 'Search' })).toHaveValue('');
});

test('with no records the page offers to create the first one', async () => {
  await renderAt('/applications', []);

  expect(screen.getByText('You have no application records yet.')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Create your first application' })).toHaveAttribute(
    'href',
    '/applications/new',
  );
  expect(screen.queryByRole('table')).not.toBeInTheDocument();
});

test('each row links to that record and the page links to a new record', async () => {
  await renderAt('/applications');
  const record = 'Cloud Engineer at Lakeshore Transit Authority';

  expect(screen.getByRole('link', { name: `View ${record}` })).toHaveAttribute(
    'href',
    '/applications/app-2',
  );
  expect(screen.getByRole('link', { name: `Edit ${record}` })).toHaveAttribute(
    'href',
    '/applications/app-2/edit',
  );
  expect(screen.getByRole('link', { name: `Delete ${record}` })).toHaveAttribute(
    'href',
    '/applications/app-2/delete',
  );
  expect(screen.getByRole('link', { name: 'New application' })).toHaveAttribute(
    'href',
    '/applications/new',
  );
});
