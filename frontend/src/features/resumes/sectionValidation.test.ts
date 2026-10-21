import { expect, test } from 'vitest';
import { parseMonth, validateEntry } from './sectionValidation';

const entry = {
  id: 'e',
  title: 'Co-op Developer',
  organization: 'ABC Corp',
  startDate: 'May 2025',
  endDate: 'Aug 2025',
  details: '',
};

test('months parse from short names, full names and YYYY-MM', () => {
  expect(parseMonth('May 2025')).toBe(parseMonth('2025-05'));
  expect(parseMonth('Sept. 2025')).toBe(parseMonth('september 2025'));
  expect(parseMonth('Sep 2025')! - parseMonth('Aug 2025')!).toBe(1);
  expect(parseMonth('Jan 2026')! - parseMonth('Dec 2025')!).toBe(1);
  expect(parseMonth('Ma 2025')).toBeNull();
  expect(parseMonth('2025-13')).toBeNull();
  expect(parseMonth('summer 2025')).toBeNull();
});

test('a complete entry has no errors, and dates are optional', () => {
  expect(validateEntry(entry, 'Experience')).toEqual({});
  expect(validateEntry({ ...entry, startDate: '', endDate: '' }, 'Experience')).toEqual({});
  expect(validateEntry({ ...entry, endDate: 'present' }, 'Experience')).toEqual({});
});

test('required fields name the field for that section', () => {
  const blank = { ...entry, title: ' ', organization: '' };

  expect(validateEntry(blank, 'Experience')).toMatchObject({
    title: 'Enter a job title.',
    organization: 'Enter an organization.',
  });
  expect(validateEntry(blank, 'Education')).toMatchObject({
    title: 'Enter a program.',
    organization: 'Enter a school.',
  });
});

test('an end date before the start date is refused', () => {
  expect(
    validateEntry({ ...entry, startDate: 'Sep 2025', endDate: 'Jan 2025' }, 'Experience'),
  ).toEqual({ endDate: 'End date is before start date.' });
  expect(
    validateEntry({ ...entry, startDate: 'Sep 2025', endDate: 'Sep 2025' }, 'Experience'),
  ).toEqual({});
});

test('dates that cannot be read ask for a month and year', () => {
  expect(
    validateEntry({ ...entry, startDate: 'last year', endDate: 'soon' }, 'Experience'),
  ).toEqual({
    startDate: 'Use a month and year, like May 2025.',
    endDate: 'Use a month and year, like Aug 2025, or Present.',
  });
});
