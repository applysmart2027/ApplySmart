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

## Demo script

Start the dev server and open the address it prints. Every step uses the sample data, which resets when the page is refreshed.

1. **Dashboard.** The four areas are listed, and the sidebar marks Dashboard as current. Resumes, Matching and Recommendations open a placeholder until their owners build them.
2. **Application Records.** Open Applications. Search for "lakeshore" to narrow the table to one row, then for "astronaut" to see the no-matches message, and press Clear search and filters. Set Status to Offer, then back to All statuses, and sort by employer.
3. **Missing and invalid fields.** Press New application, then Save application with nothing filled in: both required fields explain themselves and focus moves to Job title. Enter "Data Engineer" and "Maplestone Robotics", type "careers page" as the posting URL and save again to see the address message, then clear the URL.
4. **Resume step.** Press Select or upload resume, choose "Cloud and DevOps resume.docx" and press Attach resume. The typed values are still there.
5. **Save failure.** Tick "Simulate a save failure (prototype only)" and save: the failure message appears and nothing is lost. Untick it and save; the list shows Data Engineer.
6. **Details.** Press View on Data Engineer. Every field is shown, with plain wording for the empty ones.
7. **Edit.** Press Edit application, change Status to Interview, press Change resume and pick any PDF or DOCX file from the computer (a PNG is refused), attach it and press Save changes. The details show the new status and file name.
8. **Delete.** Press Delete application, then Cancel: the record is unchanged. Press Delete application again, tick "Simulate a delete failure (prototype only)" and confirm to see the failure message, then untick it and confirm. The list no longer shows Data Engineer.
9. **Unavailable records.** Open `/applications/app-999` for Application not found and `/applications/app-restricted` for the access-denied message. Any other unknown address shows Page not found.
10. **Empty list.** Delete the remaining records one by one to see "You have no application records yet." Refresh the page to bring the sample data back.
11. **Keyboard and phone width.** Press Tab on any page: the first stop is a "Skip to main content" link. Below 768 pixels wide the sidebar becomes rows of links and the records table scrolls inside its panel.

## Known limitations

- All five application record screens are built. The other three areas arrive when their owners build them.
- The resume list is three sample resumes kept in the applications feature until Hira's resumes feature provides the real list. A picked file keeps only its name; nothing is uploaded or read.
- Data will not survive a page refresh. This is by design for the Inception prototype.
