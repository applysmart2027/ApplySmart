import { fireEvent, render, screen, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { expect, test } from 'vitest';
import { formatUploaded, todayIso } from './format';
import { ResumesPage } from './ResumesPage';
import { defaultVersionName } from './uploadValidation';

function openUpload() {
  const router = createMemoryRouter([{ path: '/resumes', Component: ResumesPage }], {
    initialEntries: ['/resumes'],
  });
  render(<RouterProvider router={router} />);
  fireEvent.click(screen.getByRole('button', { name: 'Upload resume' }));
  return within(screen.getByRole('dialog', { name: 'Upload resume' }));
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

test('uploading a file with a version name adds it to the list as Processing', () => {
  const dialog = openUpload();

  choose(makeFile('Hira_Ahmad_Resume.pdf'));
  expect(dialog.getByText('Selected file: Hira_Ahmad_Resume.pdf (412 KB)')).toBeInTheDocument();
  fireEvent.change(dialog.getByLabelText('Version name'), { target: { value: 'Backend Co-op' } });
  upload();

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  const row = within(screen.getByRole('row', { name: /Backend Co-op/ }));
  expect(row.getByText('Processing')).toBeInTheDocument();
  expect(row.getByText(formatUploaded(todayIso()))).toBeInTheDocument();
  expect(screen.getByText('5 of 10 resume versions used')).toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent(
    'Backend Co-op was uploaded. Parsing has started.',
  );
});

test('a blank version name uses the file name and today’s date', () => {
  openUpload();

  choose(makeFile('Hira_Ahmad_Resume.docx'));
  upload();

  const name = defaultVersionName('Hira_Ahmad_Resume.docx', todayIso());
  expect(screen.getByRole('row', { name: new RegExp(name) })).toBeInTheDocument();
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
