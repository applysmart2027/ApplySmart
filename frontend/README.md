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

| Command | What it does |
|---|---|
| `npm run dev` | Starts the dev server with hot reload |
| `npm run build` | Type-checks with `tsc -b`, then writes a production bundle to `dist/` |
| `npm run lint` | Runs oxlint with the rules in `.oxlintrc.json` |
| `npm test` | Runs the Vitest suite once |
| `npm run format` | Rewrites every file with Prettier |
| `npm run format:check` | Fails if any file is not Prettier-formatted |
| `npm run preview` | Serves the last build from `dist/` |

Run `build`, `lint`, `test`, and `format:check` before opening a pull request. All four must pass.

## Layout

Code lives under `src/` and is organised by feature. See `docs/adr/0003-feature-based-structure.md` at the repository root for the folder rules and the import direction. As of Increment 1 only `src/App.tsx`, `src/main.tsx`, and the test setup exist; the shell, routing, and feature folders arrive in later increments.

## Tests

Vitest runs in a jsdom environment with React Testing Library. `src/setupTests.ts` registers the jest-dom matchers. Test files sit next to the code they cover and end in `.test.tsx`. Tests assert what a user sees on screen, not component internals.

## Demo

Nothing to demo yet. The app renders the ApplySmart heading. This section will list the routes and the URLs that show each UI state once the screens exist.

## Known limitations

- No routing, no shell, no screens. Increment 1 is the toolchain only.
- Data will not survive a page refresh. This is by design for the Inception prototype.
