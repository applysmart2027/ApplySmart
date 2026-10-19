import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { PageHeader } from '../../shared/ui/PageHeader';
import { describeApplication } from './format';
import { RecordUnavailable } from './RecordUnavailable';
import { useApplication, useApplications } from './store';
import './applications.css';

export function DeleteApplicationPage() {
  const { id } = useParams();
  const record = useApplication(id);
  const { dispatch } = useApplications();
  const navigate = useNavigate();
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [failed, setFailed] = useState(false);

  if (typeof record === 'string') return <RecordUnavailable reason={record} />;

  const confirmDelete = () => {
    if (simulateFailure) {
      setFailed(true);
      return;
    }
    dispatch({ type: 'removed', id: record.id });
    navigate('/applications');
  };

  return (
    <>
      <PageHeader title="Delete Application Record" subtitle={describeApplication(record)} />
      <div className="panel delete-confirmation">
        {failed && (
          <p className="notice-error" role="alert">
            The application could not be deleted. It is still saved, so you can try again or cancel.
          </p>
        )}
        <p className="delete-question">Are you sure you want to delete this application?</p>
        <p>The record, its notes and its contact details will be removed. This cannot be undone.</p>

        <label className="prototype-control">
          <input
            type="checkbox"
            checked={simulateFailure}
            onChange={(event) => setSimulateFailure(event.target.checked)}
          />
          Simulate a delete failure (prototype only)
        </label>

        <div className="application-actions">
          <Link to={`/applications/${record.id}`} className="button">
            Cancel
          </Link>
          <button type="button" className="button button-danger" onClick={confirmDelete}>
            Delete application
          </button>
        </div>
      </div>
    </>
  );
}
