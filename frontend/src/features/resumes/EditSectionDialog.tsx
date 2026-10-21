import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { flushSync } from 'react-dom';
import { RowMenu, type RowMenuItem } from './RowMenu';
import { hasErrors, validateEntry, type EntryErrors, type EntryField } from './sectionValidation';
import {
  SECTION_FIELDS,
  SECTION_NAMES,
  type ParsedSections,
  type SectionEntry,
  type SectionName,
} from './types';

// A move is only applied on Save, so Cancel can still undo it.
type DraftEntry = SectionEntry & { moveTo: SectionName | null };

const FIELD_ORDER: EntryField[] = ['title', 'organization', 'startDate', 'endDate'];

function toEntry({ id, title, organization, startDate, endDate, details }: DraftEntry) {
  return { id, title, organization, startDate, endDate, details };
}

function validateAll(entries: DraftEntry[], section: SectionName) {
  const found: Record<string, EntryErrors> = {};
  for (const entry of entries) {
    const errors = validateEntry(entry, section);
    if (hasErrors(errors)) found[entry.id] = errors;
  }
  return found;
}

function EntryInput({
  id,
  label,
  value,
  error,
  required = false,
  multiline = false,
  className = '',
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  error?: string;
  required?: boolean;
  multiline?: boolean;
  className?: string;
  onChange: (value: string) => void;
}) {
  const errorId = `${id}-error`;
  const shared = {
    id,
    value,
    required,
    'aria-invalid': Boolean(error),
    'aria-describedby': error ? errorId : undefined,
  };
  return (
    <div className={`field ${className}`}>
      <label htmlFor={id}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {multiline ? (
        <textarea {...shared} rows={3} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input {...shared} onChange={(e) => onChange(e.target.value)} />
      )}
      {error && (
        <p id={errorId} className="field-error">
          <span aria-hidden="true">⚠ </span>
          {error}
        </p>
      )}
    </div>
  );
}

export function EditSectionDialog({
  section,
  sections,
  onSave,
  onClose,
}: {
  section: SectionName;
  sections: ParsedSections;
  onSave: (sections: ParsedSections) => void;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const addButton = useRef<HTMLButtonElement>(null);
  const [entries, setEntries] = useState<DraftEntry[]>(() =>
    sections[section].map((entry) => ({ ...entry, moveTo: null })),
  );
  const [errors, setErrors] = useState<Record<string, EntryErrors>>({});
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const idPrefix = useId();
  const labels = SECTION_FIELDS[section];
  const fieldId = (entryId: string, field: string) => `${idPrefix}-${entryId}-${field}`;

  useEffect(() => {
    if (!dialog.current?.open) dialog.current?.showModal();
  }, []);

  function close() {
    dialog.current?.close();
  }

  // After a failed Save, errors follow each change so a fixed field clears straight away.
  function change(next: DraftEntry[]) {
    setEntries(next);
    if (submitted) setErrors(validateAll(next, section));
  }

  function update(id: string, field: keyof SectionEntry, value: string) {
    change(entries.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  }

  function setMove(id: string, moveTo: SectionName | null, number: number) {
    change(entries.map((e) => (e.id === id ? { ...e, moveTo } : e)));
    setMessage(
      moveTo
        ? `Entry ${number} will move to ${moveTo} when you save.`
        : `Entry ${number} will stay in ${section}.`,
    );
  }

  function remove(id: string, number: number) {
    change(entries.filter((e) => e.id !== id));
    setMessage(`Entry ${number} removed.`);
    addButton.current?.focus();
  }

  function addEntry() {
    const id = crypto.randomUUID();
    const blank = { id, title: '', organization: '', startDate: '', endDate: '', details: '' };
    flushSync(() => change([...entries, { ...blank, moveTo: null }]));
    document.getElementById(fieldId(id, 'title'))?.focus();
  }

  function save(event: FormEvent) {
    event.preventDefault();
    const found = validateAll(entries, section);
    flushSync(() => {
      setSubmitted(true);
      setErrors(found);
    });
    const firstBad = entries.find((e) => found[e.id]);
    if (firstBad) {
      const field = FIELD_ORDER.find((f) => found[firstBad.id][f]);
      document.getElementById(fieldId(firstBad.id, field ?? 'title'))?.focus();
      return;
    }
    const next = { ...sections, [section]: entries.filter((e) => !e.moveTo).map(toEntry) };
    for (const entry of entries) {
      if (entry.moveTo) next[entry.moveTo] = [...next[entry.moveTo], toEntry(entry)];
    }
    onSave(next);
    close();
  }

  function moveItems(entry: DraftEntry, number: number): RowMenuItem[] {
    const items: RowMenuItem[] = SECTION_NAMES.filter(
      (s) => s !== section && s !== entry.moveTo,
    ).map((s) => ({ label: s, onSelect: () => setMove(entry.id, s, number) }));
    if (entry.moveTo) {
      items.push({ label: `Keep in ${section}`, onSelect: () => setMove(entry.id, null, number) });
    }
    return items;
  }

  return (
    <dialog
      ref={dialog}
      className="resume-dialog section-dialog"
      aria-labelledby={`${idPrefix}-title`}
      onClose={onClose}
    >
      <form className="upload-form" onSubmit={save} noValidate>
        <div className="resume-dialog-header">
          <h2 id={`${idPrefix}-title`}>Edit section: {section}</h2>
          <button type="button" className="resume-dialog-close" aria-label="Close" onClick={close}>
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <p role="status" className="visually-hidden">
          {message}
        </p>

        {entries.length === 0 && <p className="upload-muted">No entries in this section yet.</p>}

        {entries.map((entry, index) => {
          const number = index + 1;
          const entryErrors = errors[entry.id] ?? {};
          return (
            <section
              key={entry.id}
              className="section-entry"
              aria-labelledby={fieldId(entry.id, 'heading')}
            >
              <div className="section-entry-header">
                <h3 id={fieldId(entry.id, 'heading')}>Entry {number}</h3>
                {entry.moveTo && (
                  <span className="section-entry-note">Moves to {entry.moveTo} when you save</span>
                )}
                <RowMenu
                  items={moveItems(entry, number)}
                  toggleClassName="link-button section-entry-move"
                >
                  Move to section<span className="visually-hidden">, entry {number}</span>{' '}
                  <span aria-hidden="true">▾</span>
                </RowMenu>
                <button
                  type="button"
                  className="link-button section-entry-remove"
                  onClick={() => remove(entry.id, number)}
                >
                  Remove <span className="visually-hidden">entry {number}</span>
                </button>
              </div>

              <div className="section-entry-fields">
                <EntryInput
                  id={fieldId(entry.id, 'title')}
                  label={labels.title}
                  value={entry.title}
                  error={entryErrors.title}
                  required
                  onChange={(v) => update(entry.id, 'title', v)}
                />
                <EntryInput
                  id={fieldId(entry.id, 'organization')}
                  label={labels.organization}
                  value={entry.organization}
                  error={entryErrors.organization}
                  required
                  onChange={(v) => update(entry.id, 'organization', v)}
                />
                <div className="section-entry-dates">
                  <EntryInput
                    id={fieldId(entry.id, 'startDate')}
                    label="Start date"
                    value={entry.startDate}
                    error={entryErrors.startDate}
                    onChange={(v) => update(entry.id, 'startDate', v)}
                  />
                  <EntryInput
                    id={fieldId(entry.id, 'endDate')}
                    label="End date"
                    value={entry.endDate}
                    error={entryErrors.endDate}
                    onChange={(v) => update(entry.id, 'endDate', v)}
                  />
                </div>
                <EntryInput
                  id={fieldId(entry.id, 'details')}
                  label="Details"
                  value={entry.details}
                  multiline
                  onChange={(v) => update(entry.id, 'details', v)}
                />
              </div>
            </section>
          );
        })}

        <div>
          <button
            ref={addButton}
            type="button"
            className="link-button section-add"
            onClick={addEntry}
          >
            <span aria-hidden="true">+ </span>Add entry
          </button>
        </div>

        <div className="upload-actions">
          <button type="button" className="button" onClick={close}>
            Cancel
          </button>
          <button type="submit" className="button button-primary section-save">
            Save
          </button>
        </div>
      </form>
    </dialog>
  );
}
