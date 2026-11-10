# ADR-0007: Django REST backend with PostgreSQL in `backend/`

| | |
|---|---|
| **Status** | Proposed, pending team review |
| **Date** | 2026-11-02 |
| **Deciders** | Anthony Vydysh (proposal); Nicolas Mesti as software architect and the team to review |

## Context

The Architecture Release increment must run architecturally significant use cases end to end, which needs a backend and a database. The Capstone Project Report names Django and PostgreSQL, and plans spaCy and scikit-learn for resume analysis, both Python libraries. No backend code exists yet. ADR-0006 proposes the layers the backend must show.

## Decision

The backend is Django 6.1 with Django REST framework 3.18 on Python 3.13, storing data in PostgreSQL 18. It lives in `backend/` beside `frontend/`, as ADR-0001 anticipated.

One Django project holds one app per subsystem: `accounts`, `applications`, and later `resumes`, `matching` and `recommendations`. Inside an app, files follow the layers of ADR-0006:

| File | Layer |
|---|---|
| `api.py` | Presentation: REST views and serializers |
| `services.py` | Application: one function per use case |
| `domain.py` | Domain: plain Python rules and value objects |
| `models.py`, `repository.py` | Infrastructure: Django ORM models and the functions that load and save them |

The React app calls the backend under `/api/`. In development, Vite proxies `/api/` to Django so the browser sees one origin. Sign-in uses Django's built-in session authentication with CSRF protection.

## Consequences

**Positive:** Django supplies the ORM, migrations, authentication and an admin site, so the team writes ApplySmart's rules rather than plumbing. The analysis worker in later releases shares the same language and models. A same-origin session cookie avoids storing tokens in the browser.

**Negative:** teammates who have only written React must learn Python, Django and DRF during the release. Django 6.1 and DRF 3.18 were both released in 2026, so their compatibility is checked when the project is set up, not assumed. Session authentication needs CSRF handling in the frontend's API calls.

**Neutral:** Python 3.13 is chosen over 3.14, which Django 6.1 also supports, so that the analysis libraries planned for later releases are more likely to have published wheels.

## Alternatives considered

**FastAPI** - For: typed, fast, and lighter than Django. Against: no built-in ORM, migrations, authentication or admin; the team would assemble them. Why not chosen: more code to own, and the report already names Django.

**Node.js with Express** - For: the same language as the frontend. Against: the planned NLP libraries are Python, so analysis would need a second runtime. Why not chosen: two languages on the backend.

**Token authentication with JWT** - For: common in single-page apps and stateless. Against: token storage, refresh and revocation become the team's problem. Why not chosen: the app is served from one origin, where sessions do the same job with less code.

**SQLite during development** - For: nothing to install. Against: behaviour differs from PostgreSQL in types and constraints. Why not chosen: Docker runs PostgreSQL locally at no extra cost (ADR-0008).

## References

Django download page and supported versions table, read 2026-11-02: 6.1 is the current release and supports Python 3.12 to 3.14. Django REST framework 3.18.0, released August 2026. PostgreSQL 18, current minor 18.6 on 2026-08-13. Capstone Project Report draft, Solution Description and Advanced Areas sections. ADR-0001, ADR-0006.
