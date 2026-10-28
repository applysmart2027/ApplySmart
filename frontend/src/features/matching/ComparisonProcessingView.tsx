import { PageHeader } from '../../shared/ui/PageHeader';

type ComparisonProcessingViewProps = {
  resumeName: string;
  jobTitle: string;
  company: string;
  onRefresh: () => void;
  onBack: () => void;
};

// Screen shown while ApplySmart is processing the comparison
export function ComparisonProcessingView({
  resumeName,
  jobTitle,
  company,
  onRefresh,
  onBack,
}: ComparisonProcessingViewProps) {
  return (
    <section>
      <PageHeader
        title="Comparison Processing"
        subtitle="ApplySmart is analyzing your resume against the selected job posting."
      />

      <div className="matching-card panel">
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

          <div>
            <dt>Current Status</dt>
            <dd>Processing</dd>
          </div>
        </dl>

        <div className="matching-progress">
          <p>Extracting and comparing qualifications...</p>

          <progress value={65} max={100}>
            65%
          </progress>

          <span>65% complete</span>
        </div>

        <p className="matching-help">
          Required and preferred qualifications are being checked against the
          selected resume.
        </p>

        <div className="matching-actions">
          <button className="button button-primary" type="button" onClick={onRefresh}>
            Refresh Status
          </button>

          <button className="button" type="button" onClick={onBack}>
            Back to Comparisons
          </button>
        </div>
      </div>
    </section>
  );
}