import { fireEvent, screen, within } from '@testing-library/react';
import { expect, test } from 'vitest';
import { renderAt } from './renderAt';

function fill(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

function save() {
  fireEvent.click(screen.getByRole('button', { name: 'Save application' }));
}

function heading() {
  return screen.getByRole('heading', { level: 1 });
}

test('cancel returns to the list without adding a record', () => {
  renderAt('/applications/new');
  fill('Job title (required)', 'Data Engineer');

  fireEvent.click(screen.getByRole('link', { name: 'Cancel' }));

  expect(heading()).toHaveTextContent('Application Records');
  expect(screen.getAllByRole('row')).toHaveLength(7);
  expect(screen.queryByText('Data Engineer')).not.toBeInTheDocument();
});

test('saving without the required fields shows both messages and focuses the job title', () => {
  renderAt('/applications/new');

  save();

  const jobTitle = screen.getByLabelText('Job title (required)');
  expect(jobTitle).toHaveFocus();
  expect(jobTitle).toHaveAccessibleDescription('Enter the job title.');
  expect(screen.getByLabelText('Employer (required)')).toHaveAccessibleDescription(
    'Enter the employer.',
  );
  expect(heading()).toHaveTextContent('Create Application Record');
});

test('an invalid URL and email are explained and the typed values stay', () => {
  renderAt('/applications/new');
  fill('Job title (required)', 'Data Engineer');
  fill('Employer (required)', 'Maplestone Robotics');
  fill('Job posting URL', 'maplestone careers page');
  fill('Contact email', 'recruiting at maplestone');

  save();

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

test('a valid save returns to the list and shows the new record', () => {
  renderAt('/applications/new');
  fill('Job title (required)', 'Data Engineer');
  fill('Employer (required)', 'Maplestone Robotics');
  fill('Status', 'Applied');
  fill('Deadline', '2026-12-18');

  save();

  expect(heading()).toHaveTextContent('Application Records');
  const row = screen.getByRole('row', { name: /Data Engineer/ });
  expect(within(row).getByText('Maplestone Robotics')).toBeInTheDocument();
  expect(within(row).getByText('Applied')).toBeInTheDocument();
  expect(within(row).getByText('Dec 18, 2026')).toBeInTheDocument();
});

test('a simulated save failure keeps the entries and creates nothing', () => {
  renderAt('/applications/new');
  fill('Job title (required)', 'Data Engineer');
  fill('Employer (required)', 'Maplestone Robotics');
  const simulate = screen.getByRole('checkbox', {
    name: 'Simulate a save failure (prototype only)',
  });
  fireEvent.click(simulate);

  save();

  expect(screen.getByRole('alert')).toHaveTextContent('The application could not be saved.');
  expect(screen.getByLabelText('Job title (required)')).toHaveValue('Data Engineer');
  expect(heading()).toHaveTextContent('Create Application Record');

  fireEvent.click(simulate);
  save();

  expect(heading()).toHaveTextContent('Application Records');
  expect(screen.getByRole('row', { name: /Data Engineer/ })).toBeInTheDocument();
});
