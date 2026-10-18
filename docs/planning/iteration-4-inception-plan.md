# Iteration 4: Inception UI Prototype

Jira parent: SCRUM-274. Dates: October 13 to 20, 2026. Plan drafted October 16, 2026. Status: Increments 1 to 3 built and verified; Increment 4 awaiting approval.

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
        store.ts                context and useApplications; the reducer joins in Increment 4
        ApplicationsProvider.tsx  mounts the records once, above the router
        NotBuiltYetPage.tsx     stands in for screens until their increment lands
        validation.ts           pure form rules
        routes.tsx
        ApplicationsListPage.tsx
        ApplicationFormPage.tsx create and edit
        ApplicationForm.tsx
        ResumeSelection.tsx     screen 6, rendered inside the form page
        ApplicationDetailsPage.tsx
        DeleteApplicationPage.tsx
      resumes/                  Hira, SCRUM-277
      matching/                 Nicolas, SCRUM-278
      recommendations/          Nikole, SCRUM-279
    shared/
      ui/                       Button, Field, PageHeader, EmptyState
      styles/tokens.css, base.css
```

Dependency direction: app imports feature indexes and shared; features import shared; shared imports nothing above it; no feature imports another feature's internals.

Routes: `/`, `/applications`, `/applications/new`, `/applications/:id`, `/applications/:id/edit`, `/applications/:id/delete`, `/resumes`, `/matching`, `/recommendations`. Resume selection is a step inside the form page so the draft survives.

State: one provider for application records, defined in the feature, mounted once in App. Reducer actions are the future API swap point. Everything else is local component state.

Cross-feature contracts:

| Interaction | Data owner | Consumer needs | Mechanism |
|---|---|---|---|
| Application shows attached resume | Resumes | id and display name | Records store a `resumeId` only. Where the names and the sample resume list come from is agreed with Hira before Increment 8; applications does not keep its own resume list |
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
| 4 | 276.2 | Create form, validation, mock save, simulated failure | validation tests, create flow test | 3 h |
| 5 | 276.3 | Details screen with resume, notes, contacts, links | render test | 1.5 h |
| 6 | 276.4 | Edit form prefilled, save, cancel, failure | edit flow test, cancel leaves data unchanged | 2 h |
| 7 | 276.5 | Delete confirmation, confirm, cancel, failure | delete flow test | 1.5 h |
| 8 | 276.6 | Resume selection step, sample resumes, mock file pick, attach, cancel | selection flow test | 2 h |
| 9 | 276.7 | End-to-end workflow check, fixes, React and accessibility review | full suite, build, manual script | 2 h |
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
