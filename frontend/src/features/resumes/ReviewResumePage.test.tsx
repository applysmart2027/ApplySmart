import { fireEvent, screen, within } from '@testing-library/react';
import { expect, test } from 'vitest';
import { renderAt } from './test-utils';

const reviewPath = '/resumes/res-2/review';

function click(name: string) {
  fireEvent.click(screen.getByRole('button', { name }));
}

function section(name: string) {
  return within(screen.getByRole('region', { name }));
}

function openEditor(name: string) {
  click(`Edit ${name}`);
  return within(screen.getByRole('dialog', { name: `Edit section: ${name}` }));
}

function entry(dialog: ReturnType<typeof openEditor>, number: number) {
  return within(dialog.getByRole('region', { name: `Entry ${number}` }));
}

test('the Review link on the list opens this page for that version', () => {
  const router = renderAt('/resumes');

  fireEvent.click(screen.getByRole('link', { name: 'Review Cloud Co-op' }));

  expect(router.state.location.pathname).toBe(reviewPath);
  expect(
    screen.getByRole('heading', { level: 1, name: 'Review parsed resume – Cloud Co-op' }),
  ).toBeInTheDocument();
});

test('each section lists what was parsed and flags entries that need fixing', () => {
  renderAt(reviewPath);

  const experience = section('Experience');
  expect(experience.getByText('Co-op Developer · ABC Corp')).toBeInTheDocument();
  expect(experience.getByText('May 2025 – Aug 2025')).toBeInTheDocument();
  expect(experience.getByText('1 entry needs fixing.')).toBeInTheDocument();
  expect(section('Education').queryByText(/needs fixing/)).not.toBeInTheDocument();
  expect(section('Projects').getByText('Nothing was found for this section.')).toBeInTheDocument();
});

test('the editor shows each entry with its fields filled in', () => {
  renderAt(reviewPath);

  const dialog = openEditor('Experience');
  const first = entry(dialog, 1);

  expect(first.getByRole('textbox', { name: 'Job title' })).toHaveValue('Co-op Developer');
  expect(first.getByRole('textbox', { name: 'Organization' })).toHaveValue('ABC Corp');
  expect(first.getByRole('textbox', { name: 'Start date' })).toHaveValue('May 2025');
  expect(first.getByRole('textbox', { name: 'End date' })).toHaveValue('Aug 2025');
  expect(first.getByRole('textbox', { name: 'Job title' })).toBeRequired();
  expect(entry(dialog, 2).getByRole('textbox', { name: 'Job title' })).toHaveValue(
    'IT Support Assistant',
  );
});

test('saving with an end date before the start date shows the error on that field', () => {
  renderAt(reviewPath);
  const dialog = openEditor('Experience');

  click('Save');

  const endDate = entry(dialog, 2).getByRole('textbox', { name: 'End date' });
  expect(endDate).toHaveAttribute('aria-invalid', 'true');
  expect(endDate).toHaveAccessibleDescription('End date is before start date.');
  expect(endDate).toHaveFocus();
  expect(screen.getByRole('dialog')).toBeInTheDocument();
});

test('fixing the date clears the error, and Save updates the page', () => {
  renderAt(reviewPath);
  const dialog = openEditor('Experience');
  click('Save');

  const endDate = entry(dialog, 2).getByRole('textbox', { name: 'End date' });
  fireEvent.change(endDate, { target: { value: 'Jan 2026' } });
  expect(endDate).toHaveAttribute('aria-invalid', 'false');
  click('Save');

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(section('Experience').getByText('Sep 2025 – Jan 2026')).toBeInTheDocument();
  expect(section('Experience').queryByText(/needs fixing/)).not.toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('Experience saved.');
});

test('Add entry adds a blank entry whose required fields must be filled', () => {
  renderAt(reviewPath);
  const dialog = openEditor('Experience');

  click('Add entry');
  const third = entry(dialog, 3);
  expect(third.getByRole('textbox', { name: 'Job title' })).toHaveFocus();
  click('Save');

  expect(third.getByText('Enter a job title.')).toBeInTheDocument();
  expect(third.getByText('Enter an organization.')).toBeInTheDocument();
});

test('Remove drops an entry once saved, and Cancel discards changes', () => {
  renderAt(reviewPath);

  let dialog = openEditor('Experience');
  click('Remove entry 2');
  expect(dialog.queryByRole('region', { name: 'Entry 2' })).not.toBeInTheDocument();
  click('Cancel');
  expect(section('Experience').getByText(/IT Support Assistant/)).toBeInTheDocument();

  dialog = openEditor('Experience');
  click('Remove entry 2');
  click('Save');
  expect(section('Experience').queryByText(/IT Support Assistant/)).not.toBeInTheDocument();
});

test('Move to section moves the entry to the chosen section when saved', () => {
  renderAt(reviewPath);
  const dialog = openEditor('Experience');

  fireEvent.click(entry(dialog, 1).getByRole('button', { name: /Move to section, entry 1/ }));
  click('Projects');
  expect(entry(dialog, 1).getByText('Moves to Projects when you save')).toBeInTheDocument();
  fireEvent.change(entry(dialog, 2).getByRole('textbox', { name: 'End date' }), {
    target: { value: 'Jan 2026' },
  });
  click('Save');

  expect(section('Projects').getByText('Co-op Developer · ABC Corp')).toBeInTheDocument();
  expect(section('Experience').queryByText(/Co-op Developer/)).not.toBeInTheDocument();
});

test('a move can be taken back before saving', () => {
  renderAt(reviewPath);
  const dialog = openEditor('Experience');

  fireEvent.click(entry(dialog, 1).getByRole('button', { name: /Move to section, entry 1/ }));
  click('Education');
  fireEvent.click(entry(dialog, 1).getByRole('button', { name: /Move to section, entry 1/ }));
  click('Keep in Experience');

  expect(entry(dialog, 1).queryByText(/Moves to/)).not.toBeInTheDocument();
});

test('confirming is blocked while an entry needs fixing', () => {
  renderAt(reviewPath);

  click('Confirm resume');

  expect(screen.getByRole('alert')).toHaveTextContent(
    'Fix the entries marked below before confirming this resume.',
  );
});

test('confirming a fixed resume marks it Confirmed and returns to the list', () => {
  const router = renderAt(reviewPath);
  const dialog = openEditor('Experience');
  fireEvent.change(entry(dialog, 2).getByRole('textbox', { name: 'End date' }), {
    target: { value: 'Present' },
  });
  click('Save');

  click('Confirm resume');

  expect(router.state.location.pathname).toBe('/resumes');
  const row = within(screen.getByRole('row', { name: /Cloud Co-op/ }));
  expect(row.getByText('Confirmed')).toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('Cloud Co-op is confirmed.');
});

test('a version that is not waiting for review has nothing to review', () => {
  renderAt('/resumes/res-1/review');

  expect(screen.getByRole('heading', { level: 1, name: 'Nothing to review' })).toBeInTheDocument();
});

test('an unknown version shows not found', () => {
  renderAt('/resumes/no-such-resume/review');

  expect(screen.getByRole('heading', { level: 1, name: 'Resume not found' })).toBeInTheDocument();
});
