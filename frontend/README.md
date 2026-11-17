# ApplySmart frontend

The React prototype for ApplySmart. Sign-in goes through the backend, and so do listing and creating application records and listing and uploading resumes. Every other screen uses data hard-coded in the browser, which resets on refresh.

## Prerequisites

- Node.js 24 and npm 11. The project was set up and checked with Node 24.11.1 and npm 11.6.2 on 2026-10-16. Node 22.12 or newer should also work because Vite 8 requires it, but that has not been tested here.
- Git.

## Run it

```bash
cd frontend
npm install
npm run dev
```

Open the address Vite prints, normally http://localhost:5173. The dev server forwards every request under `/api/` to the backend on port 8000. Start the backend first with `docker compose up` from the repository root, as `backend/README.md` describes. Without it the sign-in screen cannot sign you in.

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

| Folder                 | What it holds                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/`             | The router, the shell (header and sidebar), the dashboard, the not-found page, and `routes.tsx`, which pulls in every feature's routes                                                                                                                                                                                                                                                                                                                                                               |
| `src/features/<area>/` | One functional area. `index.ts` exports the area's routes and is the only file other folders may import                                                                                                                                                                                                                                                                                                                                                                                              |
| `src/shared/styles/`   | `tokens.css` loads the Mulish font and holds every colour, font size, spacing step, radius and border as a CSS variable; `src/shared/ui/` holds shared components, starting with `PageHeader` for page titles, subtitles and actions; `src/shared/csrf.ts` reads the CSRF cookie that Django requires on every POST; `base.css` holds global element styles and the shared classes: `.page-header`, `.page-intro`, `.panel`, `.button`, `.button-primary`, `.field`, `.empty-state` and `.text-link` |

To add a screen to your area, add a route to your feature's `index.ts`. You do not need to edit `src/app/`. Start each page with `PageHeader` from `src/shared/ui/`: it renders the heading and also sets the browser tab title. After every navigation the shell moves keyboard focus to the page content, so a page should not try to focus an element of its own when it first opens. Use the variables in `tokens.css` for any colour or spacing; a colour value written anywhere else is a review failure.

## Tests

Vitest runs in a jsdom environment with React Testing Library. `src/setupTests.ts` registers the jest-dom matchers and cleans up the rendered page after each test. Test files sit next to the code they cover and end in `.test.tsx`. Tests assert what a user sees on screen, not component internals. `src/app/routes.test.tsx` renders the real route table in a memory router, which is the pattern to copy for page tests.

## Demo script

Start the backend and the dev server, and open the address it prints. The Sign in screen comes first. Press Sign in with both fields empty to see the missing-fields message, then sign in as `maya.okafor` with a wrong password to see the incorrect-details message, then with `applysmart-demo`. A refresh keeps you signed in. Application records you create are saved in the backend; edits and deletes last only until the page is reloaded.

1. **Dashboard.** The four areas are listed, and the sidebar marks Dashboard as current. Steps 2 to 13 cover Applications; the other three areas are listed under Other areas below.
2. **Empty list.** Open Applications. A student with no records yet sees "You have no application records yet." and a link to create the first one.
3. **Missing and invalid fields.** Press New application, then Save application with nothing filled in: both required fields explain themselves and focus moves to Job title. Enter "Data Engineer" and "Maplestone Robotics", type "careers page" as the posting URL and save again to see the address message, then clear the URL.
4. **Resume step.** Press Select or upload resume, choose "Cloud and DevOps resume.docx" and press Attach resume. The typed values are still there.
5. **Save failure.** Tick "Simulate a save failure (prototype only)" and save: the failure message appears and nothing is lost. Untick it and save; the list shows Data Engineer.
6. **Saved for real.** Refresh the page: Data Engineer is still listed. Open a private window, sign in as `daniel.reyes`, and his list does not show it.
7. **Search, filter and sort.** Back as `maya.okafor`, create a second record, "Cloud Engineer" at "Lakeshore Transit Authority" with status Offer. Search for "lakeshore" to narrow the table to one row, then for "astronaut" to see the no-matches message, and press Clear search and filters. Set Status to Offer, then back to All statuses, and sort by employer.
8. **Details.** Press View on Data Engineer. Every field is shown, with plain wording for the empty ones.
9. **Edit.** Press Edit application. The page says changes are not saved yet. Change Status to Interview, press Change resume and pick any PDF or DOCX file from the computer (a PNG is refused), attach it and press Save changes. The details show the new status and file name until the page is reloaded.
10. **Delete.** Press Delete application, then Cancel: the record is unchanged. Press Delete application again, tick "Simulate a delete failure (prototype only)" and confirm to see the failure message, then untick it and confirm. The list no longer shows Data Engineer. Reload the page and it is back, as the confirmation said.
11. **Unavailable records.** Open `/applications/999` for Application not found and `/applications/app-restricted` for the access-denied message. Any other unknown address shows Page not found.
12. **Backend down.** Run `docker compose stop backend` in a second terminal and reload the page. The Sign in screen appears, and signing in shows "ApplySmart could not sign you in. Check that the backend is running, then try again." Run `docker compose start backend` and sign in again.
13. **Keyboard and phone width.** Press Tab on any page: the first stop is a "Skip to main content" link. Below 768 pixels wide the sidebar becomes rows of links and the records table scrolls inside its panel.

### Other areas

Each area starts from its sidebar link. Its feature README lists the routes and states it shows.

| Area            | Start at           | Routes and states                     |
| --------------- | ------------------ | ------------------------------------- |
| Resumes         | `/resumes`         | `src/features/resumes/README.md`      |
| Matching        | `/matching`        | `src/features/matching/README.md`     |
| Recommendations | `/recommendations` | The feature README is not written yet |

## Known limitations

- There is no sign-out button. Clearing the site's cookies in the browser signs you out.
- Matching and Recommendations run on their own sample data, and no area reads another area's data yet.
- In Resumes, only the list and uploads are saved. Set as primary, Delete, Retry, Upload a replacement and Confirm resume change a version only until the page is reloaded. Uploaded resumes are not parsed yet, so they stay Processing and the Review and Resolve screens are not reachable from the list; their tests use sample versions.
- The resume step in Applications offers three sample resumes kept in the applications feature, not the list from the resumes feature. A picked file keeps only its name; nothing is uploaded or read.
- Some links lead to Page not found because their screens are not built: `/resumes/:id`, `/resumes/:id/manual`, and the Progress Summary and Reminders & Follow-ups tabs in Recommendations.
- `npm run format:check` fails on 18 files in `src/features/matching/` and `src/features/recommendations/`.
- Editing and deleting an application record change it only until the page is reloaded, because the backend cannot update or delete records yet. Data in the other areas resets on every refresh.
