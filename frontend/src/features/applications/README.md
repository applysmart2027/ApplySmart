# Applications

Job Discovery and Application Tracking. Owner: Anthony Vydysh (SCRUM-276).

## Routes

| Path                       | Screen                                                            |
| -------------------------- | ----------------------------------------------------------------- |
| `/applications`            | Application Records list                                          |
| `/applications/new`        | Create Application Record form                                    |
| `/applications/:id`        | Application Record Details, or Not Found and Access Denied states |
| `/applications/:id/edit`   | Edit Application Record form                                      |
| `/applications/:id/delete` | Delete Application Confirmation                                   |

## Public surface

`index.ts` exports two things:

- `applicationsRoutes`, which `src/app/routes.tsx` spreads into the route table.
- `ApplicationsProvider`, which `src/app/App.tsx` mounts once above the router. Once the student is signed in, it loads their application records from `GET /api/applications/` and holds them for every screen in this folder. Screens read and change them through `useApplications()` in `store.ts`, which returns the records, the load status (`'loading'`, `'ready'` or `'failed'`) and a `dispatch` for the reducer in the same file.

No other feature imports from this folder yet. If one needs application records, agree what it should receive and export that from `index.ts`; do not import files from here directly.

## Code

`api.ts` is the only file that calls the backend: `listApplications()` and `createApplication(draft)`. It turns the backend's numeric ids into strings and reloads the page on a 403, which brings back the sign-in screen. `ApplicationForm.tsx` is the one form behind create and edit; pages pass a starting draft and `onSave`, and the form disables its save button until `onSave` finishes. Create saves through `api.ts`. Edit and delete change only the loaded records, and both screens say so, because the backend cannot update or delete yet. It shows `ResumeSelection.tsx` in place of its fields while a resume is chosen, so the draft survives. The resume list is `sampleResumes`, a stand-in until the resumes feature exports one (SCRUM-277). Screens for one record call `useApplication(id)`, which returns the record, `'loading'`, `'failed'`, `'not-found'` or `'denied'`, and render `RecordUnavailable` for anything that is not a record. `types.ts` defines `ApplicationRecord` and the status list. `sampleData.ts` holds the six sample records the tests use. Optional fields are empty strings when not provided. Deadlines are `YYYY-MM-DD` strings, and `format.ts` shows them in UTC so they never move by a day. Each record keeps `resumeId` and a `resumeName` snapshot of the resume it was sent with. `restrictedApplicationId` stands in for another student's record to demonstrate Access Denied. `validation.ts` holds every form rule in one function. Job title and employer are required; the posting URL must start with http or https; the contact email must look like an address. The messages there are the ones students see.

## Tests

Each screen has a `.test.tsx` file next to it, and `validation.test.ts` covers the rules. Page tests use `test-utils.tsx`. `await renderAt(path)` replaces `fetch` with `fakeRecordsBackend`, renders this folder's routes inside a fresh provider, and waits for the records to load. `fakeRecordsBackend` answers the records API from the sample records; `src/app/routes.test.tsx` uses it too. To start from something else, pass `renderAt` a list of records or a failing `fetch` as its second argument. The helpers `fill`, `submit`, `simulateFailure('save' or 'delete')`, `detail` and `heading` cover the common steps. Run them with `npm test` from `frontend/`.
