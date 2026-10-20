import { useId, useRef, useState, type FocusEvent, type KeyboardEvent } from 'react';

export type RowMenuItem = { label: string; onSelect: () => void };

// A disclosure button that shows extra row actions. It closes on Escape, when focus
// leaves it, and after an action runs.
export function RowMenu({ label, items }: { label: string; items: RowMenuItem[] }) {
  const [open, setOpen] = useState(false);
  const listId = useId();
  const toggle = useRef<HTMLButtonElement>(null);

  function closeOnEscape(event: KeyboardEvent) {
    if (event.key !== 'Escape' || !open) return;
    setOpen(false);
    toggle.current?.focus();
  }

  function closeOnFocusOut(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }

  return (
    <div className="row-menu" onKeyDown={closeOnEscape} onBlur={closeOnFocusOut}>
      <button
        ref={toggle}
        type="button"
        className="row-menu-toggle"
        aria-label={label}
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => setOpen(!open)}
      >
        <span aria-hidden="true">⋮</span>
      </button>
      {open && (
        <ul id={listId} className="row-menu-list">
          {items.map((item) => (
            <li key={item.label}>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  item.onSelect();
                }}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
