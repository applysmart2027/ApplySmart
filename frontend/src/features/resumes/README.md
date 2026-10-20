# Resumes

Resume Management and Parsing (SCRUM-277).

## Routes

| Path       | Screen                      |
| ---------- | --------------------------- |
| `/resumes` | My Resumes list of versions |

The list links to `/resumes/upload`, `/resumes/:id`, `/resumes/:id/review` and `/resumes/:id/resolve`. Those screens are not built yet and show Page not found.

## Code

`ResumesPage.tsx` keeps the versions in local state, seeded from `sampleData.ts`, until the feature has a provider. Each parse status maps to one main action: Confirmed views, Needs review reviews, Failed resolves, and Processing has none. The row menu (`RowMenu.tsx`) offers Set as primary, for confirmed versions only, and Delete, which asks for confirmation first. A student can keep up to `RESUME_VERSION_LIMIT` (10) versions; at the limit the upload button is disabled. Upload dates are `YYYY-MM-DD` strings that `format.ts` shows in UTC.

## Tests

`ResumesPage.test.tsx` covers the table, the actions for each status, the row menu, deleting, the version limit and the empty state. Run them with `npm test` from `frontend/`.
