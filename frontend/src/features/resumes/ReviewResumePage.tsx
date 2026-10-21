import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { PageHeader } from '../../shared/ui/PageHeader';
import { EditSectionDialog } from './EditSectionDialog';
import { ParseStatusBadge } from './ParseStatusBadge';
import type { ResumesPageState } from './ResumesPage';
import { ResumeUnavailable } from './ResumeUnavailable';
import { countEntriesWithErrors } from './sectionValidation';
import { useResume, useResumes } from './store';
import {
  SECTION_NAMES,
  type ParsedSections,
  type ResumeVersion,
  type SectionEntry,
  type SectionName,
} from './types';
import './resumes.css';

function dateRange({ startDate, endDate }: SectionEntry) {
  return [startDate, endDate].filter(Boolean).join(' – ');
}

export function ReviewResumePage() {
  const { id } = useParams();
  const resume = useResume(id);

  if (!resume) return <ResumeUnavailable reason="not-found" />;
  if (resume.parseStatus !== 'Needs review') return <ResumeUnavailable reason="not-reviewable" />;
  return <ReviewParsedResume resume={resume} />;
}

function ReviewParsedResume({ resume }: { resume: ResumeVersion }) {
  const { dispatch } = useResumes();
  const navigate = useNavigate();
  const [editing, setEditing] = useState<SectionName | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [blocked, setBlocked] = useState(false);
  const problems = SECTION_NAMES.reduce(
    (sum, s) => sum + countEntriesWithErrors(resume.sections[s], s),
    0,
  );

  function save(section: SectionName, sections: ParsedSections) {
    dispatch({ type: 'updated', resume: { ...resume, sections } });
    setAnnouncement(`${section} saved.`);
    setBlocked(false);
  }

  function confirm() {
    if (problems > 0) {
      setBlocked(true);
      return;
    }
    dispatch({ type: 'updated', resume: { ...resume, parseStatus: 'Confirmed' } });
    navigate('/resumes', {
      state: { announcement: `${resume.versionName} is confirmed.` } satisfies ResumesPageState,
    });
  }

  return (
    <>
      <Link to="/resumes" className="text-link resume-back">
        Back to My Resumes
      </Link>
      <PageHeader
        title={`Review parsed resume – ${resume.versionName}`}
        status={<ParseStatusBadge status={resume.parseStatus} />}
        subtitle="Check what was read from your file and fix anything that is wrong, then confirm."
      />

      <p role="status" className="visually-hidden">
        {announcement}
      </p>

      {blocked && problems > 0 && (
        <p className="notice-error review-blocked" role="alert">
          Fix the entries marked below before confirming this resume.
        </p>
      )}

      <div className="review-sections">
        {SECTION_NAMES.map((section) => {
          const entries = resume.sections[section];
          const bad = countEntriesWithErrors(entries, section);
          return (
            <section
              key={section}
              className="panel review-section"
              aria-labelledby={`review-${section}`}
            >
              <div className="review-section-header">
                <h2 id={`review-${section}`}>{section}</h2>
                <button
                  type="button"
                  className="button"
                  aria-label={`Edit ${section}`}
                  onClick={() => setEditing(section)}
                >
                  Edit
                </button>
              </div>
              {bad > 0 && (
                <p className="review-problem">
                  <span aria-hidden="true">⚠ </span>
                  {bad === 1 ? '1 entry needs fixing.' : `${bad} entries need fixing.`}
                </p>
              )}
              {entries.length === 0 ? (
                <p className="upload-muted">Nothing was found for this section.</p>
              ) : (
                <ul className="review-entries">
                  {entries.map((entry) => (
                    <li key={entry.id}>
                      <p className="review-entry-title">
                        {entry.title || 'Untitled'}
                        {entry.organization && ` · ${entry.organization}`}
                      </p>
                      {dateRange(entry) && <p className="upload-muted">{dateRange(entry)}</p>}
                      {entry.details && <p>{entry.details}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>

      <div className="review-actions">
        <p className="upload-muted">Confirming marks this version ready for matching.</p>
        <button type="button" className="button button-primary" onClick={confirm}>
          Confirm resume
        </button>
      </div>

      {editing && (
        <EditSectionDialog
          section={editing}
          sections={resume.sections}
          onSave={(sections) => save(editing, sections)}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
