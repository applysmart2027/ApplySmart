import type { ApplicationRecord } from './types';

// Deadlines are calendar dates parsed as UTC midnight; formatting in UTC keeps them from
// showing a day early in time zones west of UTC.
const dateFormat = new Intl.DateTimeFormat('en-CA', { dateStyle: 'medium', timeZone: 'UTC' });

export function formatDeadline(deadline: string) {
  return deadline ? dateFormat.format(new Date(deadline)) : 'No deadline';
}

export function describeApplication(record: ApplicationRecord) {
  return `${record.jobTitle} at ${record.employer}`;
}
