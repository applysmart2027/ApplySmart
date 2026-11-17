import { csrfToken } from '../../shared/csrf';
import type {
  MatchStatus,
  QualificationGap,
  QualificationMatch,
} from './types';

const COMPARISONS_URL = '/api/matching/comparisons/';

export type ComparisonApiResult = {
  id: string;
  resumeId: string;
  jobPostingId: string;
  status: MatchStatus;
  matchedQualifications: QualificationMatch[];
  qualificationGaps: QualificationGap[];
  failureReason: string;
};

export class ComparisonRequestError extends Error {
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
}

async function readJson(response: Response) {
  // A 403 means the student's session has ended
  if (response.status === 403) {
    window.location.reload();
  }

  if (!response.ok) {
    throw new Error(`Matching request failed: ${response.status}`);
  }

  return response.json();
}

function toComparison(json: ComparisonApiResult): ComparisonApiResult {
  return {
    ...json,
    id: String(json.id),
    resumeId: String(json.resumeId),
    jobPostingId: String(json.jobPostingId),
  };
}

// Starts a new comparison
export async function createComparison(
  resumeId: string,
  jobPostingId: string,
  simulateFailure = false,
): Promise<ComparisonApiResult> {
  const response = await fetch(COMPARISONS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken(),
    },
    body: JSON.stringify({
      resumeId,
      jobPostingId,
      simulateFailure,
    }),
  });

  if (response.status === 400) {
    const errors = await response.json();

    throw new ComparisonRequestError(errors);
  }

  return toComparison(await readJson(response));
}

// Gets the latest comparison status and result
export async function getComparisonResult(
  comparisonId: string,
): Promise<ComparisonApiResult> {
  const response = await fetch(
    `${COMPARISONS_URL}${comparisonId}/`,
  );

  return toComparison(await readJson(response));
}

// Retries a failed comparison
export async function retryComparison(
  comparisonId: string,
): Promise<ComparisonApiResult> {
  const response = await fetch(
    `${COMPARISONS_URL}${comparisonId}/retry/`,
    {
      method: 'POST',
      headers: {
        'X-CSRFToken': csrfToken(),
      },
    },
  );

  return toComparison(await readJson(response));
}