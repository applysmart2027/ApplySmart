import { useState } from 'react';
import { Link } from 'react-router';
import { PageHeader } from '../../shared/ui/PageHeader';
import { formatDeadline } from './format';
import { useApplications } from './store';
import { APPLICATION_STATUSES, type ApplicationRecord } from './types';
import './applications.css';

type Compare = (a: ApplicationRecord, b: ApplicationRecord) => number;

const sorts = {
  // Records without a deadline sort after every dated record.
  deadline: {
    label: 'Deadline, soonest first',
    compare: (a, b) => (a.deadline || '9999').localeCompare(b.deadline || '9999'),
  },
  employer: { label: 'Employer, A to Z', compare: (a, b) => a.employer.localeCompare(b.employer) },
  jobTitle: { label: 'Job title, A to Z', compare: (a, b) => a.jobTitle.localeCompare(b.jobTitle) },
} satisfies Record<string, { label: string; compare: Compare }>;

type SortKey = keyof typeof sorts;

const rowActions = [
  ['View', ''],
  ['Edit', '/edit'],
  ['Delete', '/delete'],
];

export function ApplicationsListPage() {
  const { records } = useApplications();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState<SortKey>('deadline');

  const search = query.trim().toLowerCase();
  const visible = records
    .filter(
      (r) =>
        (!status || r.status === status) &&
        (r.jobTitle.toLowerCase().includes(search) || r.employer.toLowerCase().includes(search)),
    )
    .sort(sorts[sort].compare);

  function clearFilters() {
    setQuery('');
    setStatus('');
  }

  return (
    <>
      <PageHeader title="Application Records">
        <Link to="/applications/new" className="button button-primary">
          New application
        </Link>
      </PageHeader>

      {records.length === 0 ? (
        <div className="panel empty-state">
          <p>You have no application records yet.</p>
          <Link to="/applications/new" className="text-link">
            Create your first application
          </Link>
        </div>
      ) : (
        <>
          <search className="toolbar">
            <label className="field">
              Search
              <input
                type="search"
                value={query}
                placeholder="Job title or employer"
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <label className="field">
              Status
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">All statuses</option>
                {APPLICATION_STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="field">
              Sort by
              <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
                {Object.entries(sorts).map(([key, option]) => (
                  <option key={key} value={key}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </search>

          {visible.length === 0 ? (
            <div className="panel empty-state">
              <p>No applications match your search.</p>
              <button type="button" className="button" onClick={clearFilters}>
                Clear search and filters
              </button>
            </div>
          ) : (
            <div className="panel table-scroll">
              <table className="records-table">
                <thead>
                  <tr>
                    <th scope="col">Job title</th>
                    <th scope="col">Employer</th>
                    <th scope="col">Status</th>
                    <th scope="col">Deadline</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((r) => {
                    const record = `${r.jobTitle} at ${r.employer}`;
                    return (
                      <tr key={r.id}>
                        <td>{r.jobTitle}</td>
                        <td>{r.employer}</td>
                        <td>
                          <span className="status">{r.status}</span>
                        </td>
                        <td>{formatDeadline(r.deadline)}</td>
                        <td className="row-actions">
                          {rowActions.map(([verb, suffix]) => (
                            <Link
                              key={verb}
                              to={`/applications/${r.id}${suffix}`}
                              className="text-link"
                              aria-label={`${verb} ${record}`}
                            >
                              {verb}
                            </Link>
                          ))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </>
  );
}
