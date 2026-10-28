import { expect, test } from 'vitest';
import { hasMatchingErrors, validateComparison } from './validation';

// A valid comparison should not return any errors
test('a selected resume and job posting have no errors', () => {
  expect(validateComparison('res-1', 'job-1')).toEqual({});
});

// A missing resume should return a resume validation error
test('a missing resume is reported', () => {
  expect(validateComparison('', 'job-1')).toEqual({
    resumeId: 'Select a resume.',
  });
});

// A missing job posting should return a job posting validation error
test('a missing job posting is reported', () => {
  expect(validateComparison('res-1', '')).toEqual({
    jobPostingId: 'Select a job posting.',
  });
});

// Both missing selections should return both validation errors
test('missing resume and job posting are both reported', () => {
  expect(validateComparison('', '')).toEqual({
    resumeId: 'Select a resume.',
    jobPostingId: 'Select a job posting.',
  });
});

// Space-only selections should also be treated as missing
test('space-only selections are treated as missing', () => {
  expect(validateComparison('   ', '   ')).toEqual({
    resumeId: 'Select a resume.',
    jobPostingId: 'Select a job posting.',
  });
});

// Checks whether the validation result contains any errors
test('hasMatchingErrors detects validation errors', () => {
  expect(hasMatchingErrors({})).toBe(false);

  expect(
    hasMatchingErrors({
      resumeId: 'Select a resume.',
    }),
  ).toBe(true);
});