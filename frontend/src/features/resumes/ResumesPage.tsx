import { useState } from 'react';
import { Link } from 'react-router';
import { PageHeader } from '../../shared/ui/PageHeader';
import { formatUploaded } from './format';
import { RowMenu, type RowMenuItem } from './RowMenu';
import { sampleResumeVersions } from './sampleData';
import { RESUME_VERSION_LIMIT, type ParseStatus, type ResumeVersion } from './types';
import './resumes.css';

// The main action for each parse status. Processing has none until parsing finishes.
const statusActions: Partial<
  Record<ParseStatus, { verb: string; suffix: string; primary: boolean }>
> = {
  Confirmed: { verb: 'View', suffix: '', primary: false },
  'Needs review': { verb: 'Review', suffix: '/review', primary: true },
  Failed: { verb: 'Resolve', suffix: '/resolve', primary: true },
};

const statusClasses: Record<ParseStatus, string> = {
  Processing: 'parse-status-processing',
  'Needs review': 'parse-status-review',
  Confirmed: 'parse-status-confirmed',
  Failed: 'parse-status-failed',
};

export function ResumesPage({
  initialResumes = sampleResumeVersions,
}: {
  initialResumes?: ResumeVersion[];
}) {
  const [resumes, setResumes] = useState(initialResumes);
  const [pendingDelete, setPendingDelete] = useState<ResumeVersion | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const atLimit = resumes.length >= RESUME_VERSION_LIMIT;

  function makePrimary(resume: ResumeVersion) {
    setResumes(resumes.map((r) => ({ ...r, isPrimary: r.id === resume.id })));
    setAnnouncement(`${resume.versionName} is now your primary resume.`);
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    setResumes(resumes.filter((r) => r.id !== pendingDelete.id));
    setAnnouncement(`${pendingDelete.versionName} was deleted.`);
    setPendingDelete(null);
  }

  function menuItems(resume: ResumeVersion): RowMenuItem[] {
    const items: RowMenuItem[] = [];
    // Only a confirmed parse can be the primary resume used for matching.
    if (resume.parseStatus === 'Confirmed' && !resume.isPrimary) {
      items.push({ label: 'Set as primary', onSelect: () => makePrimary(resume) });
    }
    items.push({ label: 'Delete', onSelect: () => setPendingDelete(resume) });
    return items;
  }

  const uploadAction = atLimit ? (
    <button type="button" className="button button-primary" disabled>
      Upload resume
    </button>
  ) : (
    <Link to="/resumes/upload" className="button button-primary">
      <span aria-hidden="true" className="button-icon">
        +
      </span>
      Upload resume
    </Link>
  );

  return (
    <>
      <PageHeader
        title="My Resumes"
        subtitle={
          <>
            {resumes.length} of {RESUME_VERSION_LIMIT} resume versions used
            {atLimit && '. Delete a version to upload another.'}
          </>
        }
      >
        {uploadAction}
      </PageHeader>

      <p role="status" className="visually-hidden">
        {announcement}
      </p>

      {pendingDelete && (
        <section className="panel resume-confirm" aria-labelledby="resume-confirm-title">
          <p id="resume-confirm-title" className="resume-confirm-question">
            Delete “{pendingDelete.versionName}”?
          </p>
          <p>This removes the file and everything parsed from it. It cannot be undone.</p>
          <div className="resume-confirm-actions">
            <button
              type="button"
              className="button"
              autoFocus
              onClick={() => setPendingDelete(null)}
            >
              Cancel
            </button>
            <button type="button" className="button button-danger" onClick={confirmDelete}>
              Delete version
            </button>
          </div>
        </section>
      )}

      {resumes.length === 0 ? (
        <div className="panel empty-state">
          <p>You have not uploaded a resume yet.</p>
          <Link to="/resumes/upload" className="text-link">
            Upload your first resume
          </Link>
        </div>
      ) : (
        <>
          <div className="panel table-scroll resumes-table-scroll">
            <table className="records-table resumes-table">
              <thead>
                <tr>
                  <th scope="col">Version name</th>
                  <th scope="col">Parse status</th>
                  <th scope="col">Primary</th>
                  <th scope="col">Uploaded</th>
                  <th scope="col">Action</th>
                  <th scope="col">
                    <span className="visually-hidden">More actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {resumes.map((r) => {
                  const action = statusActions[r.parseStatus];
                  return (
                    <tr key={r.id}>
                      <td>{r.versionName}</td>
                      <td>
                        <span className={`parse-status ${statusClasses[r.parseStatus]}`}>
                          {r.parseStatus}
                        </span>
                      </td>
                      <td>
                        {r.isPrimary && (
                          <span className="resume-primary">
                            <span aria-hidden="true">★ </span>Primary
                          </span>
                        )}
                      </td>
                      <td>{formatUploaded(r.uploaded)}</td>
                      <td>
                        {action && (
                          <Link
                            to={`/resumes/${r.id}${action.suffix}`}
                            className={`button resume-action${action.primary ? ' button-primary' : ''}`}
                            aria-label={`${action.verb} ${r.versionName}`}
                          >
                            {action.verb}
                          </Link>
                        )}
                      </td>
                      <td>
                        <RowMenu label={`More actions for ${r.versionName}`} items={menuItems(r)} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="resume-legend">
            Parsing moves from Processing to Needs review to Confirmed. Failed means parsing could
            not finish.
          </p>
        </>
      )}
    </>
  );
}
