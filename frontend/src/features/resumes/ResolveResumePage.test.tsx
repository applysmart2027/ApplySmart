import { fireEvent, screen, within } from '@testing-library/react';
import { expect, test } from 'vitest';
import { sampleResumeVersions } from './sampleData';
import { renderAt } from './test-utils';

const failedPath = '/resumes/res-4/resolve';

function click(name: string) {
  fireEvent.click(screen.getByRole('button', { name }));
}

function statusInList(versionName: string) {
  const row = within(screen.getByRole('row', { name: new RegExp(versionName) }));
  return row.getAllByRole('cell')[1].textContent;
}

test('the Resolve link on the list opens this page for that version', () => {
  const router = renderAt('/resumes');

  fireEvent.click(screen.getByRole('link', { name: 'Resolve Old Resume 2025' }));

  expect(router.state.location.pathname).toBe(failedPath);
  expect(
    screen.getByRole('heading', { level: 1, name: 'Resolve failed upload – Old Resume 2025' }),
  ).toBeInTheDocument();
});

test('the page explains why parsing failed and how many attempts are left', () => {
  renderAt(failedPath);

  expect(screen.getByText('Failed')).toBeInTheDocument();
  expect(screen.getByText('We couldn’t read this resume.')).toBeInTheDocument();
  expect(
    screen.getByText(/Reason: Text could not be extracted from the file\. Attempt 2 of 3\./),
  ).toBeInTheDocument();
  for (const option of [
    'Retry parsing',
    'Enter manually',
    'Upload a replacement',
    'Delete this version',
  ]) {
    expect(screen.getByRole('region', { name: option })).toBeInTheDocument();
  }
});

test('Retry sends the version back to Processing and returns to the list', () => {
  const router = renderAt(failedPath);

  click('Retry');

  expect(router.state.location.pathname).toBe('/resumes');
  expect(statusInList('Old Resume 2025')).toBe('Processing');
  expect(screen.getByRole('status')).toHaveTextContent(
    'Old Resume 2025 was sent to be read again.',
  );
});

test('after the last allowed attempt Retry is no longer offered', () => {
  const resumes = sampleResumeVersions.map((r) =>
    r.id === 'res-4' ? { ...r, parseAttempts: 3 } : r,
  );
  renderAt(failedPath, resumes);

  expect(screen.queryByRole('region', { name: 'Retry parsing' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
  expect(screen.getByText(/Attempt 3 of 3\. Retry is no longer available/)).toBeInTheDocument();
});

test('Enter manually links to the manual entry screen for this version', () => {
  renderAt(failedPath);

  expect(screen.getByRole('link', { name: 'Enter manually' })).toHaveAttribute(
    'href',
    '/resumes/res-4/manual',
  );
});

test('uploading a replacement keeps the version and starts parsing the new file', () => {
  const router = renderAt(failedPath);

  click('Upload new file');
  const dialog = within(screen.getByRole('dialog', { name: 'Upload a replacement' }));
  expect(dialog.getByLabelText('Version name')).toHaveValue('Old Resume 2025');
  fireEvent.change(dialog.getByLabelText('Resume file'), {
    target: { files: [new File(['resume'], 'Old_Resume.docx')] },
  });
  fireEvent.click(dialog.getByRole('button', { name: 'Upload' }));

  expect(router.state.location.pathname).toBe('/resumes');
  expect(statusInList('Old Resume 2025')).toBe('Processing');
  expect(screen.getByText('4 of 10 resume versions used')).toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent(
    'Old Resume 2025 was replaced. Parsing has started.',
  );
});

test('a replacement cannot take the name of another version', () => {
  renderAt(failedPath);

  click('Upload new file');
  const dialog = within(screen.getByRole('dialog'));
  fireEvent.change(dialog.getByLabelText('Resume file'), {
    target: { files: [new File(['resume'], 'resume.pdf')] },
  });
  fireEvent.change(dialog.getByLabelText('Version name'), { target: { value: 'Cloud Co-op' } });
  fireEvent.click(dialog.getByRole('button', { name: 'Upload' }));

  expect(dialog.getByRole('alert')).toHaveTextContent('You already have a version named');
});

test('Delete asks first, can be cancelled, and then removes the version', () => {
  const router = renderAt(failedPath);

  click('Delete');
  expect(screen.getByText('Delete “Old Resume 2025”?')).toBeInTheDocument();
  click('Cancel');
  expect(screen.queryByText('Delete “Old Resume 2025”?')).not.toBeInTheDocument();

  click('Delete');
  click('Delete version');

  expect(router.state.location.pathname).toBe('/resumes');
  expect(screen.queryByText('Old Resume 2025')).not.toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('Old Resume 2025 was deleted.');
});

test('an unknown version shows not found with a way back', () => {
  renderAt('/resumes/no-such-resume/resolve');

  expect(screen.getByRole('heading', { level: 1, name: 'Resume not found' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Back to My Resumes' })).toHaveAttribute(
    'href',
    '/resumes',
  );
});

test('a version that did not fail has nothing to resolve', () => {
  renderAt('/resumes/res-1/resolve');

  expect(screen.getByRole('heading', { level: 1, name: 'Nothing to resolve' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
});

test('/resumes/resolve opens the page for the first failed version', () => {
  const router = renderAt('/resumes/resolve');

  expect(router.state.location.pathname).toBe(failedPath);
  expect(
    screen.getByRole('heading', { level: 1, name: 'Resolve failed upload – Old Resume 2025' }),
  ).toBeInTheDocument();
});

test('/resumes/resolve says there is nothing to resolve when no version failed', () => {
  renderAt(
    '/resumes/resolve',
    sampleResumeVersions.filter((r) => r.parseStatus !== 'Failed'),
  );

  expect(screen.getByRole('heading', { level: 1, name: 'Nothing to resolve' })).toBeInTheDocument();
});
