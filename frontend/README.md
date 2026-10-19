# ApplySmart frontend

The React prototype for ApplySmart. It runs without a backend: all data is hard-coded in the browser and resets on refresh.

## Prerequisites

- Node.js 24 and npm 11. The project was set up and checked with Node 24.11.1 and npm 11.6.2 on 2026-10-16. Node 22.12 or newer should also work because Vite 8 requires it, but that has not been tested here.
- Git.

## Run it

```bash
cd frontend
npm install
npm run dev
```

Open the address Vite prints, normally http://localhost:5173.

## Scripts

| Command                | What it does                                                          |
| ---------------------- | --------------------------------------------------------------------- |
| `npm run dev`          | Starts the dev server with hot reload                                 |
| `npm run build`        | Type-checks with `tsc -b`, then writes a production bundle to `dist/` |
| `npm run lint`         | Runs oxlint with the rules in `.oxlintrc.json`                        |
| `npm test`             | Runs the Vitest suite once                                            |
| `npm run format`       | Rewrites every file with Prettier                                     |
| `npm run format:check` | Fails if any file is not Prettier-formatted                           |
| `npm run preview`      | Serves the last build from `dist/`                                    |

Run `build`, `lint`, `test`, and `format:check` before opening a pull request. All four must pass.

## Layout

Code lives under `src/` and is organised by feature. See `docs/adr/0003-feature-based-structure.md` at the repository root for the folder rules and the import direction.

| Folder                 | What it holds                                                                                                                                                                                                                                                                                                                                                                                                         |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/`             | The router, the shell (header and sidebar), the dashboard, the not-found page, and `routes.tsx`, which pulls in every feature's routes                                                                                                                                                                                                                                                                                |
| `src/features/<area>/` | One functional area. `index.ts` exports the area's routes and is the only file other folders may import                                                                                                                                                                                                                                                                                                               |
| `src/shared/styles/`   | `tokens.css` loads the Mulish font and holds every colour, font size, spacing step, radius and border as a CSS variable; `src/shared/ui/` holds shared components, starting with `PageHeader` for page titles, subtitles and actions; `base.css` holds global element styles and the shared classes: `.page-header`, `.page-intro`, `.panel`, `.button`, `.button-primary`, `.field`, `.empty-state` and `.text-link` |

To add a screen to your area, add a route to your feature's `index.ts`. You do not need to edit `src/app/`. Use the variables in `tokens.css` for any colour or spacing; a colour value written anywhere else is a review failure.

## Tests

Vitest runs in a jsdom environment with React Testing Library. `src/setupTests.ts` registers the jest-dom matchers and cleans up the rendered page after each test. Test files sit next to the code they cover and end in `.test.tsx`. Tests assert what a user sees on screen, not component internals. `src/app/routes.test.tsx` renders the real route table in a memory router, which is the pattern to copy for page tests.

## Demo

| Address                                     | What it shows                                                                                                                                                                                                                                                                     |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                                         | Dashboard with the four areas                                                                                                                                                                                                                                                     |
| `/applications`                             | Application Records: six sample records with search, a status filter and sorting. Search for something that matches nothing, such as "astronaut", to see the no-matches state                                                                                                     |
| `/applications/new`                         | Create Application Record. Save with the required fields empty to see field errors, type "careers page" as the posting URL to see the invalid-address message, or tick "Simulate a save failure" to see the failure message. A valid save returns to the list with the new record |
| `/applications/app-1`                       | Application Record Details for Software Developer. `/applications/app-3` shows a record with no resume, notes or contact                                                                                                                                                          |
| `/applications/app-999`                     | Application not found                                                                                                                                                                                                                                                             |
| `/applications/app-restricted`              | Access denied, standing in for another student's record                                                                                                                                                                                                                           |
| `/applications/app-1/edit`                  | Edit Application Record, prefilled. Cancel discards changes; Save changes returns to the details with the new values. The same field errors and "Simulate a save failure" checkbox work as on create                                                                              |
| `/applications/app-1/delete`                | A "not available yet" page until that screen is built                                                                                                                                                                                                                             |
| `/resumes`, `/matching`, `/recommendations` | Placeholder for each teammate's area                                                                                                                                                                                                                                              |
| any other address                           | Page not found, with a link back to the dashboard                                                                                                                                                                                                                                 |

Press Tab on any page: the first stop is a "Skip to main content" link. Below 768 pixels wide the sidebar becomes a row of links above the page.

## Known limitations

- The list, create, details and edit screens are built. The delete screen shows a placeholder, and the other three areas arrive when their owners build them.
- The create and edit forms have no resume field yet. Choosing or uploading a resume arrives with the resume selection screen.
- The "no records yet" state cannot be reached in the browser until records can be deleted. A test covers it.
- Data will not survive a page refresh. This is by design for the Inception prototype.
