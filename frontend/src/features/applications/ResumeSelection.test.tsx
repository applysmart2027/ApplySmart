import { fireEvent, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { detail, fill, renderAt, submit } from './test-utils';

function choose(resumeName: string) {
  fireEvent.click(screen.getByRole('radio', { name: resumeName }));
}

function pickFile(fileName: string) {
  fireEvent.change(screen.getByLabelText('Upload a new resume (PDF or DOCX)'), {
    target: { files: [new File(['resume'], fileName)] },
  });
}

test('on create, a chosen resume is attached, the typed values stay, and it is saved', () => {
  renderAt('/applications/new');
  fill('Job title (required)', 'Data Engineer');
  fill('Employer (required)', 'Maplestone Robotics');

  submit('Select or upload resume');
  expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Select or upload a resume');
  expect(screen.getAllByRole('radio')).toHaveLength(3);
  choose('Cloud and DevOps resume.docx');
  submit('Attach resume');

  expect(screen.getByText('Cloud and DevOps resume.docx')).toBeInTheDocument();
  expect(screen.getByLabelText('Job title (required)')).toHaveValue('Data Engineer');

  submit('Save application');
  fireEvent.click(screen.getByRole('link', { name: 'View Data Engineer at Maplestone Robotics' }));
  expect(detail('Resume')).toHaveTextContent('Cloud and DevOps resume.docx');
});

test('cancel returns to the form with the previous resume and the typed values', () => {
  renderAt('/applications/app-1/edit');
  fill('Job title (required)', 'Senior Software Developer');

  submit('Change resume');
  choose('General co-op resume.pdf');
  submit('Cancel');

  expect(screen.getByText('Software resume, September 2026.pdf')).toBeInTheDocument();
  expect(screen.getByLabelText('Job title (required)')).toHaveValue('Senior Software Developer');
});

test('cancel on create returns to the form with nothing attached', () => {
  renderAt('/applications/new');
  fill('Job title (required)', 'Data Engineer');

  submit('Select or upload resume');
  choose('General co-op resume.pdf');
  submit('Cancel');

  expect(screen.getByText('No resume attached')).toBeInTheDocument();
  expect(screen.getByLabelText('Job title (required)')).toHaveValue('Data Engineer');
});

test('on edit, the current resume is preselected and a new one is saved', () => {
  renderAt('/applications/app-1/edit');

  submit('Change resume');
  expect(screen.getByRole('radio', { name: 'Software resume, September 2026.pdf' })).toBeChecked();
  choose('General co-op resume.pdf');
  submit('Attach resume');
  submit('Save changes');

  expect(detail('Resume')).toHaveTextContent('General co-op resume.pdf');
});

test('a picked PDF is attached by its file name', () => {
  renderAt('/applications/new');

  submit('Select or upload resume');
  pickFile('cover-resume.pdf');
  expect(screen.getByText('Selected file: cover-resume.pdf')).toBeInTheDocument();
  submit('Attach resume');

  expect(screen.getByText('cover-resume.pdf')).toBeInTheDocument();
});

test('a file that is not PDF or DOCX is refused', () => {
  renderAt('/applications/new');

  submit('Select or upload resume');
  pickFile('photo.png');

  expect(screen.getByRole('alert')).toHaveTextContent('Choose a PDF or DOCX file.');
  submit('Attach resume');
  expect(screen.getByRole('alert')).toHaveTextContent('Choose a resume or upload a file.');
});

test('focus moves into the step and back to the resume button', () => {
  renderAt('/applications/new');

  submit('Select or upload resume');
  expect(screen.getByRole('radio', { name: 'Software resume, September 2026.pdf' })).toHaveFocus();
  choose('Cloud and DevOps resume.docx');
  submit('Attach resume');

  expect(screen.getByRole('button', { name: 'Change resume' })).toHaveFocus();
});
