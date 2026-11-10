# ApplySmart backend

The Django project that will serve ApplySmart's data to the React frontend. Today it holds the project settings and one empty app per subsystem; there is no database connection, endpoint or data yet.

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

## Run the checks

You need Python 3.13. These commands were run on Python 3.13.18 on Linux:

```bash
cd backend
python3.13 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
DJANGO_SECRET_KEY=dev-only POSTGRES_PASSWORD=dev-only python manage.py check
```

The last command prints `System check identified no issues (0 silenced).`

The same steps in Windows PowerShell, not yet tested:

```powershell
cd backend
py -3.13 -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
$env:DJANGO_SECRET_KEY = "dev-only"; $env:POSTGRES_PASSWORD = "dev-only"
python manage.py check
```

## Settings

`applysmart/settings.py` reads every value from environment variables. Django stops with a `KeyError` when a required one is missing.

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
| `python manage.py makemigrations <app>` | Writes a migration file for model changes in that app |
| `python manage.py migrate` | Applies migrations to the database |
| `python manage.py runserver` | Starts the development server on port 8000 |

## Known limitations

- `migrate` and `runserver` fail because no PostgreSQL database is set up yet.
- Every app is empty, so no endpoint answers yet.
