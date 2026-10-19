# Applications

Job Discovery and Application Tracking. Owner: Anthony Vydysh (SCRUM-276).

## Routes

| Path                       | Screen                                                            |
| -------------------------- | ----------------------------------------------------------------- |
| `/applications`            | Application Records list                                          |
| `/applications/new`        | Create Application Record form                                    |
| `/applications/:id`        | Application Record Details, or Not Found and Access Denied states |
| `/applications/:id/edit`   | Edit Application Record form                                      |
| `/applications/:id/delete` | Delete Application Confirmation |

## Public surface

`index.ts` exports two things:

- `applicationsRoutes`, which `src/app/routes.tsx` spreads into the route table.
- `ApplicationsProvider`, which `src/app/App.tsx` mounts once above the router. It holds the application records for every screen in this folder. Screens read and change them through `useApplications()` in `store.ts`, which returns the records and a `dispatch` for the reducer in the same file.

No other feature imports from this folder yet. If one needs application records, agree what it should receive and export that from `index.ts`; do not import files from here directly.

## Code

`ApplicationForm.tsx` is the one form behind create and edit; pages pass a starting draft and `onSave`. Screens for one record call `useApplication(id)`, which returns the record, `'not-found'` or `'denied'`, and render `RecordUnavailable` for the last two. `types.ts` defines `ApplicationRecord` and the status list. `sampleData.ts` holds the six sample records. Optional fields are empty strings when not provided. Deadlines are `YYYY-MM-DD` strings, and `format.ts` shows them in UTC so they never move by a day. Each record keeps `resumeId` and a `resumeName` snapshot of the resume it was sent with. `restrictedApplicationId` stands in for another student's record to demonstrate Access Denied. `validation.ts` holds every form rule in one function. Job title and employer are required; the posting URL must start with http or https; the contact email must look like an address. The messages there are the ones students see.

## Tests

Each screen has a `.test.tsx` file next to it, and `validation.test.ts` covers the rules. Page tests use `test-utils.tsx`: `renderAt(path)` renders this folder's routes inside a fresh provider, and `fill`, `submit`, `simulateFailure('save' or 'delete')`, `detail` and `heading` cover the common steps. Run them with `npm test` from `frontend/`.
