import { useState, type ChangeEventHandler, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { useApplications } from './store';
import { APPLICATION_STATUSES, type ApplicationDraft } from './types';
import { validateApplication } from './validation';
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

type ChangeHandler = ChangeEventHandler<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;

export function CreateApplicationPage() {
  const { dispatch } = useApplications();
  const navigate = useNavigate();
  const [draft, setDraft] = useState(emptyDraft);
  const [submit, setSubmit] = useState<'idle' | 'attempted' | 'failed'>('idle');
  const [simulateFailure, setSimulateFailure] = useState(false);
  const errors = submit === 'idle' ? {} : validateApplication(draft);

  const update: ChangeHandler = (event) =>
    setDraft({ ...draft, [event.target.name]: event.target.value });

  const field = (name: keyof ApplicationDraft) => ({
    name,
    value: draft[name],
    error: errors[name],
    onChange: update,
  });

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const firstInvalid = Object.keys(validateApplication(draft))[0];
    if (firstInvalid) {
      setSubmit('attempted');
      (event.currentTarget.elements.namedItem(firstInvalid) as HTMLElement).focus();
      return;
    }
    if (simulateFailure) {
      setSubmit('failed');
      return;
    }

    const record = {
      ...draft,
      id: crypto.randomUUID(),
      jobTitle: draft.jobTitle.trim(),
      employer: draft.employer.trim(),
    };
    dispatch({ type: 'created', record });
    navigate('/applications');
  }

  return (
    <>
      <div className="page-header">
        <h1>Create Application Record</h1>
      </div>

      <form className="panel application-form" noValidate onSubmit={save}>
        {submit === 'failed' && (
          <p className="notice-error" role="alert">
            The application could not be saved. Your entries are still here, so you can try again.
          </p>
        )}

        <TextField label="Job title (required)" {...field('jobTitle')} />
        <TextField label="Employer (required)" {...field('employer')} />
        <TextField label="Job posting URL" type="url" {...field('postingUrl')} />
        <div className="field">
          <label htmlFor="status">Status</label>
          <select id="status" name="status" value={draft.status} onChange={update}>
            {APPLICATION_STATUSES.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </div>
        <TextField label="Deadline" type="date" {...field('deadline')} />
        <div className="field">
          <label htmlFor="notes">Notes</label>
          <textarea id="notes" name="notes" rows={4} value={draft.notes} onChange={update} />
        </div>

        <fieldset className="application-form-group">
          <legend>Optional contact</legend>
          <TextField label="Contact name" {...field('contactName')} />
          <TextField label="Contact email" type="email" {...field('contactEmail')} />
        </fieldset>

        <label className="prototype-control">
          <input
            type="checkbox"
            checked={simulateFailure}
            onChange={(event) => setSimulateFailure(event.target.checked)}
          />
          Simulate a save failure (prototype only)
        </label>

        <div className="application-actions">
          <Link to="/applications" className="button">
            Cancel
          </Link>
          <button type="submit" className="button button-primary">
            Save application
          </button>
        </div>
      </form>
    </>
  );
}

function TextField({
  name,
  label,
  type = 'text',
  value,
  error,
  onChange,
}: {
  name: keyof ApplicationDraft;
  label: string;
  type?: string;
  value: string;
  error?: string;
  onChange: ChangeHandler;
}) {
  const errorId = `${name}-error`;
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
      />
      {error && (
        <p id={errorId} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}
