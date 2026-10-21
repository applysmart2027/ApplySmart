import { PageHeader } from '../../shared/ui/PageHeader';

type ComparisonFailedViewProps = {
  resumeName: string;
  jobTitle: string;
  company: string;
  onRetry: () => void;
  onChooseDifferent: () => void;
  onBack: () => void;
};

// Screen shown when a comparison cannot be completed
export function ComparisonFailedView({
  resumeName,
  jobTitle,
  company,
  onRetry,
  onChooseDifferent,
  onBack,
}: ComparisonFailedViewProps) {
  return (
    <section>
      <PageHeader
        title="Comparison Could Not Be Completed"
        subtitle="ApplySmart was unable to finish processing this comparison."
      />

      <div className="matching-card panel">
        <p className="matching-status matching-status-failed">
          Status: Failed
        </p>

        <dl className="matching-details">
          <div>
            <dt>Selected Resume</dt>
            <dd>{resumeName}</dd>
          </div>

          <div>
            <dt>Job Posting</dt>
            <dd>
              {jobTitle} - {company}
            </dd>
          </div>
        </dl>

        <p className="matching-help">
          Your selected resume and job posting were kept. You can retry the
          comparison or choose different inputs.
        </p>

        <div className="matching-actions">
          <button
            className="button button-primary"
            type="button"
            onClick={onRetry}
          >
            Retry Comparison
          </button>

          <button
            className="button"
            type="button"
            onClick={onChooseDifferent}
          >
            Choose Different Resume / Job
          </button>

          <button className="button" type="button" onClick={onBack}>
            Back
          </button>
        </div>
      </div>
    </section>
  );
}