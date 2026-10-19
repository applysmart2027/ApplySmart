import { useState, type ChangeEventHandler, type FormEvent } from 'react';
import { Link } from 'react-router';
import { ResumeSelection } from './ResumeSelection';
import { TextField } from './TextField';
import { APPLICATION_STATUSES, type ApplicationDraft } from './types';
import { validateApplication } from './validation';

type ChangeHandler = ChangeEventHandler<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;

export function ApplicationForm({
  initialDraft,
  submitLabel,
  cancelTo,
  onSave,
}: {
  initialDraft: ApplicationDraft;
  submitLabel: string;
  cancelTo: string;
  onSave: (draft: ApplicationDraft) => void;
}) {
  const [draft, setDraft] = useState(initialDraft);
  const [submit, setSubmit] = useState<'idle' | 'attempted' | 'failed'>('idle');
  const [simulateFailure, setSimulateFailure] = useState(false);
  // 'returned' puts focus back on the resume button after the step closes.
  const [resumeStep, setResumeStep] = useState<'closed' | 'open' | 'returned'>('closed');
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

    onSave({ ...draft, jobTitle: draft.jobTitle.trim(), employer: draft.employer.trim() });
  }

  if (resumeStep === 'open') {
    return (
      <ResumeSelection
        current={{ id: draft.resumeId, name: draft.resumeName }}
        onAttach={(resume) => {
          setDraft({ ...draft, resumeId: resume.id, resumeName: resume.name });
          setResumeStep('returned');
        }}
        onCancel={() => setResumeStep('returned')}
      />
    );
  }

  return (
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
        <span>Resume</span>
        <div className="resume-row">
          <span id="resume-name">{draft.resumeName || 'No resume attached'}</span>
          <button
            type="button"
            className="button"
            aria-describedby="resume-name"
            autoFocus={resumeStep === 'returned'}
            onClick={() => setResumeStep('open')}
          >
            {draft.resumeName ? 'Change resume' : 'Select or upload resume'}
          </button>
        </div>
      </div>
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
        <Link to={cancelTo} className="button">
          Cancel
        </Link>
        <button type="submit" className="button button-primary">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
