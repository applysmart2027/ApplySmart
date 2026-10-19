import { useState, type ChangeEvent } from 'react';
import { sampleResumes } from './sampleData';
import type { ResumeRef } from './types';

export function ResumeSelection({
  current,
  onAttach,
  onCancel,
}: {
  current: ResumeRef;
  onAttach: (resume: ResumeRef) => void;
  onCancel: () => void;
}) {
  const [choice, setChoice] = useState(current);
  const [message, setMessage] = useState('');
  const isListed = sampleResumes.some((resume) => resume.id === choice.id);
  const focusId = isListed ? choice.id : sampleResumes[0].id;

  function pickFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!/\.(pdf|docx)$/i.test(file.name)) {
      setMessage('Choose a PDF or DOCX file.');
      return;
    }
    setChoice({ id: crypto.randomUUID(), name: file.name });
    setMessage('');
  }

  function attach() {
    if (choice.id) onAttach(choice);
    else setMessage('Choose a resume or upload a file.');
  }

  return (
    <section className="panel application-form resume-step" aria-labelledby="resume-step-title">
      <h2 id="resume-step-title">Select or upload a resume</h2>

      <fieldset className="application-form-group">
        <legend>Your resumes</legend>
        {sampleResumes.map((resume) => (
          <label key={resume.id} className="resume-option">
            <input
              type="radio"
              name="resume"
              checked={choice.id === resume.id}
              autoFocus={resume.id === focusId}
              onChange={() => {
                setChoice(resume);
                setMessage('');
              }}
            />
            {resume.name}
          </label>
        ))}
      </fieldset>

      <div className="field">
        <label htmlFor="resume-file">Upload a new resume (PDF or DOCX)</label>
        <input id="resume-file" type="file" accept=".pdf,.docx" onChange={pickFile} />
        {choice.id && !isListed && <p className="resume-picked">Selected file: {choice.name}</p>}
      </div>

      {message && (
        <p className="notice-error" role="alert">
          {message}
        </p>
      )}

      <div className="application-actions">
        <button type="button" className="button" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="button button-primary" onClick={attach}>
          Attach resume
        </button>
      </div>
    </section>
  );
}
