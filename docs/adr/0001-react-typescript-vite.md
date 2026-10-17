# ADR-0001: React with TypeScript on Vite for the frontend

| | |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-10-16 |
| **Deciders** | Anthony Vydysh; team review pending |

## Context

The project report from September 2026 names React as the user interface for ApplySmart, with Django and PostgreSQL behind it. Iteration 4 (October 13 to 20, 2026) needs a navigable prototype with no backend, built by four people in parallel, and demonstrable from a fresh clone. Nothing had been scaffolded when this decision was taken.

## Decision

We build the prototype with the Vite `react-ts` template as generated on 2026-10-16: React 19, TypeScript 6, Vite 8, and the template's oxlint configuration. We add Prettier for formatting and Vitest with React Testing Library for tests. The app lives in `frontend/` so a backend can be added beside it later without moving files.

## Consequences

**Positive:** the dev server starts in under a second, the build is a static bundle that runs without a server, and feature contracts between four developers are typed.

**Negative:** TypeScript adds declaration work for teammates who have written only JavaScript. Vite 8, TypeScript 6, and Vitest 5 are all releases from 2026, so a breaking change between them is possible during the iteration. Teammates have not yet reviewed this decision.

**Neutral:** oxlint replaces the ESLint setup older Vite templates shipped. Rules are configured in `.oxlintrc.json`.

## Alternatives considered

**Next.js** - For: the largest React ecosystem and the target of most third-party component kits. Against: a server runtime and file-based routing conventions that the prototype does not need. Why not chosen: every page would carry framework conventions for a static demo.

**Plain JavaScript with Vite** - For: less ceremony, faster for people new to types. Against: the feature boundaries in ADR-0003 rely on typed public exports. Why not chosen: four parallel owners need contracts the compiler checks.

**Create React App** - For: familiar from older tutorials. Against: deprecated and unmaintained. Why not chosen: no longer a supported path.

## References

ApplySmart project report, section "Application Development" (September 2026). Template probe run on 2026-10-16 with `npm create vite@latest -- --template react-ts`.
