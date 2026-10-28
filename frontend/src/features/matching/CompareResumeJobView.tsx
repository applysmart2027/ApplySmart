import type { FormEvent } from 'react';
import { PageHeader } from '../../shared/ui/PageHeader';
import { sampleJobPostings, sampleResumes } from './sampleData';
import type { MatchingErrors } from './validation';

type CompareResumeJobViewProps = {
  resumeId: string;
  jobPostingId: string;
  errors: MatchingErrors;
  simulateFailure: boolean;
  onResumeChange: (resumeId: string) => void;
  onJobPostingChange: (jobPostingId: string) => void;
  onSimulateFailureChange: (value: boolean) => void;
  onStart: () => void;
  onCancel: () => void;
};

// Screen where the student selects the resume and job posting to compare
export function CompareResumeJobView({
  resumeId,
  jobPostingId,
  errors,
  simulateFailure,
  onResumeChange,
  onJobPostingChange,
  onSimulateFailureChange,
  onStart,
  onCancel,
}: CompareResumeJobViewProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onStart();
  }

  return (
    <section>
      <PageHeader
        title="Resume Matching and Gap Analysis"
        subtitle="Compare a resume with a job posting to review matching qualifications and gaps."
      />

      <h2>Compare Resume to Job</h2>

      <form className="matching-form panel" onSubmit={handleSubmit}>
        <label className="field">
          Resume
          <select
            value={resumeId}
            onChange={(event) => onResumeChange(event.target.value)}
            aria-invalid={Boolean(errors.resumeId)}
            aria-describedby={errors.resumeId ? 'resume-error' : undefined}
          >
            <option value="">Select a resume...</option>

            {sampleResumes.map((resume) => (
              <option key={resume.id} value={resume.id}>
                {resume.name}
              </option>
            ))}
          </select>

          {errors.resumeId && (
            <span id="resume-error" className="field-error">
              {errors.resumeId}
            </span>
          )}
        </label>

        <label className="field">
          Job Posting
          <select
            value={jobPostingId}
            onChange={(event) => onJobPostingChange(event.target.value)}
            aria-invalid={Boolean(errors.jobPostingId)}
            aria-describedby={
              errors.jobPostingId ? 'job-posting-error' : undefined
            }
          >
            <option value="">Select a job posting...</option>

            {sampleJobPostings.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title} - {job.company}
              </option>
            ))}
          </select>

          {errors.jobPostingId && (
            <span id="job-posting-error" className="field-error">
              {errors.jobPostingId}
            </span>
          )}
        </label>

        <p className="matching-help">
          Both a resume and job posting are required before starting.
        </p>

        <div className="matching-actions">
          <button className="button button-primary" type="submit">
            Start Comparison
          </button>

          <button className="button" type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>

        <label className="prototype-control">
          <input
            type="checkbox"
            checked={simulateFailure}
            onChange={(event) =>
              onSimulateFailureChange(event.target.checked)
            }
          />
          Simulate processing failure
        </label>
      </form>
    </section>
  );
}