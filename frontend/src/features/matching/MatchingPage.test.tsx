import {
  fireEvent,
  render,
  screen,
} from '@testing-library/react';

import {
  beforeEach,
  expect,
  test,
  vi,
} from 'vitest';

import {
  createComparison,
  getComparisonResult,
  retryComparison,
  type ComparisonApiResult,
} from './api';

import { MatchingPage } from './MatchingPage';
import { sampleComparisonResult } from './sampleData';


vi.mock('./api', () => ({
  ComparisonRequestError: class ComparisonRequestError extends Error {
    readonly fieldErrors: {
      resumeId?: string;
      jobPostingId?: string;
    };

    constructor(fieldErrors: {
      resumeId?: string;
      jobPostingId?: string;
    }) {
      super('Comparison request was refused.');
      this.fieldErrors = fieldErrors;
    }
  },

  createComparison: vi.fn(),
  getComparisonResult: vi.fn(),
  retryComparison: vi.fn(),
}));


const mockedCreateComparison =
  vi.mocked(createComparison);

const mockedGetComparisonResult =
  vi.mocked(getComparisonResult);

const mockedRetryComparison =
  vi.mocked(retryComparison);


function apiResult(
  changes: Partial<ComparisonApiResult> = {},
): ComparisonApiResult {
  return {
    id: 'comparison-1',
    resumeId: 'res-2',
    jobPostingId: 'job-1',
    status: 'Queued',
    matchedQualifications: [],
    qualificationGaps: [],
    failureReason: '',
    ...changes,
  };
}


function selectComparison(
  resumeId = 'res-2',
  jobPostingId = 'job-1',
) {
  fireEvent.change(
    screen.getByLabelText('Resume'),
    {
      target: { value: resumeId },
    },
  );

  fireEvent.change(
    screen.getByLabelText('Job Posting'),
    {
      target: { value: jobPostingId },
    },
  );
}


beforeEach(() => {
  vi.resetAllMocks();
});


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

  expect(
    screen.getByLabelText('Resume'),
  ).toBeInTheDocument();

  expect(
    screen.getByLabelText('Job Posting'),
  ).toBeInTheDocument();
});


test('starting without selections shows validation errors', () => {
  render(<MatchingPage />);

  fireEvent.click(
    screen.getByRole('button', {
      name: 'Start Comparison',
    }),
  );

  expect(
    screen.getByText('Select a resume.'),
  ).toBeInTheDocument();

  expect(
    screen.getByText('Select a job posting.'),
  ).toBeInTheDocument();

  expect(
    mockedCreateComparison,
  ).not.toHaveBeenCalled();
});


test('a valid comparison can be processed and show results', async () => {
  mockedCreateComparison.mockResolvedValue(
    apiResult(),
  );

  mockedGetComparisonResult.mockResolvedValue(
    apiResult({
      status: 'Completed',

      matchedQualifications:
        sampleComparisonResult.matchedQualifications,

      qualificationGaps:
        sampleComparisonResult.qualificationGaps,
    }),
  );

  render(<MatchingPage />);

  selectComparison();

  fireEvent.click(
    screen.getByRole('button', {
      name: 'Start Comparison',
    }),
  );

  expect(
    await screen.findByRole('heading', {
      level: 1,
      name: 'Comparison Processing',
    }),
  ).toBeInTheDocument();

  expect(
    screen.getByText('Queued'),
  ).toBeInTheDocument();

  expect(
    mockedCreateComparison,
  ).toHaveBeenCalledWith(
    'res-2',
    'job-1',
    false,
  );

  fireEvent.click(
    screen.getByRole('button', {
      name: 'Refresh Status',
    }),
  );

  expect(
    await screen.findByRole('heading', {
      level: 1,
      name: 'Match and Gap Results',
    }),
  ).toBeInTheDocument();

  expect(
    screen.getByText('AWS experience'),
  ).toBeInTheDocument();

  expect(
    screen.getByText('Kubernetes'),
  ).toBeInTheDocument();

  expect(
    mockedGetComparisonResult,
  ).toHaveBeenCalledWith('comparison-1');
});


test('a simulated processing failure shows the retry screen', async () => {
  mockedCreateComparison.mockResolvedValue(
    apiResult({
      resumeId: 'res-1',
      jobPostingId: 'job-2',
    }),
  );

  mockedGetComparisonResult.mockResolvedValue(
    apiResult({
      resumeId: 'res-1',
      jobPostingId: 'job-2',
      status: 'Failed',
      failureReason:
        'Comparison could not be completed.',
    }),
  );

  render(<MatchingPage />);

  selectComparison(
    'res-1',
    'job-2',
  );

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

  await screen.findByRole('heading', {
    level: 1,
    name: 'Comparison Processing',
  });

  expect(
    mockedCreateComparison,
  ).toHaveBeenCalledWith(
    'res-1',
    'job-2',
    true,
  );

  fireEvent.click(
    screen.getByRole('button', {
      name: 'Refresh Status',
    }),
  );

  expect(
    await screen.findByRole('heading', {
      level: 1,
      name: 'Comparison Could Not Be Completed',
    }),
  ).toBeInTheDocument();

  expect(
    screen.getByText('Status: Failed'),
  ).toBeInTheDocument();

  expect(
    screen.getByText(
      'Software Developer - General',
    ),
  ).toBeInTheDocument();

  expect(
    screen.getByText(
      'Cloud Support Associate - MapleTech Solutions',
    ),
  ).toBeInTheDocument();
});


test('a failed comparison can be retried', async () => {
  mockedCreateComparison.mockResolvedValue(
    apiResult(),
  );

  mockedGetComparisonResult.mockResolvedValue(
    apiResult({
      status: 'Failed',
      failureReason:
        'Comparison could not be completed.',
    }),
  );

  mockedRetryComparison.mockResolvedValue(
    apiResult({
      id: 'comparison-2',
      status: 'Queued',
    }),
  );

  render(<MatchingPage />);

  selectComparison();

  fireEvent.click(
    screen.getByRole('button', {
      name: 'Start Comparison',
    }),
  );

  await screen.findByRole('heading', {
    level: 1,
    name: 'Comparison Processing',
  });

  fireEvent.click(
    screen.getByRole('button', {
      name: 'Refresh Status',
    }),
  );

  await screen.findByRole('heading', {
    level: 1,
    name: 'Comparison Could Not Be Completed',
  });

  fireEvent.click(
    screen.getByRole('button', {
      name: 'Retry Comparison',
    }),
  );

  expect(
    await screen.findByRole('heading', {
      level: 1,
      name: 'Comparison Processing',
    }),
  ).toBeInTheDocument();

  expect(
    mockedRetryComparison,
  ).toHaveBeenCalledWith(
    'comparison-1',
  );

  expect(
    screen.getByText('Queued'),
  ).toBeInTheDocument();
});


test('running a new comparison resets the form', async () => {
  mockedCreateComparison.mockResolvedValue(
    apiResult(),
  );

  mockedGetComparisonResult.mockResolvedValue(
    apiResult({
      status: 'Completed',

      matchedQualifications:
        sampleComparisonResult.matchedQualifications,

      qualificationGaps:
        sampleComparisonResult.qualificationGaps,
    }),
  );

  render(<MatchingPage />);

  selectComparison();

  fireEvent.click(
    screen.getByRole('button', {
      name: 'Start Comparison',
    }),
  );

  await screen.findByRole('heading', {
    level: 1,
    name: 'Comparison Processing',
  });

  fireEvent.click(
    screen.getByRole('button', {
      name: 'Refresh Status',
    }),
  );

  await screen.findByRole('heading', {
    level: 1,
    name: 'Match and Gap Results',
  });

  fireEvent.click(
    screen.getByRole('button', {
      name: 'Run New Comparison',
    }),
  );

  expect(
    screen.getByLabelText('Resume'),
  ).toHaveValue('');

  expect(
    screen.getByLabelText('Job Posting'),
  ).toHaveValue('');
});