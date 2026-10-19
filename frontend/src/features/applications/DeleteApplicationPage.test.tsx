import { fireEvent, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { sampleApplications } from './sampleData';
import { heading, renderAt, simulateFailure, submit } from './test-utils';

test('Delete application on the details screen opens the confirmation for that record', () => {
  renderAt('/applications/app-2');

  fireEvent.click(screen.getByRole('link', { name: 'Delete application' }));

  expect(heading()).toHaveTextContent('Delete Application Record');
  expect(screen.getByText('Cloud Engineer at Lakeshore Transit Authority')).toBeInTheDocument();
  expect(screen.getByText('Are you sure you want to delete this application?')).toBeInTheDocument();
});

test('cancel returns to the details and keeps the record', () => {
  renderAt('/applications/app-1/delete');

  fireEvent.click(screen.getByRole('link', { name: 'Cancel' }));

  expect(heading().textContent).toBe('Software Developer');
});

test('confirming removes the record and returns to the list', () => {
  renderAt('/applications/app-1/delete');

  submit('Delete application');

  expect(heading()).toHaveTextContent('Application Records');
  expect(screen.getAllByRole('row')).toHaveLength(6);
  expect(screen.queryByText('Software Developer')).not.toBeInTheDocument();
});

test('a simulated failure keeps the record and the retry succeeds', () => {
  renderAt('/applications/app-1/delete');
  simulateFailure('delete');

  submit('Delete application');

  expect(screen.getByRole('alert')).toHaveTextContent('The application could not be deleted.');
  expect(heading()).toHaveTextContent('Delete Application Record');

  simulateFailure('delete');
  submit('Delete application');

  expect(heading()).toHaveTextContent('Application Records');
  expect(screen.getAllByRole('row')).toHaveLength(6);
});

test('deleting the only record leaves the empty list state', () => {
  renderAt('/applications/app-1/delete', [sampleApplications[0]]);

  submit('Delete application');

  expect(screen.getByText('You have no application records yet.')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Create your first application' })).toBeInTheDocument();
});

test.each([
  ['app-999', 'Application not found'],
  ['app-restricted', 'You cannot view this application'],
])('deleting %s shows "%s"', (id, message) => {
  renderAt(`/applications/${id}/delete`);

  expect(heading()).toHaveTextContent(message);
});
