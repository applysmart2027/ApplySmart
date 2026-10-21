// Validation errors for the resume and job posting selection fields
export type MatchingErrors = {
  resumeId?: string;
  jobPostingId?: string;
};

// Checks that both required selections were made before starting a comparison
export function validateComparison(
  resumeId: string,
  jobPostingId: string,
): MatchingErrors {
  const errors: MatchingErrors = {};

  if (!resumeId.trim()) {
    errors.resumeId = 'Select a resume.';
  }

  if (!jobPostingId.trim()) {
    errors.jobPostingId = 'Select a job posting.';
  }

  return errors;
}

// Returns true when at least one validation error exists
export function hasMatchingErrors(errors: MatchingErrors) {
  return Object.keys(errors).length > 0;
}