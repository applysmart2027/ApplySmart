# Iteration 4: Inception UI Prototype

Jira parent: SCRUM-274. Dates: October 13 to 20, 2026. Plan drafted October 16, 2026. Status: Increments 1 to 9b built and verified; SCRUM-276 complete. Teammate integration (Increment 10) next.

## 1. Goals

- A running React prototype with the main ApplySmart dashboard and navigation between the four functional areas.
- Anthony's six Job Discovery and Application Tracking screens working on mock data, matching the Part III wireframes.
- Teammates' areas integrated through the same shell when their modules are ready.
- Code tracked in the team GitHub repository and demonstrable locally with one command.

## 2. Scope and non-goals

In scope: UI shell, dashboard, routing, mock data, selected screens, mock interactions, validation and error states, proportionate tests, documentation.

Out of scope: backend APIs, persistence, authentication, cloud deployment, resume parsing, job-board integration, file storage, background jobs, future-iteration features. The full-stack stories SCRUM-18, 19, 20, 21 and 24 stay untouched.

## 3. Repository audit (October 16, 2026)

- The local ApplySmart folder was empty and not a git repository. The team GitHub repository URL is not yet known locally.
- The September project report documents React for the UI, Django for the backend, PostgreSQL and AWS. Only the React UI is in scope now.
- No Visual Paradigm exports (wireframes, wireflows, domain model, glossary) are available locally. They must be supplied before Increment 3.
- Toolchain available: Node 24.11, npm 11.6, git 2.51. GitHub CLI present but not authenticated.
- Later the same day: the private repository `applysmart2027/ApplySmart` was created and the first commit pushed. A written UI specification for the six screens and the shell replaced the need for wireframe exports. Decisions D1 to D4 and D7 below are resolved; D5 and D6 are applied as assumptions.

## 4. Technical architecture

Stack: React 19, TypeScript 6, Vite 8, react-router 8.4 (latest release on 2026-10-17; the APIs used also exist in 7.x), plain CSS with custom properties. Dev tooling as scaffolded on 2026-10-16: oxlint (the Vite template's linter), Prettier, Vitest 5 with React Testing Library and jsdom. Decisions are recorded in `docs/adr/`.

```text
frontend/                       (decision D1: folder name)
  index.html, package.json, vite.config.ts, tsconfig.json, .prettierrc
  src/
    main.tsx
    app/
      App.tsx                   creates the browser router; providers added in Increment 3
      routes.tsx                shell route, dashboard, each feature's routes, not-found
      areas.ts                  path, name and description of the four areas
      AppShell.tsx              skip link, header, sidebar navigation, outlet
      DashboardPage.tsx         links to the four areas
      PageNotFound.tsx          unknown addresses
      app.css                   shell and dashboard styles
    features/
      applications/             Anthony, SCRUM-276
        index.ts                routes and ApplicationsProvider
        types.ts                ApplicationRecord, ApplicationStatus, APPLICATION_STATUSES
        sampleData.ts           six hard-coded records
        store.ts                context, reducer, useApplications, useApplication(id)
        ApplicationsProvider.tsx  mounts the records once, above the router
        validation.ts           pure form rules
        format.ts               deadline formatting
        ApplicationsListPage.tsx
        ApplicationForm.tsx     the form behind create and edit
        CreateApplicationPage.tsx
        EditApplicationPage.tsx
        ApplicationDetailsPage.tsx
        RecordUnavailable.tsx   not found and access denied
        DeleteApplicationPage.tsx
        ResumeSelection.tsx     the resume step shown inside ApplicationForm
        TextField.tsx           labelled input with its error wiring
      resumes/                  Hira, SCRUM-277
      matching/                 Nicolas, SCRUM-278
      recommendations/          Nikole, SCRUM-279
    shared/
      ui/PageHeader.tsx         title, subtitle and actions for every page
      styles/tokens.css, base.css
```

Dependency direction: app imports feature indexes and shared; features import shared; shared imports nothing above it; no feature imports another feature's internals.

Routes: `/`, `/applications`, `/applications/new`, `/applications/:id`, `/applications/:id/edit`, `/applications/:id/delete`, `/resumes`, `/matching`, `/recommendations`. Resume selection is a step inside the form page so the draft survives.

State: one provider for application records, defined in the feature, mounted once in App. Reducer actions are the future API swap point. Everything else is local component state.

Cross-feature contracts:

| Interaction | Data owner | Consumer needs | Mechanism |
|---|---|---|---|
| Application shows attached resume | Resumes | id and display name | Records store `resumeId` and a `resumeName` snapshot, decided 2026-10-18, so the details screen needs no resume module. Until the resumes feature exports a resume list and upload, applications keeps a three-item stand-in `sampleResumes` marked TODO(SCRUM-277); switching is one import in `ResumeSelection.tsx` |
| Matching compares an application and a resume | Applications, Resumes | ids | Navigation with query parameters, agreed with Nicolas |
| Analytics and follow-ups read applications | Applications | read-only records | `useApplications()` exported from the applications index, if Nikole needs live data |
| Dashboard links to areas | Shell | route paths | Static links; no feature data in the shell initially |

Mock failure states: a visible "Simulate server error" checkbox, labelled prototype-only, on save and delete screens.

Testing: Vitest and React Testing Library. Seams under test: the reducer, the validation function, and each page's observable behaviour through rendering with a memory router and the provider. No snapshots.

## 5. Iteration plan by ticket

| Jira | Work | Owner | Depends on | Done when |
|---|---|---|---|---|
| SCRUM-275 | Scaffold, shell, navigation, dashboard, tokens, route table, placeholders | Anthony for the team | Repo access | Four areas reachable; build and lint pass |
| SCRUM-276 | Six screens plus workflow integration | Anthony | 275 | Increments 3 to 9 verified |
| SCRUM-277 | Resume screens in `features/resumes` | Hira | 275 | Routes exported from her index |
| SCRUM-278 | Matching screens in `features/matching` | Nicolas | 275, route contract | Same |
| SCRUM-279 | Recommendations screens | Nikole | 275, read contract if needed | Same |
| SCRUM-280 | Merge, smoke test every route, fixes, demo script, README | Team, Anthony coordinating | 276 to 279 | Definition of Done below |

## 6. Increments

| # | Ticket | Objective | Verify | Est. (planning only) |
|---|---|---|---|---|
| 1 | 275 | Done 2026-10-16: Vite react-ts scaffold in `frontend/`, template demo removed, Prettier, Vitest, READMEs, four ADRs | install, build, lint, test, format check all pass; dev server shows heading | 1.5 h |
| 2 | 275 | Done 2026-10-17: react-router 8.4, app shell with header and sidebar, dashboard, tokens and base styles, route table, not-found page, a placeholder page in each feature folder, DESIGN.md | build, lint, 6 tests, format check pass; checked in headless Chrome at 1280 and 375 px wide, keyboard order and skip link | 2 h |
| 2b | 275 | Done 2026-10-17: Mulish as the app typeface, vivid blue accent, pill navigation, rounded dashboard panel, short sidebar labels (ADR-0005) | build, lint, 6 tests, format check pass; every element renders in Mulish in Chrome; no overflow at 375 px | 1.5 h |
| 3 | 276.1 | Done 2026-10-18: record types, six sample records, provider, Application Records list with search, status filter, sort, two empty states, placeholder routes for the other four screens; shared `.panel`, `.button`, `.field`, `.page-header`, `.empty-state` | build, lint, 13 tests, format check pass; checked in Chrome at 1280 and 375 px wide | 3 h |
| 4 | 276.2 | Done 2026-10-18: Create Application Record form with field validation, focus on the first invalid field, a simulated save failure, and the reducer's first action; shared field error, notice and prototype-control styles | build, lint, 22 tests, format check pass; checked in Chrome at 1280 and 375 px wide | 3 h |
| 5 | 276.3 | Done 2026-10-18: Application Record Details with every field and its empty wording, Back, Edit and Delete actions, Record Not Found for unknown ids and Access Denied for a reserved id; `formatDeadline` shared by list and details | build, lint, 29 tests, format check pass; checked in Chrome at 1280 and 375 px wide | 2 h |
| 6 | 276.4 | Done 2026-10-18: Edit Application Record, prefilled, with Cancel back to details, Save changes, the same validation and simulated failure as create; `ApplicationForm`, `useApplication`, `RecordUnavailable` and the shared `PageHeader` extracted for their second use | build, lint, 37 tests, format check pass; create tests unchanged after the extraction; checked in Chrome at 1280 and 375 px wide | 2.5 h |
| 7 | 276.5 | Done 2026-10-19: Delete Application Confirmation with Cancel back to details, a red Delete application button, the `removed` action, and a simulated delete failure with retry; the "no records yet" state is now reachable; the placeholder page is gone | build, lint, 44 tests, format check pass; checked in Chrome at 1280 and 375 px wide, including deleting every record | 1.5 h |
| 8 | 276.6 | Done 2026-10-19: Resume Upload and Selection as a step inside the create and edit forms: three stand-in sample resumes, a PDF or DOCX picker that keeps only the file name, Attach and Cancel, typed values preserved, focus moved into the step and back; `.field` and the form panels now let wide controls shrink on phones | build, lint, 50 tests, format check pass; checked in Chrome at 1280 and 375 px wide with real PDF and PNG files | 2.5 h |
| 9 | 276.7 | Done 2026-10-19: end-to-end workflow test through the shell, the three missing coverage cases, the coverage table above, the README demo script, and the code, React and accessibility reviews | build, lint, 53 tests, format check pass; demo script followed in Chrome | 2.5 h |
| 9b | 276.7 | Done 2026-10-19: review fixes. Every page sets a browser title through `PageHeader`; focus moves to the page content after navigation; the current sidebar item stays marked in high contrast mode; the edit form resets when the record changes; dashboard links are tested; ADRs 0001 to 0005 marked Proposed pending team review. Deferred to Increment 11: dashboard line length on wide screens, sidebar hover contrast, sidebar text alignment | build, lint, 58 tests, format check pass; titles, focus and forced colours checked in Chrome | 1 h |
| 10 | 280 | Integrate teammate modules, resolve contracts | every route renders | depends on team |
| 11 | 280 | Quality gate: /code-review, /simplify, antislop Delivery Gate, accessibility | reports, fixes | 2 h |
| 12 | 280 | Demo readiness: README, known limitations, Jira updates identified | fresh clone runs | 1 h |

Each increment: explain files first, implement, verify, summarize, stop for approval.

## 7. Decisions pending

- D1 Resolved: app in `frontend/` of `applysmart2027/ApplySmart`.
- D2 Resolved: React 19, TypeScript, Vite, react-router 8, plain CSS (ADR-0001, ADR-0002). Version 8 replaced the planned 7 on 2026-10-17 because it was the current release and every API in use exists in both.
- D3 Resolved: Vitest, React Testing Library, jest-dom, jsdom installed in Increment 1.
- D4 Resolved: one placeholder page per teammate feature folder in Increment 2, approved by Anthony.
- D5 Open: application status vocabulary from the Part II glossary. Applied as an assumption: Saved, Applied, Interview, Offer, Rejected, Withdrawn.
- D6 Open: contact name and email as optional form fields. Applied as an assumption so the details screen's contact data stays editable.
- D7 Resolved: the written UI specification received 2026-10-16 replaces the wireframe exports.
- D8 Resolved: realistic fictional employer names in sample data instead of "ABC Corp" and "XYZ Inc"; resume selection as an in-page step; a light, precise visual direction recorded in ADR-0005.

## 8. Verification strategy

Per increment: `npm run build`, `npm run lint`, `npm test`, manual click-through of the affected screens. Per screen: renders, navigation works, mock data visible, interactions behave, invalid input gives feedback, cancel changes nothing, actions hit the right record, no backend needed, earlier screens still work.

### Wireflow and UI state coverage

Every transition in section 10 and every state in section 12 of the UI specification, with the test that proves it. Test names are shortened; files are under `frontend/src/`. Checked on 2026-10-19 against 53 passing tests.

| Specification item | Proven by |
|---|---|
| List, New application, to Create | `app/routes.test.tsx`: a student creates, views, edits and deletes an application |
| Create, Cancel, to List | `CreateApplicationPage.test.tsx`: cancel returns to the list without adding a record |
| Create, Save (success), to List | `CreateApplicationPage.test.tsx`: a valid save returns to the list and shows the new record |
| List, View, to Details | `ApplicationDetailsPage.test.tsx`: View in the list opens the details of that row |
| Details, Back, to List | `ApplicationDetailsPage.test.tsx`: the actions lead to edit, delete and back to the list |
| Details, Edit, to Edit | `EditApplicationPage.test.tsx`: Edit application on the details screen opens that record |
| Edit, Cancel, to Details | `EditApplicationPage.test.tsx`: cancel returns to the details without saving the edits |
| Edit, Save (success), to Details | `EditApplicationPage.test.tsx`: saving shows the changes on the details screen |
| Details, Delete, to Delete confirmation | `DeleteApplicationPage.test.tsx`: Delete application on the details screen opens the confirmation |
| Delete, Cancel, to Details | `DeleteApplicationPage.test.tsx`: cancel returns to the details and keeps the record |
| Delete, Confirm (success), to List | `DeleteApplicationPage.test.tsx`: confirming removes the record and returns to the list |
| Create, Select or upload resume, to Resume step | `ResumeSelection.test.tsx`: on create, a chosen resume is attached |
| Resume step, Cancel, to Create | `ResumeSelection.test.tsx`: cancel on create returns to the form with nothing attached |
| Resume step, Attach, to Create | `ResumeSelection.test.tsx`: on create, a chosen resume is attached |
| Edit, Change resume, to Resume step | `ResumeSelection.test.tsx`: on edit, the current resume is preselected |
| Resume step, Cancel, to Edit | `ResumeSelection.test.tsx`: cancel returns to the form with the previous resume |
| Resume step, Attach, to Edit | `ResumeSelection.test.tsx`: on edit, the current resume is preselected and a new one is saved |
| List: normal | `ApplicationsListPage.test.tsx`: the table shows each sample record |
| List: empty | `ApplicationsListPage.test.tsx`: with no records the page offers to create the first one |
| List: record not found | `ApplicationDetailsPage.test.tsx`: an unknown address shows that the record was not found |
| List: access denied | `ApplicationDetailsPage.test.tsx`: another student's record shows access denied |
| Create: initial form | `CreateApplicationPage.test.tsx`: saving without the required fields shows both messages |
| Create: missing required fields | `CreateApplicationPage.test.tsx`: saving without the required fields shows both messages |
| Create: invalid information | `CreateApplicationPage.test.tsx`: an invalid URL and email are explained |
| Create: save failure | `CreateApplicationPage.test.tsx`: a simulated save failure keeps the entries |
| Edit: initial prefilled form | `EditApplicationPage.test.tsx`: the form is prefilled with every field of the record |
| Edit: missing required fields | `EditApplicationPage.test.tsx`: clearing a required field explains it |
| Edit: invalid information | `EditApplicationPage.test.tsx`: an invalid posting URL is explained and focused |
| Edit: save failure | `EditApplicationPage.test.tsx`: a simulated failure keeps the edits |
| Delete: initial confirmation | `DeleteApplicationPage.test.tsx`: Delete application on the details screen opens the confirmation |
| Delete: delete failure | `DeleteApplicationPage.test.tsx`: a simulated failure keeps the record and the retry succeeds |

The end-to-end test in `app/routes.test.tsx` also walks 11 of the 17 transitions in one session, through the shell, starting from the dashboard.

## 9. Integration strategy

Branch per ticket (`feature/SCRUM-276-applications-ui`), small pull requests into main, shared files (`routes.tsx`, `package.json`, `tokens.css`) settled in Increments 1 and 2 before teammates start. Each feature registers routes through its own index. No feature duplicates the shell.

## 10. Project-plan support (Part V)

Increments map one-to-one to the seven SCRUM-276 dev subtasks. Actual hours are recorded by each owner, never estimated by the assistant. If SCRUM-280 cannot finish by October 20 because teammate modules are late, split it and carry the remainder. Risks to monitor: repository access, missing wireframes, teammate availability, deadline.

## 11. Risks

- Team repository location unknown: blocks Increment 1.
- Wireframes unseen: screens may diverge from Part III.
- Four days to the deadline against roughly 15 hours of SCRUM-276 work.
- Teammate modules may not land; placeholders keep the demo navigable.
- The local folder path contains an exclamation mark, which some Node tooling mishandles; clone elsewhere if problems appear.
- GitHub CLI not authenticated; git operations are manual with approval.

## 12. Definition of Done

Builds and runs reliably; dashboard implemented; four areas reachable; selected screens demonstrate mock functionality; Anthony's screens follow the wireframes; navigation works; mock data consistent; validation and error states demonstrable; no backend required; code modular without unnecessary abstraction; GitHub changes reviewable; teammate contributions integrated; tests run; known limitations documented; Jira and project-plan updates identified; outstanding shared reviews listed.
