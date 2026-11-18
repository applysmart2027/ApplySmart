# ADR-0006: Layered information system architecture with domain-driven layers

| | |
|---|---|
| **Status** | Accepted |
| **Date** | 2026-11-02 |
| **Deciders** | Anthony Vydysh, Nicolas Mesti, Hira Ahmad, Nikole Phipps Santos |

## Context

The Architecture Release brief asks the team to name the type of system, choose a reference application architecture and an architectural pattern, and give the rationale for each. The Design Model, the Interaction Model and the working increment must all follow that choice, so the architecture decision comes before those deliverables.

ApplySmart stores and retrieves each student's own records, including application records, resume versions, preferences and reminders. Around that it runs slower text analysis on resumes and job postings, which the Capstone Project Report plans as a background worker fed by a queue. Four students own four functional areas and build them in parallel. The frontend already separates the areas into feature folders with one public surface each (ADR-0003). The Architecture Release brief recommends a layered architecture in its Domain-Driven Design form when no other pattern fits better.

## Decision

ApplySmart is an information management system: a support system that keeps a student's job-search information and helps them act on it.

The reference application architecture is the information system architecture in Sommerville, chapter 6: a user interface, then user communications with authentication and authorization, then information retrieval and modification, then transaction management, then the database. Resume parsing and comparison use batch processing behind a queue, which later releases add to the Infrastructure layer.

### Reference application architecture comparison

The team considered the application architecture types described by Sommerville.

**Transaction processing architecture** fits the parts of ApplySmart that create, retrieve and update records, but it focuses mainly on individual transactions and does not describe the broader information-management responsibilities of the system.

**Information system architecture** is the best overall fit because ApplySmart provides a user interface, authentication and authorization, information retrieval and modification, transaction management and persistent storage for student job-search information.

**Language processing architecture** is relevant to resume parsing and resume-to-job analysis, but it applies mainly to the analysis worker rather than the entire system.

For these reasons, the information system architecture is selected as ApplySmart's reference application architecture. The analysis worker can still use processing techniques appropriate to text analysis without making them the architecture of the whole system.

The architectural pattern is a layered architecture in its Domain-Driven Design form, with client and server split across the network. The layer names match the Design Model used in Visual Paradigm:

| Layer | Holds | Runs in |
|---|---|---|
| User Interface | React screens and the REST API endpoints that receive requests and return JSON | Browser, backend |
| Application Logic | One service per use case, such as `CreateApplicationRecord`, which checks access and coordinates the work | Backend |
| Domain Layer | Entities, value objects and business rules, such as `ApplicationRecord`, `ApplicationStatus` and record ownership, in plain Python | Backend |
| Infrastructure | Persistence through the Django ORM and PostgreSQL, plus file storage, the queue and the analysis worker | Backend, AWS |

Each layer is divided into subsystems: one per functional area (Applications, Resumes, Matching and Recommendations) and one for Accounts, which owns sign-in and the current student.

Dependencies follow the layered architecture used in the Design Model. The User Interface depends on Application Logic. Application Logic coordinates the Domain Layer and uses Infrastructure services when persistence or external resources are required. Infrastructure implements technical services while depending on Domain Layer concepts where necessary. The Domain Layer remains independent of Django and other infrastructure technologies.

Between functional areas, one subsystem communicates with another through its Application Logic rather than directly through another subsystem's domain models, database tables or infrastructure classes. For example, Matching can use the application services provided by Resumes and Applications without directly accessing their internal models.

## Consequences

**Positive:** the Design Model's layers and subsystems map closely onto the planned code structure, so the class diagrams and implementation can be checked against each other. Business rules remain in plain Python and can be tested without a database. Each team member can work primarily within their assigned subsystem, matching the ownership already used in the frontend.

**Negative:** Django's default style often places rules directly in models and views. Keeping separate Application Logic and Domain Layer responsibilities adds some mapping and coordination code between Django ORM models and domain objects. Every teammate must also follow the dependency rules consistently because the architecture does not enforce them automatically.

**Neutral:** the backend subsystems mirror the frontend feature folders, so each functional area keeps the same name across the frontend, backend and design diagrams.

## Alternatives considered

**Django's default model, view and template structure** - For: the least code and what most Django tutorials show. Against: business rules can become spread across views, serializers and models, and the layers required by the Architecture Release brief would not be clearly visible in the implementation. Why not chosen: the Design Model and the code would not align as clearly.

**Microservices, one per functional area** - For: strong boundaries between owners and independent deployment. Against: multiple services, databases and network calls would create unnecessary operational complexity for a four-person capstone team and the current project scope. Why not chosen: the added deployment and communication cost is not justified at this size.

**Pipe and filter or event-driven as the main pattern** - For: these patterns fit resume parsing and comparison because those tasks transform information through processing stages. Against: most of ApplySmart is interactive information and record management, which those patterns do not describe well. Why not chosen: these approaches are better suited to parts of the analysis worker rather than the architecture of the whole system.

## References

Ian Sommerville, *Software Engineering*, 10th edition, chapter 6, Architectural Design. INFO 49635 Architectural Release brief, Part I. Capstone Project Report draft, sections Solution Description and Cloud Computing. ADR-0003.
