import { useState, type ReactNode } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router';
import { PageHeader } from '../../shared/ui/PageHeader';
import { DeleteVersionConfirm } from './DeleteVersionConfirm';
import { ParseStatusBadge } from './ParseStatusBadge';
import type { ResumesPageState } from './ResumesPage';
import { ResumeUnavailable } from './ResumeUnavailable';
import { useResume, useResumes } from './store';
import { emptySections, MAX_PARSE_ATTEMPTS, type ResumeVersion } from './types';
import { UploadResumeDialog } from './UploadResumeDialog';
import './resumes.css';

function Option({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="panel resolve-option" aria-label={title}>
      <h2>{title}</h2>
      <p className="resolve-option-text">{description}</p>
      {children}
    </section>
  );
}

export function ResolveResumePage() {
  const { id } = useParams();
  const resume = useResume(id);

  if (!resume) return <ResumeUnavailable reason="not-found" />;
  if (resume.parseStatus !== 'Failed') return <ResumeUnavailable reason="not-failed" />;
  return <ResolveFailedResume resume={resume} />;
}

// Prototype shortcut: /resumes/resolve opens the page for the first failed version, so it can
// be shown without going through the list.
export function ResolveFirstFailedResume() {
  const failed = useResumes().resumes.find((r) => r.parseStatus === 'Failed');
  if (!failed) return <ResumeUnavailable reason="not-failed" />;
  return <Navigate to={`/resumes/${failed.id}/resolve`} replace />;
}

function ResolveFailedResume({ resume }: { resume: ResumeVersion }) {
  const { resumes, dispatch } = useResumes();
  const navigate = useNavigate();
  const [replacing, setReplacing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const canRetry = resume.parseAttempts < MAX_PARSE_ATTEMPTS;

  function backToList(announcement: string) {
    navigate('/resumes', { state: { announcement } satisfies ResumesPageState });
  }

  function retry() {
    dispatch({
      type: 'updated',
      resume: {
        ...resume,
        parseStatus: 'Processing',
        parseAttempts: resume.parseAttempts + 1,
        failureReason: '',
      },
    });
    backToList(`${resume.versionName} was sent to be read again.`);
  }

  // A replacement file starts its own count of parse attempts.
  function replace({ versionName, uploaded }: { versionName: string; uploaded: string }) {
    dispatch({
      type: 'updated',
      resume: {
        ...resume,
        versionName,
        uploaded,
        parseStatus: 'Processing',
        parseAttempts: 1,
        failureReason: '',
        sections: emptySections(),
      },
    });
    backToList(`${versionName} was replaced. Parsing has started.`);
  }

  function remove() {
    dispatch({ type: 'removed', id: resume.id });
    backToList(`${resume.versionName} was deleted.`);
  }

  return (
    <>
      <Link to="/resumes" className="text-link resume-back">
        Back to My Resumes
      </Link>
      <PageHeader
        title={`Resolve failed upload – ${resume.versionName}`}
        status={<ParseStatusBadge status={resume.parseStatus} />}
      />

      <div className="notice-error resolve-notice">
        <p className="resolve-notice-title">
          <span aria-hidden="true">⚠ </span>We couldn’t read this resume.
        </p>
        <p>
          Reason: {resume.failureReason || 'parsing could not finish.'} Attempt{' '}
          {resume.parseAttempts} of {MAX_PARSE_ATTEMPTS}.
          {!canRetry && ' Retry is no longer available for this file.'}
        </p>
      </div>

      <div className="resolve-options">
        {canRetry && (
          <Option title="Retry parsing" description="Send the same file to be read again.">
            <button type="button" className="button button-primary" onClick={retry}>
              Retry
            </button>
          </Option>
        )}
        <Option
          title="Enter manually"
          description="Type your sections yourself beside the original file."
        >
          <Link to={`/resumes/${resume.id}/manual`} className="button">
            Enter manually
          </Link>
        </Option>
        <Option title="Upload a replacement" description="Choose a DOCX or text-based PDF instead.">
          <button type="button" className="button" onClick={() => setReplacing(true)}>
            Upload new file
          </button>
        </Option>
        <Option
          title="Delete this version"
          description="Remove the file and everything parsed from it."
        >
          {confirmingDelete ? (
            <DeleteVersionConfirm
              versionName={resume.versionName}
              onCancel={() => setConfirmingDelete(false)}
              onConfirm={remove}
            />
          ) : (
            <button type="button" className="button" onClick={() => setConfirmingDelete(true)}>
              Delete
            </button>
          )}
        </Option>
      </div>

      {replacing && (
        <UploadResumeDialog
          title="Upload a replacement"
          initialName={resume.versionName}
          existingNames={resumes.filter((r) => r.id !== resume.id).map((r) => r.versionName)}
          onUpload={replace}
          onClose={() => setReplacing(false)}
        />
      )}
    </>
  );
}
