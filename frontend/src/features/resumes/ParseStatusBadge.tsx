import type { ParseStatus } from './types';

const statusClasses: Record<ParseStatus, string> = {
  Processing: 'parse-status-processing',
  'Needs review': 'parse-status-review',
  Confirmed: 'parse-status-confirmed',
  Failed: 'parse-status-failed',
};

export function ParseStatusBadge({ status }: { status: ParseStatus }) {
  return <span className={`parse-status ${statusClasses[status]}`}>{status}</span>;
}
