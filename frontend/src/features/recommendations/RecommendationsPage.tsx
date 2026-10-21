import { useState } from 'react';
import { Link } from 'react-router';
import { sampleRecommendations } from './sampleData';
import './recommendations.css';

export function RecommendationsPage() {
  const [search, setSearch] = useState('');

  const searchText = search.trim().toLowerCase();

  const filteredRecommendations = sampleRecommendations.filter((job) =>
  [
    job.title,
    job.company,
    job.location,
    job.industry,
    job.workType,
    job.experienceLevel,
  ].some((value) => value.toLowerCase().includes(searchText)),
  );

  return (
    <section className="recommendations-page">
      <div className="recommendations-top-nav">
        <Link
          className="recommendations-tab active"
          to="/recommendations">
          Recommended Jobs</Link>

        <Link
          className="recommendations-tab"
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
          <h1>Recommended Jobs</h1>
          <p className="page-intro">
            Job recommendations based on your profile and preferences.
          </p>
        </div>

        <div className="page-header-actions">
          <Link
            className="button button-primary"
            to="/recommendations/preferences"
          >
            Edit Preferences
          </Link>
        </div>
      </div>

      <div className="recommendations-search">
        <label className="field">
          Search jobs
          <input
            type="search"
            placeholder="Search job title or keyword"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </div>

      <div className="recommendation-list">
        {filteredRecommendations.length === 0 ? (
          <div className="empty-state panel">
            <h2>No recommended jobs found</h2>
            <p>
              Try changing your search or recommendation preferences.
            </p>
          </div>
        ) : (
          filteredRecommendations.map((job) => (
            <article
              className="recommendation-card panel"
              key={job.id}
            >
              <div className="recommendation-logo">
                {job.company.charAt(0)}
              </div>

              <div className="recommendation-content">
                <h2>{job.title}</h2>

                <p className="recommendation-company">
                  {job.company}
                </p>

                <p className="recommendation-location">
                  <img className="location-icon" src="/geo-alt-fill.svg" alt="" aria-hidden="true"/>
                  {job.location}
                </p>

                <div className="recommendation-tags">
                  <span>{job.workType}</span>
                  <span>{job.experienceLevel}</span>
                  <span>{job.industry}</span>
                </div>
              </div>

              <Link
                className="button"
                to={`/recommendations/job/${job.id}`}
              >
                View Details
              </Link>
            </article>
          ))
        )}
      </div>
    </section>
  );
}