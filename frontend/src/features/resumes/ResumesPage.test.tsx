import { fireEvent, screen, within } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { sampleResumeVersions } from './sampleData';
import { fakeResumesBackend, renderAt, renderFromApi } from './test-utils';
import type { ResumeVersion } from './types';

function renderPage(initialResumes?: ResumeVersion[]) {
  renderAt('/resumes', initialResumes);
}

function row(versionName: string) {
  return within(screen.getByRole('row', { name: new RegExp(versionName) }));
}

function openMenu(versionName: string) {
  fireEvent.click(screen.getByRole('button', { name: `More actions for ${versionName}` }));
}

test('the list shows the sample versions followed by the student’s saved uploads', async () => {
  const saved: ResumeVersion = {
    ...sampleResumeVersions[2],
    id: '1',
    versionName: 'Backend Co-op',
    uploaded: '2026-11-16',
  };
  const backend = fakeResumesBackend([saved]);

  await renderFromApi('/resumes', backend);

  expect(backend).toHaveBeenCalledWith('/api/resumes/');
  expect(screen.getByText('5 of 10 resume versions used')).toBeInTheDocument();
  const names = screen
    .getAllByRole('row')
    .slice(1)
    .map((r) => r.querySelector('td')?.textContent);
  expect(names).toEqual([...sampleResumeVersions.map((r) => r.versionName), 'Backend Co-op']);
  expect(row('Backend Co-op').getByText('Processing')).toBeInTheDocument();
});

test('when the versions cannot be loaded the page says so and upload is unavailable', async () => {
  await renderFromApi('/resumes', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

  expect(screen.getByRole('alert')).toHaveTextContent(
    'Your resumes could not be loaded. Check that the backend is running, then reload the page.',
  );
  expect(screen.getByRole('button', { name: 'Upload resume' })).toBeDisabled();
});

test('the table shows each version with its parse status, primary marker and upload date', () => {
  renderPage();

  expect(screen.getByRole('heading', { level: 1, name: 'My Resumes' })).toBeInTheDocument();
  expect(screen.getByText('4 of 10 resume versions used')).toBeInTheDocument();
  const general = row('Software Developer - General');
  expect(general.getByText('Confirmed')).toBeInTheDocument();
  expect(general.getByText('Primary')).toBeInTheDocument();
  expect(general.getByText('Sep 30, 2026')).toBeInTheDocument();
  expect(row('Cloud Co-op').queryByText('Primary')).not.toBeInTheDocument();
});

test('each parse status offers its own action, and Processing offers none', () => {
  renderPage();

  expect(screen.getByRole('link', { name: 'View Software Developer - General' })).toHaveAttribute(
    'href',
    '/resumes/res-1',
  );
  expect(screen.getByRole('link', { name: 'Review Cloud Co-op' })).toHaveAttribute(
    'href',
    '/resumes/res-2/review',
  );
  expect(screen.getByRole('link', { name: 'Resolve Old Resume 2025' })).toHaveAttribute(
    'href',
    '/resumes/res-4/resolve',
  );
  expect(row('Data Analyst Internship').queryByRole('link')).not.toBeInTheDocument();
});

test('a confirmed version can be made primary, replacing the previous one', () => {
  const resumes = sampleResumeVersions.map((r) =>
    r.id === 'res-2' ? { ...r, parseStatus: 'Confirmed' as const } : r,
  );
  renderPage(resumes);

  openMenu('Cloud Co-op');
  fireEvent.click(screen.getByRole('button', { name: 'Set as primary' }));

  expect(row('Cloud Co-op').getByText('Primary')).toBeInTheDocument();
  expect(row('Software Developer - General').queryByText('Primary')).not.toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('Cloud Co-op is now your primary resume.');
});

test('only confirmed versions that are not already primary offer Set as primary', () => {
  renderPage();

  openMenu('Software Developer - General');
  expect(screen.queryByRole('button', { name: 'Set as primary' })).not.toBeInTheDocument();
  openMenu('Software Developer - General');

  openMenu('Cloud Co-op');
  expect(screen.queryByRole('button', { name: 'Set as primary' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
});

test('Escape closes the menu and returns focus to its button', () => {
  renderPage();
  const toggle = screen.getByRole('button', { name: 'More actions for Cloud Co-op' });

  fireEvent.click(toggle);
  expect(toggle).toHaveAttribute('aria-expanded', 'true');
  fireEvent.keyDown(screen.getByRole('button', { name: 'Delete' }), { key: 'Escape' });

  expect(toggle).toHaveAttribute('aria-expanded', 'false');
  expect(toggle).toHaveFocus();
});

test('deleting a version asks first and can be cancelled', () => {
  renderPage();

  openMenu('Old Resume 2025');
  fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
  expect(screen.getByText('Delete “Old Resume 2025”?')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(screen.queryByText('Delete “Old Resume 2025”?')).not.toBeInTheDocument();
  expect(screen.getAllByRole('row')).toHaveLength(5);

  openMenu('Old Resume 2025');
  fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
  fireEvent.click(screen.getByRole('button', { name: 'Delete version' }));

  expect(screen.queryByText('Old Resume 2025')).not.toBeInTheDocument();
  expect(screen.getByText('3 of 10 resume versions used')).toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('Old Resume 2025 was deleted.');
});

test('at the version limit the upload button is disabled and says why', () => {
  const resumes = Array.from({ length: 10 }, (_, i) => ({
    ...sampleResumeVersions[0],
    id: `res-${i}`,
    versionName: `Version ${i}`,
    isPrimary: i === 0,
  }));
  renderPage(resumes);

  expect(screen.getByRole('button', { name: 'Upload resume' })).toBeDisabled();
  expect(
    screen.getByText('10 of 10 resume versions used. Delete a version to upload another.'),
  ).toBeInTheDocument();
});

test('with no versions the page offers to upload the first one', () => {
  renderPage([]);

  expect(screen.getByText('You have not uploaded a resume yet.')).toBeInTheDocument();
  expect(screen.queryByRole('table')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Upload your first resume' }));
  expect(screen.getByRole('dialog', { name: 'Upload resume' })).toBeInTheDocument();
});
