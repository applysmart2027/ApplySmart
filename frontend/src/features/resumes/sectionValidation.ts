import { SECTION_FIELDS, type SectionEntry, type SectionName } from './types';

export type EntryField = 'title' | 'organization' | 'startDate' | 'endDate';

export type EntryErrors = Partial<Record<EntryField, string>>;

const MONTHS = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
];

// Reads "May 2025", "Sept. 2025" or "2025-05" as a count of months, so dates compare directly.
// Returns null for anything else.
export function parseMonth(value: string): number | null {
  const iso = /^(\d{4})-(\d{1,2})$/.exec(value);
  if (iso) {
    const month = Number(iso[2]);
    return month >= 1 && month <= 12 ? Number(iso[1]) * 12 + month - 1 : null;
  }
  const named = /^([a-z]{3,})\.?\s+(\d{4})$/i.exec(value);
  if (!named) return null;
  const month = MONTHS.findIndex((m) => m.startsWith(named[1].toLowerCase()));
  return month === -1 ? null : Number(named[2]) * 12 + month;
}

const DATE_FORMAT = 'Use a month and year, like May 2025.';

function required(label: string) {
  const article = /^[aeiou]/i.test(label) ? 'an' : 'a';
  return `Enter ${article} ${label.toLowerCase()}.`;
}

// The messages here are the ones students see. Dates are optional, but must be readable.
export function validateEntry(entry: SectionEntry, section: SectionName): EntryErrors {
  const labels = SECTION_FIELDS[section];
  const errors: EntryErrors = {};
  if (!entry.title.trim()) errors.title = required(labels.title);
  if (!entry.organization.trim()) errors.organization = required(labels.organization);

  const startText = entry.startDate.trim();
  const endText = entry.endDate.trim();
  const start = parseMonth(startText);
  const ongoing = /^present$/i.test(endText);
  const end = ongoing ? null : parseMonth(endText);
  if (startText && start === null) errors.startDate = DATE_FORMAT;
  if (endText && !ongoing && end === null) {
    errors.endDate = 'Use a month and year, like Aug 2025, or Present.';
  } else if (start !== null && end !== null && end < start) {
    errors.endDate = 'End date is before start date.';
  }
  return errors;
}

export function hasErrors(errors: EntryErrors) {
  return Object.keys(errors).length > 0;
}

export function countEntriesWithErrors(entries: SectionEntry[], section: SectionName) {
  return entries.filter((entry) => hasErrors(validateEntry(entry, section))).length;
}
