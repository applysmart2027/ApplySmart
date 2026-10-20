import { useNavigate, useParams } from 'react-router';
import { PageHeader } from '../../shared/ui/PageHeader';
import { ApplicationForm } from './ApplicationForm';
import { describeApplication } from './format';
import { RecordUnavailable } from './RecordUnavailable';
import { useApplication, useApplications } from './store';
import './applications.css';

export function EditApplicationPage() {
  const { id } = useParams();
  const record = useApplication(id);
  const { dispatch } = useApplications();
  const navigate = useNavigate();

  if (typeof record === 'string') return <RecordUnavailable reason={record} />;

  const detailsPath = `/applications/${record.id}`;
  return (
    <>
      <PageHeader title="Edit Application Record" subtitle={describeApplication(record)} />
      {/* Keyed by record so moving straight to another record's edit page starts a fresh draft. */}
      <ApplicationForm
        key={record.id}
        initialDraft={record}
        submitLabel="Save changes"
        cancelTo={detailsPath}
        onSave={(draft) => {
          dispatch({ type: 'updated', record: { ...draft, id: record.id } });
          navigate(detailsPath);
        }}
      />
    </>
  );
}
