import { Link, useParams } from 'react-router';
import { PageHeader } from '../../shared/ui/PageHeader';
import { formatDeadline } from './format';
import { RecordUnavailable } from './RecordUnavailable';
import { useApplication } from './store';
import './applications.css';

export function ApplicationDetailsPage() {
  const { id } = useParams();
  const record = useApplication(id);
  if (typeof record === 'string') return <RecordUnavailable reason={record} />;

  return (
    <>
      <Link to="/applications" className="text-link details-back">
        Back to Application Records
      </Link>
      <PageHeader title={record.jobTitle} subtitle={record.employer}>
        <Link to={`/applications/${record.id}/edit`} className="button button-primary">
          Edit application
        </Link>
        <Link to={`/applications/${record.id}/delete`} className="button">
          Delete application
        </Link>
      </PageHeader>

      <dl className="panel details-list">
        <div>
          <dt>Status</dt>
          <dd>
            <span className="status">{record.status}</span>
          </dd>
        </div>
        <div>
          <dt>Deadline</dt>
          <dd>{formatDeadline(record.deadline)}</dd>
        </div>
        <div>
          <dt>Job posting</dt>
          <dd>
            {record.postingUrl ? (
              <a href={record.postingUrl} target="_blank" rel="noreferrer" className="text-link">
                {record.postingUrl}
              </a>
            ) : (
              'Not provided'
            )}
          </dd>
        </div>
        <div>
          <dt>Resume</dt>
          <dd>{record.resumeName || 'No resume attached'}</dd>
        </div>
        <div>
          <dt>Contact</dt>
          <dd>
            {!record.contactName && !record.contactEmail && 'No contact recorded'}
            {record.contactName && <span className="details-line">{record.contactName}</span>}
            {record.contactEmail && (
              <a href={`mailto:${record.contactEmail}`} className="text-link details-line">
                {record.contactEmail}
              </a>
            )}
          </dd>
        </div>
        <div>
          <dt>Notes</dt>
          <dd>{record.notes || 'No notes'}</dd>
        </div>
      </dl>
    </>
  );
}
