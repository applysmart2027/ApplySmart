import type { ApplicationDraft } from './types';

type FieldErrors = Partial<Record<keyof ApplicationDraft, string>>;

// Keys are added in form order, so the first key is the first invalid field on screen.
export function validateApplication(draft: ApplicationDraft): FieldErrors {
  const errors: FieldErrors = {};
  if (!draft.jobTitle.trim()) errors.jobTitle = 'Enter the job title.';
  if (!draft.employer.trim()) errors.employer = 'Enter the employer.';
  if (
    draft.postingUrl &&
    !['http:', 'https:'].includes(URL.parse(draft.postingUrl)?.protocol ?? '')
  )
    errors.postingUrl = 'Enter a full web address starting with https://, or leave this blank.';
  if (draft.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.contactEmail))
    errors.contactEmail = 'Enter an email address like name@example.com, or leave this blank.';
  return errors;
}
