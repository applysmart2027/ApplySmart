# Resumes

Resume Management and Parsing (SCRUM-277).

## Routes

| Path                   | Screen                                                                                       |
| ---------------------- | -------------------------------------------------------------------------------------------- |
| `/resumes`             | My Resumes list of versions, with the Upload resume dialog                                   |
| `/resumes/:id/resolve` | Resolve failed upload, or Resume not found and Nothing to resolve                            |
| `/resumes/:id/review`  | Review parsed resume with the Edit section dialog, or Resume not found and Nothing to review |

`/resumes/resolve` is a prototype shortcut that redirects to the resolve page for the first failed version, so the page can be shown without going through the list.

The list also links to `/resumes/:id`, and the resolve page to `/resumes/:id/manual`. Those screens are not built yet and show Page not found.

## Public surface

`index.ts` exports `resumesRoutes`, which `src/app/routes.tsx` spreads into the route table, and `ResumesProvider`, which `src/app/App.tsx` mounts once above the router. Screens read and change the versions through `useResumes()` in `store.ts`, and screens for one version call `useResume(id)`.

## Code

Each version has a parse status. On the list, Confirmed links to View, Needs review to Review, Failed to Resolve, and Processing has no action. The row menu (`RowMenu.tsx`) offers Set as primary, for confirmed versions only, and Delete, which asks first through `DeleteVersionConfirm.tsx`. A student can keep up to `RESUME_VERSION_LIMIT` (10) versions; at the limit the upload button is disabled.

**Upload resume** opens `UploadResumeDialog.tsx`, a modal `<dialog>` opened from page state rather than a route, so the shell does not move focus to `<main>` and the browser returns focus to the button on close. It accepts a PDF or DOCX up to 5 MB, chosen with Browse or dropped on the drop area. A blank version name becomes the file name and today's date, and a name already in use is refused. The rules and messages are in `uploadValidation.ts`. New uploads join the list as Processing.

The resolve page shows the failure reason and `parseAttempts` against `MAX_PARSE_ATTEMPTS` (3). Retry sends the same file back to Processing and is hidden once the limit is reached. Upload a replacement reuses the upload dialog with the current name filled in and restarts the attempt count. Delete asks first. Each action returns to the list and passes a message in navigation state (`ResumesPageState`) for the list's status region.

The review page lists each parsed section (`SECTION_NAMES`: Experience, Education, Projects) from the version's `sections`, and flags entries that fail validation. **Edit** opens `EditSectionDialog.tsx`, which works on a draft of that section: entries can be edited, removed, added, or marked to move to another section. Nothing changes until Save, and Cancel discards the draft. Save checks every entry with `validateEntry` in `sectionValidation.ts` and moves focus to the first field with a problem. Job title and organization (named per section in `SECTION_FIELDS`) are required. Dates are optional, kept as typed, and must read as a month and year such as "May 2025"; the end date may be "Present" and cannot be before the start date. **Confirm resume** is refused while any entry has a problem, and otherwise marks the version Confirmed and returns to the list.

Upload dates are `YYYY-MM-DD` strings that `format.ts` shows in UTC.

## Tests

`ResumesPage.test.tsx`, `UploadResumeDialog.test.tsx`, `ResolveResumePage.test.tsx` and `ReviewResumePage.test.tsx` cover each screen, and `sectionValidation.test.ts` covers the entry rules. They use `renderAt(path)` from `test-utils.tsx`, which renders this folder's routes inside a fresh provider. jsdom lacks `showModal()`, so `src/setupTests.ts` stubs it and `close()`. Run them with `npm test` from `frontend/`.
