import { useId } from 'react';

export function DeleteVersionConfirm({
  versionName,
  className = '',
  onCancel,
  onConfirm,
}: {
  versionName: string;
  className?: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const titleId = useId();
  return (
    <section className={`resume-confirm ${className}`} aria-labelledby={titleId}>
      <p id={titleId} className="resume-confirm-question">
        Delete “{versionName}”?
      </p>
      <p>This removes the file and everything parsed from it. It cannot be undone.</p>
      <div className="resume-confirm-actions">
        <button type="button" className="button" autoFocus onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="button button-danger" onClick={onConfirm}>
          Delete version
        </button>
      </div>
    </section>
  );
}
