# Accounts

Sign-in for the student using ApplySmart. Owner: Anthony Vydysh (SCRUM-332).

## Routes

None. `SignInGate` shows the Sign in screen at any address until the student is signed in, then shows the app.

## Public surface

`index.ts` exports `SignInGate`, which `src/app/App.tsx` mounts once around everything else. No feature imports this folder.

## Code

`SignInGate.tsx` asks `GET /api/session/` whether someone is signed in. While it waits it shows "Checking sign-in…". The form posts to `POST /api/session/` with the `csrftoken` cookie value in an `X-CSRFToken` header. `backend/README.md` describes both endpoints.

## Tests

`SignInGate.test.tsx` replaces `fetch` with stubbed answers, so it needs no backend. Run it with `npm test` from `frontend/`.
