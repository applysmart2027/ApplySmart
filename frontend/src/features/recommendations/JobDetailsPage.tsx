import { Link, useParams } from 'react-router';
import { sampleRecommendations } from './sampleData';
import './recommendations.css';

export function JobDetailsPage() {
  const { jobId } = useParams();

  const job = sampleRecommendations.find(
    (recommendation) => recommendation.id === jobId,
  );

  if (!job) {
    return (
      <section className="recommendations-page">
        <div className="empty-state panel">
          <h1>Job not found</h1>
          <p>The selected recommendation could not be found.</p>

          <Link className="button" to="/recommendations">
            Back to Recommended Jobs
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="recommendations-page">
      <div className="secondary-page-header">
        <Link className="text-link" to="/recommendations">
          Back to Recommended Jobs
        </Link>

        <h1>{job.title}</h1>

        <p className="page-intro">
          {job.company} · {job.location}
        </p>
      </div>

      <div className="job-details panel">
        <div className="job-details-section">
          <h2>Job Information</h2>

          <div className="recommendation-tags">
            <span>{job.workType}</span>
            <span>{job.experienceLevel}</span>
            <span>{job.industry}</span>
          </div>
        </div>

        <div className="job-details-section">
          <h2>Description</h2>
          <p>{job.description}</p>
        </div>

        <div className="job-details-section">
          <h2>Responsibilities</h2>

          <ul>
            {job.responsibilities.map((responsibility) => (
              <li key={responsibility}>{responsibility}</li>
            ))}
          </ul>
        </div>

        <div className="job-details-section">
          <h2>About {job.company}</h2>
          <p>{job.companyAbout}</p>
        </div>
      </div>
    </section>
  );
}