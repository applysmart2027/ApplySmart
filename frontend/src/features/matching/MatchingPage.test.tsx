import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { MatchingPage } from './MatchingPage';

// Selects a resume and job posting for tests that need a valid comparison
function selectComparison(
  resumeId = 'res-2',
  jobPostingId = 'job-1',
) {
  fireEvent.change(screen.getByLabelText('Resume'), {
    target: { value: resumeId },
  });

  fireEvent.change(screen.getByLabelText('Job Posting'), {
    target: { value: jobPostingId },
  });
}

// The matching feature should start on the comparison selection screen
test('the matching page starts on the comparison form', () => {
  render(<MatchingPage />);

  expect(
    screen.getByRole('heading', {
      level: 1,
      name: 'Resume Matching and Gap Analysis',
    }),
  ).toBeInTheDocument();

  expect(
    screen.getByRole('heading', {
      level: 2,
      name: 'Compare Resume to Job',
    }),
  ).toBeInTheDocument();

  expect(screen.getByLabelText('Resume')).toBeInTheDocument();
  expect(screen.getByLabelText('Job Posting')).toBeInTheDocument();
});

// Starting without the required selections should show validation errors
test('starting without selections shows validation errors', () => {
  render(<MatchingPage />);

  fireEvent.click(
    screen.getByRole('button', {
      name: 'Start Comparison',
    }),
  );

  expect(screen.getByText('Select a resume.')).toBeInTheDocument();
  expect(screen.getByText('Select a job posting.')).toBeInTheDocument();
});

// A valid comparison should move from processing to the results screen
test('a valid comparison can be processed and show results', () => {
  render(<MatchingPage />);

  selectComparison();

  fireEvent.click(
    screen.getByRole('button', {
      name: 'Start Comparison',
    }),
  );

  expect(
    screen.getByRole('heading', {
      level: 1,
      name: 'Comparison Processing',
    }),
  ).toBeInTheDocument();

  expect(screen.getByText('Cloud Co-op')).toBeInTheDocument();

  expect(
    screen.getByText('Junior Cloud Developer - Northstar Systems'),
  ).toBeInTheDocument();

  fireEvent.click(
    screen.getByRole('button', {
      name: 'Refresh Status',
    }),
  );

  expect(
    screen.getByRole('heading', {
      level: 1,
      name: 'Match and Gap Results',
    }),
  ).toBeInTheDocument();

  expect(screen.getByText('AWS experience')).toBeInTheDocument();
  expect(screen.getByText('Kubernetes')).toBeInTheDocument();
});

// The prototype failure control should display the failed comparison screen
test('a simulated processing failure shows the retry screen', () => {
  render(<MatchingPage />);

  selectComparison('res-1', 'job-2');

  fireEvent.click(
    screen.getByRole('checkbox', {
      name: 'Simulate processing failure',
    }),
  );

  fireEvent.click(
    screen.getByRole('button', {
      name: 'Start Comparison',
    }),
  );

  fireEvent.click(
    screen.getByRole('button', {
      name: 'Refresh Status',
    }),
  );

  expect(
    screen.getByRole('heading', {
      level: 1,
      name: 'Comparison Could Not Be Completed',
    }),
  ).toBeInTheDocument();

  expect(screen.getByText('Status: Failed')).toBeInTheDocument();
  expect(screen.getByText('Software Developer - General')).toBeInTheDocument();

  expect(
    screen.getByText('Cloud Support Associate - MapleTech Solutions'),
  ).toBeInTheDocument();
});

// Retrying a failed comparison should return to processing
test('a failed comparison can be retried', () => {
  render(<MatchingPage />);

  selectComparison();

  fireEvent.click(
    screen.getByRole('checkbox', {
      name: 'Simulate processing failure',
    }),
  );

  fireEvent.click(
    screen.getByRole('button', {
      name: 'Start Comparison',
    }),
  );

  fireEvent.click(
    screen.getByRole('button', {
      name: 'Refresh Status',
    }),
  );

  fireEvent.click(
    screen.getByRole('button', {
      name: 'Retry Comparison',
    }),
  );

  expect(
    screen.getByRole('heading', {
      level: 1,
      name: 'Comparison Processing',
    }),
  ).toBeInTheDocument();
});

// Running a new comparison should clear the previous selections
test('running a new comparison resets the form', () => {
  render(<MatchingPage />);

  selectComparison();

  fireEvent.click(
    screen.getByRole('button', {
      name: 'Start Comparison',
    }),
  );

  fireEvent.click(
    screen.getByRole('button', {
      name: 'Refresh Status',
    }),
  );

  fireEvent.click(
    screen.getByRole('button', {
      name: 'Run New Comparison',
    }),
  );

  expect(screen.getByLabelText('Resume')).toHaveValue('');
  expect(screen.getByLabelText('Job Posting')).toHaveValue('');
});