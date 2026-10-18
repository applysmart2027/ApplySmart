import { expect, test } from 'vitest';
import type { ApplicationDraft } from './types';
import { validateApplication } from './validation';

const complete: ApplicationDraft = {
  jobTitle: 'Data Engineer',
  employer: 'Maplestone Robotics',
  postingUrl: '',
  status: 'Saved',
  deadline: '',
  resumeId: '',
  notes: '',
  contactName: '',
  contactEmail: '',
};

test('a complete draft has no errors', () => {
  expect(validateApplication(complete)).toEqual({});
});

test('a blank or space-only job title and employer are reported', () => {
  expect(validateApplication({ ...complete, jobTitle: '   ', employer: '' })).toEqual({
    jobTitle: 'Enter the job title.',
    employer: 'Enter the employer.',
  });
});

test('the posting URL must be a full http or https address when given', () => {
  const message = 'Enter a full web address starting with https://, or leave this blank.';
  expect(validateApplication({ ...complete, postingUrl: 'careers.example.com' }).postingUrl).toBe(
    message,
  );
  expect(
    validateApplication({ ...complete, postingUrl: 'ftp://files.example.com/job' }).postingUrl,
  ).toBe(message);
  expect(validateApplication({ ...complete, postingUrl: 'https://jobs.example.com/42' })).toEqual(
    {},
  );
});

test('the contact email must look like an address when given', () => {
  expect(validateApplication({ ...complete, contactEmail: 'priya.raman' }).contactEmail).toBe(
    'Enter an email address like name@example.com, or leave this blank.',
  );
  expect(validateApplication({ ...complete, contactEmail: 'priya@maplestone.example' })).toEqual(
    {},
  );
});
