import { Link } from 'react-router';
import { samplePreferences } from './sampleData';
import './recommendations.css';

export function RecommendationPreferencesPage() {
  return (
    <section className="recommendations-page">
      <div className="secondary-page-header">
        <Link className="text-link" to="/recommendations">
          Back to Recommended Jobs
        </Link>

        <h1>Recommendation Preferences</h1>

        <p className="page-intro">Set your preferences to get recommendations tailored to you.</p>
      </div>

      <form className="preferences-form panel">
        <fieldset className="preferences-group">
          <legend>Job Types</legend>

          <label>
            <input
              type="checkbox"
              defaultChecked={samplePreferences.jobTypes.includes('Full Time')}/>
            Full Time
          </label>

          <label>
            <input
              type="checkbox"
              defaultChecked={samplePreferences.jobTypes.includes('Co-op')}
            />
            Co-op
          </label>

          <label>
            <input
              type="checkbox"
              defaultChecked={samplePreferences.jobTypes.includes('Internship')}
            />
            Internship
          </label>

          <label>
            <input type="checkbox" />
            Part-Time
          </label>

          <label>
            <input type="checkbox" />
            Contract
          </label>

          <label>
            <input type="checkbox" />
            Remote
          </label>
        </fieldset>

        <div className="field">
          <label htmlFor="locations">Locations</label>

          <input
            id="locations"
            type="text"
            defaultValue={samplePreferences.locations.join(', ')}
          />
        </div>

        <div className="field">
          <label htmlFor="industries">Industries</label>

          <input
            id="industries"
            type="text"
            defaultValue={samplePreferences.industries.join(', ')}
          />
        </div>

        <fieldset className="preferences-group">
          <legend>Experience Level</legend>

          <label>
            <input
              type="checkbox"
              defaultChecked={samplePreferences.experienceLevels.includes(
                'Entry Level',
              )}
            />
            Entry Level
          </label>

          <label>
            <input type="checkbox" />
            Junior
          </label>

          <label>
            <input type="checkbox" />
            Senior
          </label>
        </fieldset>

        <div className="preferences-actions">
          <Link className="button" to="/recommendations">
            Cancel
          </Link>

          <Link className="button button-primary" to="/recommendations">
            Save
          </Link>
        </div>
      </form>
    </section>
  );
}