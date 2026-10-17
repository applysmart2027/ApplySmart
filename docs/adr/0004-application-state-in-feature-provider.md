# ADR-0004: Application records live in one provider owned by the applications feature

| | |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-10-16 |
| **Deciders** | Anthony Vydysh; team review pending |

## Context

The list, details, edit, and delete screens must show the same records, and a record created in the session must stay visible after the user visits the dashboard and comes back. The resume selection screen must not lose a half-filled form. There is no backend, and the prototype may reset on refresh. The project rules forbid a state library without a demonstrated need.

## Decision

The applications feature defines `ApplicationsProvider`, a React context backed by `useReducer`, and exports it with a `useApplications()` hook from its `index.ts`. `App` mounts the provider once above the router so the records outlive page navigation. The reducer is the only code that creates, updates, or removes records. Form state and the search, filter, and sort controls stay in component state. The resume selection screen renders as a step inside the form page, so the form stays mounted and its draft is preserved without extra state.

## Consequences

**Positive:** one source of truth for records. Replacing mock data with an API later means changing the reducer's actions, not the pages. Tests render a page inside the provider and assert through the screen.

**Negative:** `App.tsx` gains one provider for each feature that needs cross-page state. Every consumer re-renders on any record change, which is acceptable for a few dozen records and would need selectors at larger sizes. Records reset on refresh, which the specification accepts for this prototype.

**Neutral:** the resume selection screen has no URL of its own. If the demo needs one, a nested route under the form page keeps the draft alive at the cost of route configuration.

## Alternatives considered

**A state library** (Zustand or Redux Toolkit) - For: selectors, devtools, and no provider wiring. Against: a dependency for a few actions on one array. Why not chosen: no demonstrated need.

**A module-level store with `useSyncExternalStore`** - For: no provider to mount, state survives navigation by construction. Against: less familiar to students than context and reducers. Why not chosen: readability for four developers outweighs the saved provider line.

**Persisting to localStorage** - For: records survive refresh. Against: outside the Inception scope, and the specification states persistence is not required. Why not chosen: scope.

## References

ApplySmart UI specification, sections 9, 11, and 12 (received 2026-10-16). CLAUDE.md, "Architecture rules".
