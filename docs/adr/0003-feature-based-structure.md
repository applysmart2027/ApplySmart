# ADR-0003: Feature-based folders with one public surface per feature

| | |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-10-16 |
| **Deciders** | Anthony Vydysh; team review pending |

## Context

Four people own four functional areas and work in parallel in one repository. Each area must be understandable and changeable without reading the others, and merge conflicts in shared files must stay rare. The application still needs one shell, one dashboard, and one route table.

## Decision

Code is organised by feature under `src/`:

- `app/` composes the application: router, shell, dashboard, and the route table.
- `features/<area>/` holds everything one area owns: pages, components, data, types, tests, and an `index.ts` that is its only public surface.
- `shared/ui/` and `shared/styles/` hold pieces that two or more features use the same way.

Dependencies point one way: `app` imports feature indexes and `shared`; features import `shared`; `shared` imports nothing from `app` or `features`. A feature never imports another feature's internals, only its `index.ts`, and only through a contract both owners agreed. Each feature exports a route array that `app/routes.tsx` spreads, so after Increment 2 no teammate edits a shared file to add a screen.

## Consequences

**Positive:** a conflict can only happen inside one owner's folder or in the four shared files settled before parallel work starts. A reviewer can read one feature folder and its index and know the whole area.

**Negative:** nothing enforces the import direction automatically; reviewers check it by hand. Two features may hold similar small components for a while rather than share them early, which is accepted over premature abstraction.

**Neutral:** the structure matches the Jira breakdown, one feature folder per owner's ticket.

## Alternatives considered

**Folders by type** (`components/`, `pages/`, `hooks/`) - For: the layout most tutorials use. Against: every feature touches every folder, so four people collide constantly. Why not chosen: it works against parallel ownership.

**One package per feature in a monorepo** - For: hard boundaries the tooling enforces. Against: workspace configuration, build graphs, and version pinning for a one-week prototype. Why not chosen: cost without a proportional benefit at this size.

**Lint-enforced boundaries** (an ESLint boundaries plugin) - For: automatic checking of the import rule. Against: oxlint, the template's linter, has no equivalent rule. Why not chosen now: revisit if manual review misses violations.

## References

CLAUDE.md, "Architecture rules". `docs/planning/iteration-4-inception-plan.md`, section 4.
