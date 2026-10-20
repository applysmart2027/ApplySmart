// Upload dates are calendar dates parsed as UTC midnight; formatting in UTC keeps them from
// showing a day early in time zones west of UTC.
const dateFormat = new Intl.DateTimeFormat('en-CA', { dateStyle: 'medium', timeZone: 'UTC' });

export function formatUploaded(uploaded: string) {
  return dateFormat.format(new Date(uploaded));
}

// Today's calendar date where the student is, as YYYY-MM-DD.
export function todayIso() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function formatFileSize(bytes: number) {
  const kb = bytes / 1024;
  return kb < 1024 ? `${Math.max(1, Math.round(kb))} KB` : `${(kb / 1024).toFixed(1)} MB`;
}
