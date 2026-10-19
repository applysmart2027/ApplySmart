import type { ChangeEventHandler } from 'react';
import type { ApplicationDraft } from './types';

export function TextField({
  name,
  label,
  type = 'text',
  value,
  error,
  onChange,
}: {
  name: keyof ApplicationDraft;
  label: string;
  type?: string;
  value: string;
  error?: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
}) {
  const errorId = `${name}-error`;
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
      />
      {error && (
        <p id={errorId} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}
