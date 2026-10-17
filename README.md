# ApplySmart

ApplySmart helps students keep track of their job, internship, and co-op applications and see how their resumes line up with the postings they apply to. This repository holds the Inception Release prototype: a navigable React interface with hard-coded data and no backend.

## Functional areas and owners

| Area | Owner | Code |
|---|---|---|
| Job Discovery and Application Tracking | Anthony Vydysh | `frontend/src/features/applications/` |
| Resume Management and Parsing | Hira Ahmad | `frontend/src/features/resumes/` |
| Resume Matching and Gap Analysis | Nicolas Mesti | `frontend/src/features/matching/` |
| Recommendations, Analytics and Follow-ups | Nikole Phipps Santos | `frontend/src/features/recommendations/` |

The shell, dashboard, and routing under `frontend/src/app/` are shared. Feature folders are created as each owner starts work.

## Run the prototype

```bash
git clone https://github.com/applysmart2027/ApplySmart.git
cd ApplySmart/frontend
npm install
npm run dev
```

[frontend/README.md](frontend/README.md) lists every script and the checks to run before a pull request.

## Documents

- [Iteration 4 plan](docs/planning/iteration-4-inception-plan.md): goals, architecture, increments, and open decisions for the Inception UI prototype.
- [Architecture decision records](docs/adr/): why the stack, styling, folder structure, and state ownership are what they are.

## Working in this repository

- One branch per Jira ticket, named like `feature/SCRUM-276-applications-ui`, merged to `main` through a pull request.
- Commit messages follow Conventional Commits with the Jira key at the end of the subject, for example `feat(applications): add records list (SCRUM-276)`.
- Change only your own feature folder unless the change was agreed with the owner of the folder you touch.
