import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { PageHeader } from '../../shared/ui/PageHeader';
import { DeleteVersionConfirm } from './DeleteVersionConfirm';
import { formatUploaded } from './format';
import { ParseStatusBadge } from './ParseStatusBadge';
import { RowMenu, type RowMenuItem } from './RowMenu';
import { useResumes } from './store';
import { emptySections, RESUME_VERSION_LIMIT, type ParseStatus, type ResumeVersion } from './types';
import { UploadResumeDialog } from './UploadResumeDialog';
import './resumes.css';

// The main action for each parse status. Processing has none until parsing finishes.
const statusActions: Partial<
  Record<ParseStatus, { verb: string; suffix: string; primary: boolean }>
> = {
  Confirmed: { verb: 'View', suffix: '', primary: false },
  'Needs review': { verb: 'Review', suffix: '/review', primary: true },
  Failed: { verb: 'Resolve', suffix: '/resolve', primary: true },
};

// Other resume screens send a message here in navigation state after they change the list.
export type ResumesPageState = { announcement: string } | null;

export function ResumesPage() {
  const { resumes, dispatch } = useResumes();
  const location = useLocation();
  const [pendingDelete, setPendingDelete] = useState<ResumeVersion | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [uploading, setUploading] = useState(false);
  const atLimit = resumes.length >= RESUME_VERSION_LIMIT;

  // A message sent by another screen shows until this page has one of its own. The shell moves
  // focus to the top of main after navigating, so screen readers reach it first.
  const shownAnnouncement =
    announcement || (location.state as ResumesPageState)?.announcement || '';

  function makePrimary(resume: ResumeVersion) {
    dispatch({ type: 'madePrimary', id: resume.id });
    setAnnouncement(`${resume.versionName} is now your primary resume.`);
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    dispatch({ type: 'removed', id: pendingDelete.id });
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

  // New uploads start parsing straight away, so they join the list as Processing.
  function addUpload({ versionName, uploaded }: { versionName: string; uploaded: string }) {
    dispatch({
      type: 'created',
      resume: {
        id: crypto.randomUUID(),
        versionName,
        parseStatus: 'Processing',
        isPrimary: false,
        uploaded,
        parseAttempts: 1,
        failureReason: '',
        sections: emptySections(),
      },
    });
    setAnnouncement(`${versionName} was uploaded. Parsing has started.`);
  }

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
        <button
          type="button"
          className="button button-primary"
          disabled={atLimit}
          onClick={() => setUploading(true)}
        >
          <span aria-hidden="true" className="button-icon">
            +
          </span>
          Upload resume
        </button>
      </PageHeader>

      {uploading && (
        <UploadResumeDialog
          existingNames={resumes.map((r) => r.versionName)}
          onUpload={addUpload}
          onClose={() => setUploading(false)}
        />
      )}

      <p role="status" className="visually-hidden">
        {shownAnnouncement}
      </p>

      {pendingDelete && (
        <DeleteVersionConfirm
          versionName={pendingDelete.versionName}
          className="panel resume-confirm-panel"
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
        />
      )}

      {resumes.length === 0 ? (
        <div className="panel empty-state">
          <p>You have not uploaded a resume yet.</p>
          <button
            type="button"
            className="text-link link-button"
            onClick={() => setUploading(true)}
          >
            Upload your first resume
          </button>
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
                        <ParseStatusBadge status={r.parseStatus} />
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
