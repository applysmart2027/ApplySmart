// Upload dates are calendar dates parsed as UTC midnight; formatting in UTC keeps them from
// showing a day early in time zones west of UTC.
const dateFormat = new Intl.DateTimeFormat('en-CA', { dateStyle: 'medium', timeZone: 'UTC' });

export function formatUploaded(uploaded: string) {
  return dateFormat.format(new Date(uploaded));
}
