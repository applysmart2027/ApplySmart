import { useNavigate } from 'react-router';
import { PageHeader } from '../../shared/ui/PageHeader';
import { ApplicationForm } from './ApplicationForm';
import { useApplications } from './store';
import type { ApplicationDraft } from './types';
import './applications.css';

const emptyDraft: ApplicationDraft = {
  jobTitle: '',
  employer: '',
  postingUrl: '',
  status: 'Saved',
  deadline: '',
  resumeId: '',
  resumeName: '',
  notes: '',
  contactName: '',
  contactEmail: '',
};

export function CreateApplicationPage() {
  const { dispatch } = useApplications();
  const navigate = useNavigate();

  return (
    <>
      <PageHeader title="Create Application Record" />
      <ApplicationForm
        initialDraft={emptyDraft}
        submitLabel="Save application"
        cancelTo="/applications"
        onSave={(draft) => {
          dispatch({ type: 'created', record: { ...draft, id: crypto.randomUUID() } });
          navigate('/applications');
        }}
      />
    </>
  );
}
