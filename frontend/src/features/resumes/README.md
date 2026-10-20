# Resumes

Resume Management and Parsing (SCRUM-277).

## Routes

| Path       | Screen                      |
| ---------- | --------------------------- |
| `/resumes` | My Resumes list of versions |

The list links to `/resumes/:id`, `/resumes/:id/review` and `/resumes/:id/resolve`. Those screens are not built yet and show Page not found.

## Code

`ResumesPage.tsx` keeps the versions in local state, seeded from `sampleData.ts`, until the feature has a provider. Each parse status maps to one main action: Confirmed views, Needs review reviews, Failed resolves, and Processing has none. The row menu (`RowMenu.tsx`) offers Set as primary, for confirmed versions only, and Delete, which asks for confirmation first. **Upload resume** opens `UploadResumeDialog.tsx`, a modal `<dialog>` opened from page state rather than a route, so the shell does not move focus to `<main>` and the browser returns focus to the button on close. It accepts a PDF or DOCX up to 5 MB, chosen with Browse or dropped on the drop area. A blank version name becomes the file name and today's date, and a name already in use is refused. The rules and messages are in `uploadValidation.ts`. New uploads join the list as Processing. A student can keep up to `RESUME_VERSION_LIMIT` (10) versions; at the limit the upload button is disabled. Upload dates are `YYYY-MM-DD` strings that `format.ts` shows in UTC.

## Tests

`ResumesPage.test.tsx` covers the table, the actions for each status, the row menu, deleting, the version limit and the empty state. `UploadResumeDialog.test.tsx` covers uploading, the default name, each validation message, drag and drop, and closing. jsdom lacks `showModal()`, so `src/setupTests.ts` stubs it and `close()`. Run them with `npm test` from `frontend/`.
