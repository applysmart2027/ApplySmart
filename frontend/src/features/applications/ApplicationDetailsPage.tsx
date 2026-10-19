import { Link, useParams } from 'react-router';
import { formatDeadline } from './format';
import { restrictedApplicationId } from './sampleData';
import { useApplications } from './store';
import './applications.css';

export function ApplicationDetailsPage() {
  const { id } = useParams();
  const { records } = useApplications();
  const record = records.find((r) => r.id === id);

  if (id === restrictedApplicationId) {
    return (
      <Unavailable
        title="You cannot view this application"
        text="This record belongs to another account. Open one of your own applications instead."
      />
    );
  }
  if (!record) {
    return (
      <Unavailable
        title="Application not found"
        text="There is no application record at this address. It may have been deleted."
      />
    );
  }

  return (
    <>
      <Link to="/applications" className="text-link details-back">
        Back to Application Records
      </Link>
      <div className="page-header">
        <div className="details-heading">
          <h1>{record.jobTitle}</h1>
          <p className="page-intro">{record.employer}</p>
        </div>
        <div className="application-actions">
          <Link to={`/applications/${record.id}/edit`} className="button button-primary">
            Edit application
          </Link>
          <Link to={`/applications/${record.id}/delete`} className="button">
            Delete application
          </Link>
        </div>
      </div>

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

function Unavailable({ title, text }: { title: string; text: string }) {
  return (
    <>
      <h1>{title}</h1>
      <p className="page-intro">
        {text}{' '}
        <Link to="/applications" className="text-link">
          Back to Application Records
        </Link>
      </p>
    </>
  );
}
