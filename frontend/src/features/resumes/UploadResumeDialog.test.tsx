import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { expect, test, vi, type Mock } from 'vitest';
import { formatUploaded, todayIso } from './format';
import { sampleResumeVersions } from './sampleData';
import { fakeResumesBackend, renderAt } from './test-utils';
import { defaultVersionName } from './uploadValidation';

function openUpload(backend?: Mock<typeof fetch>) {
  renderAt('/resumes', sampleResumeVersions, backend);
  fireEvent.click(screen.getByRole('button', { name: 'Upload resume' }));
  return within(screen.getByRole('dialog', { name: 'Upload resume' }));
}

function refusingBackend(status: number, body: object) {
  return fakeResumesBackend(sampleResumeVersions, () => Response.json(body, { status }));
}

function makeFile(name: string, bytes = 412 * 1024) {
  const file = new File(['resume'], name);
  Object.defineProperty(file, 'size', { value: bytes });
  return file;
}

function choose(file: File) {
  fireEvent.change(screen.getByLabelText('Resume file'), { target: { files: [file] } });
}

function upload() {
  fireEvent.click(screen.getByRole('button', { name: 'Upload' }));
}

test('uploading a file with a version name sends it to the backend and lists it as Processing', async () => {
  const backend = fakeResumesBackend(sampleResumeVersions);
  const dialog = openUpload(backend);
  const file = makeFile('Hira_Ahmad_Resume.pdf');

  choose(file);
  expect(dialog.getByText('Selected file: Hira_Ahmad_Resume.pdf (412 KB)')).toBeInTheDocument();
  fireEvent.change(dialog.getByLabelText('Version name'), { target: { value: 'Backend Co-op' } });
  upload();

  const row = within(await screen.findByRole('row', { name: /Backend Co-op/ }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(row.getByText('Processing')).toBeInTheDocument();
  expect(row.getByText(formatUploaded(todayIso()))).toBeInTheDocument();
  expect(screen.getByText('5 of 10 resume versions used')).toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent(
    'Backend Co-op was uploaded. Parsing has started.',
  );
  const [url, init] = backend.mock.calls[0];
  expect(url).toBe('/api/resumes/');
  expect(init?.method).toBe('POST');
  const sent = init?.body as FormData;
  expect(sent.get('file')).toBe(file);
  expect(sent.get('versionName')).toBe('Backend Co-op');
});

test('a blank version name uses the file name and today’s date', async () => {
  openUpload();

  choose(makeFile('Hira_Ahmad_Resume.docx'));
  upload();

  const name = defaultVersionName('Hira_Ahmad_Resume.docx', todayIso());
  expect(await screen.findByRole('row', { name: new RegExp(name) })).toBeInTheDocument();
});

test('the Upload button is disabled while the file is being sent', async () => {
  let answer: (response: Response) => void = () => {};
  openUpload(vi.fn<typeof fetch>(() => new Promise((resolve) => (answer = resolve))));

  choose(makeFile('resume.pdf'));
  upload();

  expect(screen.getByRole('button', { name: 'Uploading…' })).toBeDisabled();
  answer(Response.json({}, { status: 500 }));
  expect(await screen.findByRole('button', { name: 'Upload' })).toBeEnabled();
});

test.each([
  [
    'a file the backend cannot read',
    400,
    { file: 'This file could not be read. Check that it opens, then choose it again.' },
  ],
  [
    'an upload over the version limit',
    409,
    {
      detail:
        'You already have 10 resume versions. Delete a version in My Resumes to upload another.',
    },
  ],
])('%s keeps the dialog open with the backend’s reason', async (_case, status, body) => {
  openUpload(refusingBackend(status, body));

  choose(makeFile('resume.pdf'));
  upload();

  expect(await screen.findByRole('alert')).toHaveTextContent(Object.values(body)[0]);
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(screen.getAllByRole('row')).toHaveLength(5);
});

test('a version name the backend refuses is marked on the name field', async () => {
  const dialog = openUpload(
    refusingBackend(400, { versionName: 'You already have a version named “Backend Co-op”.' }),
  );

  choose(makeFile('resume.pdf'));
  fireEvent.change(dialog.getByLabelText('Version name'), { target: { value: 'Backend Co-op' } });
  upload();

  expect(await screen.findByRole('alert')).toHaveTextContent(
    'You already have a version named “Backend Co-op”.',
  );
  expect(dialog.getByLabelText('Version name')).toHaveAttribute('aria-invalid', 'true');
});

test('a failed upload says nothing was saved and allows another try', async () => {
  openUpload(refusingBackend(500, {}));

  choose(makeFile('resume.pdf'));
  upload();

  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Your resume could not be uploaded. Nothing was saved. Try again.',
  );
  await waitFor(() => expect(screen.getByRole('button', { name: 'Upload' })).toBeEnabled());
  expect(screen.getAllByRole('row')).toHaveLength(5);
});

test('files refused in the browser are never sent', () => {
  const backend = fakeResumesBackend(sampleResumeVersions);
  openUpload(backend);

  choose(makeFile('resume.png'));
  upload();

  expect(backend).not.toHaveBeenCalled();
});

test('the default name drops only the last extension', () => {
  expect(defaultVersionName('resume.v2.pdf', '2026-10-20')).toBe('resume.v2 - Oct 20, 2026');
});

test('a file larger than 5 MB is refused as soon as it is chosen', () => {
  openUpload();

  choose(makeFile('Big_Resume.pdf', 6 * 1024 * 1024));
  expect(screen.getByRole('alert')).toHaveTextContent(
    'This file is larger than 5 MB. Choose a smaller file.',
  );

  upload();
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(screen.getAllByRole('row')).toHaveLength(5);
});

test('a file that is not a PDF or DOCX is refused', () => {
  openUpload();

  choose(makeFile('resume.png'));

  expect(screen.getByRole('alert')).toHaveTextContent(
    'This file is not a PDF or DOCX. Choose a different file.',
  );
});

test('choosing a valid file clears an earlier file error', () => {
  openUpload();

  choose(makeFile('resume.png'));
  choose(makeFile('resume.pdf'));

  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

test('uploading without a file asks for one', () => {
  openUpload();

  upload();

  expect(screen.getByRole('alert')).toHaveTextContent('Choose a PDF or DOCX file to upload.');
});

test('a version name already in use is refused, ignoring case', () => {
  const dialog = openUpload();

  choose(makeFile('resume.pdf'));
  const name = dialog.getByLabelText('Version name');
  fireEvent.change(name, { target: { value: 'cloud co-op' } });
  upload();

  expect(screen.getByRole('alert')).toHaveTextContent(
    'You already have a version named “cloud co-op”.',
  );
  expect(name).toHaveAttribute('aria-invalid', 'true');
});

test('a file dropped on the drop area is selected', () => {
  const dialog = openUpload();

  fireEvent.drop(dialog.getByText('Drag a PDF or DOCX file here').parentElement!, {
    dataTransfer: { files: [makeFile('Dropped.pdf')] },
  });

  expect(dialog.getByText('Selected file: Dropped.pdf (412 KB)')).toBeInTheDocument();
});

test.each(['Cancel', 'Close'])('%s closes the dialog without adding a version', (name) => {
  const dialog = openUpload();

  choose(makeFile('resume.pdf'));
  fireEvent.click(dialog.getByRole('button', { name }));

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getAllByRole('row')).toHaveLength(5);
});
