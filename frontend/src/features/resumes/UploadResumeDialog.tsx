import { useEffect, useId, useRef, useState, type DragEvent, type FormEvent } from 'react';
import { formatFileSize, todayIso } from './format';
import { defaultVersionName, fileProblem, type Problem } from './uploadValidation';

export function UploadResumeDialog({
  title = 'Upload resume',
  initialName = '',
  existingNames,
  onUpload,
  onClose,
}: {
  title?: string;
  initialName?: string;
  existingNames: string[];
  onUpload: (upload: { versionName: string; file: File; uploaded: string }) => void;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [versionName, setVersionName] = useState(initialName);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [dragging, setDragging] = useState(false);
  const hintId = useId();
  const nameId = useId();
  const nameHintId = useId();
  const errorId = useId();

  // Opening as a modal makes the page behind inert and, on close, returns focus to the
  // button that opened it.
  useEffect(() => {
    if (!dialog.current?.open) dialog.current?.showModal();
  }, []);

  function close() {
    dialog.current?.close();
  }

  function pick(picked: File | undefined) {
    if (!picked) return;
    setFile(picked);
    setProblem(fileProblem(picked));
  }

  function drop(event: DragEvent) {
    event.preventDefault();
    setDragging(false);
    pick(event.dataTransfer.files[0]);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!file) {
      setProblem({ field: 'file', message: 'Choose a PDF or DOCX file to upload.' });
      return;
    }
    const uploaded = todayIso();
    const name = versionName.trim() || defaultVersionName(file.name, uploaded);
    const taken = existingNames.some((n) => n.toLowerCase() === name.toLowerCase());
    const found =
      fileProblem(file) ??
      (taken
        ? { field: 'name' as const, message: `You already have a version named “${name}”.` }
        : null);
    setProblem(found);
    if (found) return;
    onUpload({ versionName: name, file, uploaded });
    close();
  }

  return (
    <dialog
      ref={dialog}
      className="resume-dialog"
      aria-labelledby="resume-dialog-title"
      onClose={onClose}
    >
      <form className="upload-form" onSubmit={submit} noValidate>
        <div className="resume-dialog-header">
          <h2 id="resume-dialog-title">{title}</h2>
          <button type="button" className="resume-dialog-close" aria-label="Close" onClick={close}>
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <div>
          <div
            className={`upload-dropzone${dragging ? ' upload-dropzone-active' : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={drop}
          >
            <p>Drag a PDF or DOCX file here</p>
            <p className="upload-muted">or</p>
            <button
              type="button"
              className="button"
              aria-describedby={hintId}
              onClick={() => fileInput.current?.click()}
            >
              Browse…
            </button>
            {/* The Browse button is the keyboard route to this input, so it stays out of the tab order. */}
            <input
              ref={fileInput}
              type="file"
              accept=".pdf,.docx"
              className="visually-hidden"
              tabIndex={-1}
              aria-label="Resume file"
              onChange={(e) => pick(e.target.files?.[0])}
            />
          </div>
          <p id={hintId} className="upload-muted upload-hint">
            Accepted: PDF, DOCX · Maximum size: 5 MB
          </p>
        </div>

        {file && (
          <p>
            Selected file: {file.name} ({formatFileSize(file.size)})
          </p>
        )}

        <div className="field">
          <label htmlFor={nameId}>Version name</label>
          <input
            id={nameId}
            value={versionName}
            aria-describedby={problem?.field === 'name' ? `${nameHintId} ${errorId}` : nameHintId}
            aria-invalid={problem?.field === 'name'}
            onChange={(e) => {
              setVersionName(e.target.value);
              if (problem?.field === 'name') setProblem(null);
            }}
          />
          <p id={nameHintId} className="upload-muted upload-hint">
            Leave blank to use the file name and today’s date.
          </p>
        </div>

        {problem && (
          <p id={errorId} className="notice-error upload-error" role="alert">
            <span aria-hidden="true">⚠ </span>
            {problem.message}
          </p>
        )}

        <div className="upload-actions">
          <button type="button" className="button" onClick={close}>
            Cancel
          </button>
          <button type="submit" className="button button-primary">
            Upload
          </button>
        </div>
      </form>
    </dialog>
  );
}
