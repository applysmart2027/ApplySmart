# ApplySmart backend

The Django project that will serve ApplySmart's data to the React frontend. Today it holds the project settings, sign-in in `accounts/`, a health endpoint, and one empty app for each other subsystem. Docker Compose runs it with a PostgreSQL 18 database, which holds only Django's own user and session tables so far.

## Apps

Each app is one subsystem from ADR-0006. The root README lists who owns each one.

| App | Responsible for |
|---|---|
| `accounts/` | Sign-in, sign-out and the signed-in student that the other apps work for |
| `applications/` | A student's application records |
| `resumes/` | Resume files, versions and parsing |
| `matching/` | Comparing a resume with a job posting: match score, covered and missing requirements |
| `recommendations/` | Job recommendations, progress analytics and follow-up reminders |

Work only in your own app. To use another app's data, call a function in its `services.py` and agree with its owner what it returns; never import its models or repository.

## Endpoints

| Request | Answer |
|---|---|
| `GET /api/health/` | 200 and `{"status": "ok"}` |
| `GET /api/session/` | 200 and the signed-in student as `{"id", "name", "email"}`, or 403 when nobody is signed in. It also sets the `csrftoken` cookie |
| `POST /api/session/` with `{"username", "password"}` | 200, the student, and a session cookie. 400 when a field is missing or the username or password is wrong |
| `DELETE /api/session/` | 204, and the student is signed out |

Every endpoint needs a signed-in student unless its view sets `permission_classes = [AllowAny]`; `REST_FRAMEWORK` in `settings.py` makes that the default. A browser request that changes data (POST, PUT, PATCH, DELETE) must send the value of the `csrftoken` cookie in an `X-CSRFToken` header, or Django answers 403.

To know which student a request is for, call `current_student(request)` from `accounts/services.py`. It returns a `Student` with `id`, `name` and `email`, or `None` when nobody is signed in.

## Sample students

There is no registration. `docker compose up` runs `python manage.py seed_students`, which creates two students if they do not exist yet:

| Username | Name |
|---|---|
| `maya.okafor` | Maya Okafor |
| `daniel.reyes` | Daniel Reyes |

Both use the password `applysmart-demo`. Running the command again changes nothing.

## Where code goes

Every app has the same five files, one per layer of ADR-0006.

| File | Put here | Planned example |
|---|---|---|
| `api.py` | HTTP endpoints: read the request, call a service, return JSON | `POST /api/applications/` |
| `services.py` | One function per use case. It checks the student may do this and coordinates the work | `create_application_record(student, draft)` |
| `domain.py` | Business rules in plain Python, with no Django imports | "Job title is required" |
| `repository.py` | Functions that save and load through the models and return domain objects | `save(record)` |
| `models.py` | Database tables as Django models | `ApplicationRecordModel` |

`api.py` calls `services.py`. `services.py` calls `domain.py` and `repository.py`. `repository.py` uses `models.py` and builds objects from `domain.py`. `domain.py` imports none of the other four.

## Common changes

| Change | Where |
|---|---|
| Fix or add a business rule | `domain.py` in your app |
| Add a field to a table | `models.py`, then run `python manage.py makemigrations <app>` and commit the new file in `<app>/migrations/` |
| Add an endpoint | The view in `api.py`, and its path in `applysmart/urls.py` |

## Run with Docker

Docker runs the backend and a PostgreSQL 18 database together, so you do not need Python or PostgreSQL on your machine. You need Docker Desktop with Docker Compose. These commands were run with Docker Desktop on Windows.

From the repository root, copy the example settings once, then start both containers:

```bash
cp .env.example .env
docker compose up --build
```

In PowerShell, the copy command is `Copy-Item .env.example .env`. The backend applies the migrations, creates the sample students, and then serves on port 8000. Open http://localhost:8000/api/health/ to see `{"status": "ok"}`. While the frontend dev server runs, the same endpoint answers at http://localhost:5173/api/health/, because Vite forwards `/api/` to port 8000.

Run the tests in a second terminal:

```bash
docker compose run --rm backend python manage.py test
```

Any other Django command runs the same way: `docker compose run --rm backend python manage.py <command>`. Code changes in `backend/` reload without a rebuild; after a change to `requirements.txt`, start again with `docker compose up --build`.

`docker compose down` stops the containers and keeps the database. `docker compose down -v` also deletes the database.

## Run without Docker

You need Python 3.13 and a PostgreSQL server. The tests create and drop their own database, so the database user needs permission to create databases. Without a server, only `check` works. These commands were run on Python 3.13.18 with PostgreSQL 16 on Linux:

```bash
cd backend
python3.13 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export DJANGO_SECRET_KEY=dev-only POSTGRES_PASSWORD=<database password>
python manage.py check
python manage.py test
```

`check` prints `System check identified no issues (0 silenced).` and `test` ends with `OK`.

The same steps in Windows PowerShell, not yet tested:

```powershell
cd backend
py -3.13 -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
$env:DJANGO_SECRET_KEY = "dev-only"; $env:POSTGRES_PASSWORD = "<database password>"
python manage.py check
python manage.py test
```

Put the tests for your app in `<app>/tests.py`, as `accounts/tests.py` does. The health endpoint test is in `applysmart/tests.py`.

## Settings

`applysmart/settings.py` reads every value from environment variables. Django stops with a `KeyError` when a required one is missing. With Docker, the values come from `.env`, and `compose.yaml` sets `POSTGRES_HOST` to `db`.

| Variable | Required | Default |
|---|---|---|
| `DJANGO_SECRET_KEY` | Yes | |
| `POSTGRES_PASSWORD` | Yes | |
| `DJANGO_DEBUG` | No | Off; set `1` to turn on |
| `DJANGO_ALLOWED_HOSTS` | No | Empty; a comma-separated list |
| `POSTGRES_DB` | No | `applysmart` |
| `POSTGRES_USER` | No | `applysmart` |
| `POSTGRES_HOST` | No | `localhost` |
| `POSTGRES_PORT` | No | `5432` |

## Django commands

| Command | What it does |
|---|---|
| `python manage.py check` | Finds mistakes in settings and models without running anything |
| `python manage.py test` | Runs every test in files whose name starts with `test` |
| `python manage.py makemigrations <app>` | Writes a migration file for model changes in that app |
| `python manage.py migrate` | Applies migrations to the database |
| `python manage.py runserver` | Starts the development server on port 8000 |
| `python manage.py seed_students` | Creates the sample students that do not exist yet |

## Known limitations

- Only `accounts/` has code. The other four apps are empty.
- There is no registration, password reset or account page. The sample students are the only accounts.
