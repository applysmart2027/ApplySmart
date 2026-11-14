# ApplySmart

ApplySmart helps students keep track of their job, internship, and co-op applications and see how their resumes line up with the postings they apply to. The `frontend/` folder holds the React interface. It signs students in through the backend; every screen after sign-in still runs on hard-coded sample data. The `backend/` folder holds the Django project and its PostgreSQL database, which run in Docker; so far the backend handles sign-in and a health check.

## Functional areas and owners

| Area | Owner | Frontend | Backend |
|---|---|---|---|
| Job Discovery and Application Tracking | Anthony Vydysh | `frontend/src/features/applications/` | `backend/applications/` |
| Resume Management and Parsing | Hira Ahmad | `frontend/src/features/resumes/` | `backend/resumes/` |
| Resume Matching and Gap Analysis | Nicolas Mesti | `frontend/src/features/matching/` | `backend/matching/` |
| Recommendations, Analytics and Follow-ups | Nikole Phipps Santos | `frontend/src/features/recommendations/` | `backend/recommendations/` |
| Accounts: sign-in and the signed-in student | Anthony Vydysh | `frontend/src/features/accounts/` | `backend/accounts/` |

The shell, dashboard, and routing under `frontend/src/app/` and the project settings under `backend/applysmart/` are shared.

## Run the app

You need Docker Desktop for the backend and Node.js 24 for the frontend. Start the backend and its database from the repository root:

```bash
git clone https://github.com/applysmart2027/ApplySmart.git
cd ApplySmart
cp .env.example .env
docker compose up --build
```

In PowerShell, copy the settings with `Copy-Item .env.example .env`. Then start the frontend in a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 and sign in as `maya.okafor` or `daniel.reyes` with the password `applysmart-demo`. These are sample accounts the backend creates when it starts. After sign-in the screens still use sample data.

[frontend/README.md](frontend/README.md) lists every script and the checks to run before a pull request. [backend/README.md](backend/README.md) explains what each backend app is for, where code goes, and how to run its tests.

## Documents

- [Architecture Release plan](docs/planning/architecture-release-plan.md): the proposed architecture, the Create Application Record increments, and the decisions still open.
- [Iteration 4 plan](docs/planning/iteration-4-inception-plan.md): goals, architecture, increments, and open decisions for the Inception UI prototype.
- [Architecture decision records](docs/adr/): why the stack, styling, folder structure, and state ownership are what they are.

## Working in this repository

- One branch per Jira ticket, named like `feature/SCRUM-276-applications-ui`, merged to `main` through a pull request.
- Commit messages follow Conventional Commits with the Jira key at the end of the subject, for example `feat(applications): add records list (SCRUM-276)`.
- Change only your own feature folder unless the change was agreed with the owner of the folder you touch.
