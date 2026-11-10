# ADR-0006: Layered information system architecture with domain-driven layers

| | |
|---|---|
| **Status** | Proposed, pending team review |
| **Date** | 2026-11-02 |
| **Deciders** | Anthony Vydysh (proposal); Nicolas Mesti as software architect and the team to review |

## Context

The Architecture Release brief asks the team to name the type of system, choose a reference application architecture and an architectural pattern, and give the rationale for each. The Design Model, the interaction model and the working increment must all follow that choice, so it has to come before any of them.

ApplySmart stores and retrieves each student's own records: application records, resume versions, preferences and reminders. Around that it runs slower text analysis on resumes and job postings, which the Capstone Project Report plans as a background worker fed by a queue. Four students own four functional areas and build them in parallel. The frontend already separates the areas into feature folders with one public surface each (ADR-0003). The brief recommends a layered architecture in its Domain-Driven Design form when no other pattern fits better.

## Decision

ApplySmart is an information management system: a support system that keeps a student's job search information and helps them act on it.

The reference application architecture is the information system architecture in Sommerville, chapter 6: a user interface, then user communications with authentication and authorization, then information retrieval and modification, then transaction management, then the database. Resume parsing and comparison use batch processing behind a queue, which later releases add to the infrastructure layer.

The architectural pattern is a layered architecture in its Domain-Driven Design form, with client and server split across the network:

| Layer | Holds | Runs in |
|---|---|---|
| Presentation | React screens, and the REST endpoints that receive requests and return JSON | Browser, backend |
| Application | One service per use case, such as `CreateApplicationRecord`, which checks access and coordinates the work | Backend |
| Domain | Entities, value objects and business rules, such as `ApplicationRecord`, `ApplicationStatus` and record ownership, in plain Python | Backend |
| Infrastructure | Persistence through the Django ORM and PostgreSQL, and later file storage, the queue and the analysis worker | Backend, AWS |

Each layer is divided into subsystems: one per functional area (Applications, Resumes, Matching, Recommendations) and one for Accounts, which owns sign-in and the current student. A layer depends only on the layer below it, and the domain layer imports nothing from Django. A subsystem calls another subsystem only through that subsystem's application services, never through its models or tables.

## Consequences

**Positive:** the Design Model's layers and subsystems map one to one onto folders, so the class diagrams and the code can be checked against each other. Business rules live in plain Python and are tested without a database. Each owner works in their own subsystem, as on the frontend.

**Negative:** Django's own style puts rules in models and views; keeping a separate domain layer adds mapping code between ORM models and domain objects, about one small function per entity. Every teammate must learn and keep the dependency rule, and nothing enforces it automatically. The architecture is a proposal until the team, and Nicolas as software architect, accept it.

**Neutral:** the backend subsystems mirror the frontend feature folders, so one functional area has the same name on both sides.

## Alternatives considered

**Django's default model, view and template structure** - For: the least code and what most Django tutorials show. Against: business rules end up spread across views, serializers and models, and the layers the brief asks for would not be visible in the code. Why not chosen: the Design Model and the code would not match.

**Microservices, one per functional area** - For: hard boundaries between owners and independent deployment. Against: four services, four databases and network calls between them for a four-person team with two weeks to the first increment. Why not chosen: the operational cost buys nothing at this size.

**Pipe and filter or event-driven as the main pattern** - For: fits resume parsing and comparison, which transform documents in stages. Against: most of ApplySmart is record management, which those patterns do not describe. Why not chosen: used only inside the analysis worker, as noted above.

## References

Ian Sommerville, Software Engineering, 10th edition, chapter 6, Architectural design. INFO 49635 Architectural Release brief, part I. Capstone Project Report draft, sections Solution Description and Cloud Computing. ADR-0003.
