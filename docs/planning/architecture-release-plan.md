# Architecture Release plan

Release: Architecture, due 2026-11-17 (Week 10), 25% of the course grade. Plan drafted 2026-11-02 by Anthony Vydysh. Status: proposed; the team has not yet accepted ADR-0006 to ADR-0008. This plan covers Anthony's part of the release and the decisions his part depends on; each teammate plans their own part.

## 1. Goals

- Propose the architecture the release is graded on: the system type, the reference application architecture and the architectural pattern (ADR-0006), the backend stack (ADR-0007) and the runtime (ADR-0008).
- Realize one architecturally significant use case, Create Application Record, through every layer: design it in the Interaction Model, then build it from the React form to PostgreSQL.
- Lead the Deployment Model: one UML deployment diagram of the AWS target and its description in the report.
- Keep Anthony's Jira items and risks up to the brief's part V rules, with Anthony making every change himself.

## 2. Scope and non-goals

In scope for Anthony:

- The Applications subsystem class diagram in the Design Model.
- The Create Application Record collaboration and its three diagrams.
- The deployment diagram.
- Backend code that creates and lists a student's own application records, with the minimum sign-in that ownership needs (decision O1).
- Frontend changes in `features/applications/` that call the API.
- Tests for all of the above, and the report sections listed in section 8.

Out of scope: deployment to AWS, which ADR-0008 moves to Elaboration; Terraform and CI pipelines; viewing, editing or deleting records on the backend, a stretch goal only (O6); job discovery; and every other functional area. Teammates' folders, models and Jira items are theirs.

## 3. Starting point on 2026-11-02

- Repository: the React prototype at commit `7dda5d8` builds and passes 119 tests. No backend exists.
- Visual Paradigm: the Design, Interaction and Deployment models exist but are empty.
- Jira: the backlog already holds the stories this use case needs (section 7). No sprint exists for Iterations 5 to 8.
- Report: the Project Architecture subsections still hold the template's instructions.

## 4. Proposed architecture

ApplySmart is an information management system built on Sommerville's information system reference architecture, as a layered architecture in its Domain-Driven Design form (ADR-0006). Each layer is split into subsystems: Accounts, Applications, Resumes, Matching and Recommendations.

```text
Presentation     React screens            REST endpoints (api.py)
Application      use case services (services.py)
Domain           rules and value objects (domain.py), no Django imports
Infrastructure   ORM models and repository (models.py, repository.py), PostgreSQL
```

Backend layout proposed by ADR-0007:

```text
backend/
  manage.py, requirements.txt, Dockerfile
  applysmart/          settings, root URL table
  accounts/            sign-in, current student
  applications/        api.py, services.py, domain.py, models.py, repository.py, tests/
compose.yaml           postgres:18 and the backend
```

## 5. Create Application Record realization

This is the design the Interaction Model records and the code follows. Names are proposals until the collaboration is drawn.

| Layer | Element | Responsibility |
|---|---|---|
| Presentation, browser | `CreateApplicationPage`, `ApplicationForm`, an `applicationsApi` client | Collect the fields, show validation messages, send the request with the CSRF token |
| Presentation, backend | `ApplicationRecordsView`, `ApplicationRecordSerializer` | Accept `POST /api/applications/` and `GET /api/applications/`, turn JSON into a draft and back |
| Application | `create_application_record(student, draft)`, `list_application_records(student)` | Require a signed-in student, apply the domain rules, save, return the record |
| Domain | `ApplicationRecord`, `ApplicationStatus` | Job title and employer required, posting URL and contact email checked, status from the agreed list (D5), record owned by exactly one student |
| Infrastructure | `ApplicationRecordModel`, `repository.save`, `repository.list_for_student` | Store and load records in PostgreSQL |
| Accounts | `current_student(request)` | Identify the signed-in student for the request |

Main success scenario for the sequence diagram:

1. The student submits the form, and the page posts the draft.
2. The view checks the request's shape and calls the service with the current student.
3. The service builds an `ApplicationRecord`, which checks the rules.
4. The repository saves the record, and the view returns 201 with it.
5. The page returns to the list, which loads the student's records from the API.

Extensions:

- Invalid fields return 400 with one message per field, and the form shows them as it does today.
- A request without a signed-in student returns 403, and the app shows the sign-in screen.
- A database failure returns 500, and the form keeps the entries and shows the save failure message.

The business rule Student Application Record Ownership from the Requirements Model is enforced in the service and tested with a second student's request.

## 6. Increments

Each code increment follows the build protocol in `CLAUDE.md`: plan, approval, build, checks, summary, and a commit Anthony makes himself.

| # | Work | Jira | Depends on | Verify |
|---|---|---|---|---|
| 1 | Bring ADR-0006 to ADR-0008 and this plan to the team; record the decisions | SCRUM-81 | none | Team decision recorded in the ADR status lines |
| 2 | Applications subsystem class diagram in the Design Model, inside Nicolas's `Software System Architecture` | SCRUM-29 | 1, Nicolas's architecture diagram | Diagram committed to VPository with a description |
| 3 | Collaboration `Create Application Record` with `Collaboration Overview`, `Structural Overview` and `Behavioural Overview` diagrams | SCRUM-29 | 2 | Diagrams match section 5; committed to VPository |
| 4 | Deployment diagram of the AWS target, with the local Docker runtime noted | SCRUM-75 | 1 | Every executable element allocated to a node |
| 5 | Backend scaffold: Django project, `compose.yaml`, PostgreSQL, a health endpoint, the test runner | SCRUM-322 | 1 | `docker compose up` from a fresh clone; tests pass |
| 6 | Sign-in for seeded students: session login and logout endpoints, `current_student`, a sign-in screen | SCRUM-26 | 5, O1 | Tests for valid, invalid and missing credentials |
| 7 | Create and list application records: domain, service, repository, migration, API, tests | SCRUM-18, SCRUM-20, SCRUM-21 | 5, 6, D5 | Tests for valid, invalid and cross-student requests |
| 8 | Frontend: the list and the create form use the API; the other screens keep their current behaviour (O6) | SCRUM-18 | 7 | Existing tests updated and passing; manual run through sign-in, create, refresh |
| 9 | Release check: fresh clone runs, READMEs and known limitations current, traceability row filled, source archive built | none yet | 8 | Demo script followed on a clean machine |
| 10 | Report sections in section 8 | to be agreed with Hira | 3, 4, 8 | Hira merges them into the report |

## 7. Jira

The backlog already holds the PBIs for this use case. Anthony decides when to move them into a sprint and makes every change himself. Part V needs story points on each PBI, dev subtasks with an effort estimate, actual hours logged, and a comment each time a PBI is worked on.

| PBI | Points | Dev subtasks | Gap |
|---|---|---|---|
| SCRUM-18 Manually save a job application | 5 | SCRUM-28 to 31 | Subtasks have no effort estimates |
| SCRUM-20 Validate and save application records | 3 | SCRUM-49 to 51 | None |
| SCRUM-21 Implement application-record persistence | 3 | SCRUM-52 to 54 | None |
| SCRUM-26 Validate credentials and enforce session access | none | SCRUM-69 to 71 | No story points |
| SCRUM-75 Design the cloud deployment model | none | none | No points and no subtasks |

No task exists yet for the report sections or the backend scaffold. Iterations 7 (2026-11-03 to 11-10) and 8 (2026-11-10 to 11-17) do not exist in Jira; the scrum master creates them.

Risks: ARMP-4 (scope growth) and ARMP-5 (workload) are Anthony's. Each gets a monitoring comment at each sprint review.

## 8. Report sections

Hira coordinates the report. Anthony drafts:

- Deployment Model: the diagram, each node and what runs on it, and a plain statement of what runs today and what is the target.
- Cloud Architecture: the AWS services and how they connect, from the report's Cloud Computing section.
- His part of System Components and of the realized use cases: Create Application Record, the layers it crosses, and its three interaction diagrams.

## 9. Schedule

| Dates | Anthony's work | Needs from the team |
|---|---|---|
| 2026-11-03 to 11-04 | Increment 1; start increment 4 | Decisions O1 to O5; each member names their use case |
| 2026-11-05 to 11-07 | Increments 2, 3 and 4; increment 5 if O2 assigns it to Anthony | Nicolas's `Software System Architecture` diagram |
| 2026-11-08 to 11-11 | Increments 6 and 7 | D5 decided |
| 2026-11-12 to 11-14 | Increments 8 and 9 | Teammates' parts merged into `main` |
| 2026-11-15 to 11-16 | Increment 10; buffer | Report assembled |
| 2026-11-17 | Submission | |

## 10. Decisions pending

- O1 Sign-in scope. Recommended: seeded student accounts with session sign-in and sign-out, no registration. Ownership then rests on a real identity. Alternative: a fixed development student, which is less work but leaves the ownership rule untested.
- O2 Decided 2026-11-09: Anthony builds the backend scaffold in `backend/` and `compose.yaml` (SCRUM-322). Nicolas leads backend integration in the report's responsibility matrix and is fine with this.
- O3 How the React build is served on AWS: from S3 behind CloudFront with `/api/` routed to the load balancer, or by the backend container. Either way the browser must see one origin for the session cookie (ADR-0007). This changes the deployment diagram.
- O4 Whether ADR-0006 to ADR-0008 are accepted, changed or replaced. Since 2026-11-09 the backend is built on them while the team review is still open.
- O5 D5 (application status values) and D6 (optional contact fields), open since Inception; the database schema depends on both.
- O6 What the details, edit and delete screens do once the list comes from the API. Recommended: they keep their prototype behaviour on the loaded records, and the known limitations say changes there are not saved. Backend update and delete are a stretch goal.

## 11. Risks

- The team does not decide O1 to O5 by 2026-11-04. Every later increment moves with it.
- Python, Django and DRF are new to most of the team; increments 5 to 7 are the first backend code anyone writes in this project.
- Django 6.1 and DRF 3.18 compatibility is unverified until increment 5 installs them.
- Docker on Windows needs WSL 2, and the local folder path contains `!`, which some tools mishandle.
- The report's iteration goals promise a deployed application; until the team rewrites them, the report and the increment disagree.

## 12. Definition of done for Anthony's part

The collaboration and its three diagrams, the Applications subsystem class diagram and the deployment diagram are committed to VPository. A fresh clone starts with `docker compose up`; a seeded student signs in, creates an application record, sees it in the list after a refresh, and cannot see another student's records. Backend and frontend tests pass. READMEs, known limitations and this plan match the code. Anthony's report sections are with Hira. His Jira PBIs have points, estimated subtasks, logged hours and comments.
