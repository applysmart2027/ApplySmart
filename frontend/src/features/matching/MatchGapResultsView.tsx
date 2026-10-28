import { PageHeader } from '../../shared/ui/PageHeader';
import type { ComparisonResult } from './types';

type MatchGapResultsViewProps = {
  result: ComparisonResult;
  onRunNewComparison: () => void;
  onBack: () => void;
};

// Screen that shows matched qualifications and qualification gaps
export function MatchGapResultsView({
  result,
  onRunNewComparison,
  onBack,
}: MatchGapResultsViewProps) {
  const matchedCount = result.matchedQualifications.length;
  const gapCount = result.qualificationGaps.length;

  return (
    <section>
      <PageHeader
        title="Match and Gap Results"
        subtitle={`${result.resume.name} | ${result.jobPosting.title} - ${result.jobPosting.company}`}
      />

      <div className="alignment-summary panel">
        <div>
          <span className="matching-eyebrow">Overall Alignment</span>
          <strong>Strong Alignment</strong>
        </div>

        <p>
          {matchedCount} matched qualifications | {gapCount} qualification gaps
        </p>
      </div>

      <div className="matching-results-grid">
        <section className="matching-result-card panel">
          <h2>Matched Qualifications</h2>

          <div className="qualification-list">
            {result.matchedQualifications.map((match) => (
              <article key={match.qualification.id}>
                <span className="qualification-type">
                  {match.qualification.priority}
                </span>

                <h3>{match.qualification.title}</h3>

                <p>
                  <strong>Job Requirement:</strong>{' '}
                  {match.qualification.jobEvidence}
                </p>

                <p>
                  <strong>Resume Evidence:</strong> {match.resumeEvidence}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="matching-result-card panel">
          <h2>Qualification Gaps</h2>

          <div className="qualification-list">
            {result.qualificationGaps.map((gap) => (
              <article key={gap.qualification.id}>
                <span className="qualification-type">
                  {gap.qualification.priority}
                </span>

                <h3>{gap.qualification.title}</h3>

                <p>
                  <strong>Job Requirement:</strong>{' '}
                  {gap.qualification.jobEvidence}
                </p>

                <p>
                  <strong>Gap:</strong> {gap.reason}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>

      <p className="matching-disclaimer">
        These results show resume-to-job alignment only and do not predict
        hiring outcomes.
      </p>

      <div className="matching-actions">
        <button
          className="button button-primary"
          type="button"
          onClick={onRunNewComparison}
        >
          Run New Comparison
        </button>

        <button className="button" type="button" onClick={onBack}>
          Back to Comparisons
        </button>
      </div>
    </section>
  );
}