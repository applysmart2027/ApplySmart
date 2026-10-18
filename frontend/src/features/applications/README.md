# Applications

Job Discovery and Application Tracking. Owner: Anthony Vydysh (SCRUM-276).

## Routes

| Path                                                                                           | Screen                                 |
| ---------------------------------------------------------------------------------------------- | -------------------------------------- |
| `/applications`                                                                                | Application Records list               |
| `/applications/new`, `/applications/:id`, `/applications/:id/edit`, `/applications/:id/delete` | Placeholder until each screen is built |

## Public surface

`index.ts` exports two things:

- `applicationsRoutes`, which `src/app/routes.tsx` spreads into the route table.
- `ApplicationsProvider`, which `src/app/App.tsx` mounts once above the router. It holds the application records for every screen in this folder.

No other feature imports from this folder yet. If one needs application records, agree what it should receive and export that from `index.ts`; do not import files from here directly.

## Data

`types.ts` defines `ApplicationRecord` and the status list. `sampleData.ts` holds the six sample records. Optional fields are empty strings when not provided, and deadlines are `YYYY-MM-DD` strings shown in UTC so they never move by a day.

## Tests

`ApplicationsListPage.test.tsx` renders this folder's routes inside the provider and checks what a student sees. Run them with `npm test` from `frontend/`.
