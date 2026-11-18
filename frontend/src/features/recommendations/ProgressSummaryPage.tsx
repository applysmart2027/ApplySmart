import { Link } from 'react-router';
import { sampleProgressMetrics, sampleRecentApplications } from './sampleData';
import './recommendations.css';

export function ProgressSummaryPage() {
  return (
    <section className="recommendations-page">
      <div className="recommendations-top-nav">
        <Link className="recommendations-tab" to="/recommendations">
          Recommended Jobs
        </Link>

        <Link
          className="recommendations-tab active"
          to="/recommendations/summary"
        >
          Progress Summary
        </Link>

        <Link
          className="recommendations-tab"
          to="/recommendations/reminders"
        >
          Reminders & Follow-ups
        </Link>
      </div>

      <div className="page-header">
        <div>
          <h1>Application Progress Summary</h1>
          <p className="page-intro">
            Review your job search activity and recent application progress.
          </p>
        </div>

        <div className="page-header-actions">
          <button
            className="button button-primary"
            type="button"
            onClick={() => window.print()}
          >
            Download PDF
          </button>
        </div>
      </div>

      <div className="progress-metrics">
        <div className="progress-metric panel">
          <span>Applications</span>
          <strong>{sampleProgressMetrics.applications}</strong>
        </div>

        <div className="progress-metric panel">
          <span>Interviews</span>
          <strong>{sampleProgressMetrics.interviews}</strong>
        </div>

        <div className="progress-metric panel">
          <span>Offers</span>
          <strong>{sampleProgressMetrics.offers}</strong>
        </div>

        <div className="progress-metric panel">
          <span>In Progress</span>
          <strong>{sampleProgressMetrics.inProgress}</strong>
        </div>

        <div className="progress-metric panel">
          <span>Offer Rate</span>
          <strong>{sampleProgressMetrics.offerRate}%</strong>
        </div>
      </div>

      <div className="progress-summary-grid">
        <section className="panel progress-section">
          <h2>Applications by Month</h2>

          <div className="progress-bars">
            <div className="progress-bar-row">
              <span>August</span>
              <div className="progress-bar-track">
                <div
                  className="progress-bar-fill"
                  style={{ width: '45%' }}
                />
              </div>
              <strong>9</strong>
            </div>

            <div className="progress-bar-row">
              <span>September</span>
              <div className="progress-bar-track">
                <div
                  className="progress-bar-fill"
                  style={{ width: '70%' }}
                />
              </div>
              <strong>14</strong>
            </div>

            <div className="progress-bar-row">
              <span>October</span>
              <div className="progress-bar-track">
                <div
                  className="progress-bar-fill"
                  style={{ width: '55%' }}
                />
              </div>
              <strong>11</strong>
            </div>
          </div>
        </section>

        <section className="panel progress-section">
          <h2>Top Industries</h2>

          <div className="progress-industry-list">
            <div>
              <span>Software</span>
              <strong>12</strong>
            </div>

            <div>
              <span>Technology</span>
              <strong>10</strong>
            </div>

            <div>
              <span>IT</span>
              <strong>7</strong>
            </div>

            <div>
              <span>Other</span>
              <strong>5</strong>
            </div>
          </div>
        </section>
      </div>

      <section className="panel progress-section">
        <h2>Recent Applications</h2>

        <div className="recent-applications">
          {sampleRecentApplications.map((application) => (
            <div
              className="recent-application-row"
              key={application.id}
            >
              <div>
                <strong>{application.jobTitle}</strong>
                <p>{application.company}</p>
              </div>

              <span className="application-status">
                {application.status}
              </span>

              <span className="recent-application-date">
                {application.date}
              </span>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}