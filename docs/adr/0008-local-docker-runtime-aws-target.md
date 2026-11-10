# ADR-0008: Docker Compose runs the Architecture Release; AWS is the deployment target

| | |
|---|---|
| **Status** | Proposed, pending team review |
| **Date** | 2026-11-02 |
| **Deciders** | Anthony Vydysh (proposal, Deployment Model lead); the team to review |

## Context

The Architecture Release brief requires a deployment model that allocates every executable element to computational resources, and a working increment. It does not require the increment to run in the cloud. The Capstone Project Report plans AWS. The Django backend and an analysis worker run on ECS with Fargate behind a load balancer, with PostgreSQL on RDS, resume files in private S3 and an SQS queue, monitored by CloudWatch and deployed with GitHub Actions and Terraform. Its iteration plan expects a deployed application by Iteration 5. On 2026-11-02 no backend exists, the team has not confirmed which AWS account it can use, and the release is due 2026-11-17.

## Decision

For the Architecture Release, the increment runs on each developer's machine with Docker Compose: one container for PostgreSQL 18 and one for the Django backend, with the React dev server proxying to it. A fresh clone starts with one command.

The Deployment Model shows the AWS target from the report: browser, load balancer, ECS Fargate tasks for the backend and the worker, RDS, S3, SQS and CloudWatch, with each executable element allocated to its node. The report's Deployment Model section states which parts run today and which are the target.

Deployment to AWS moves to the Elaboration Release, once the team confirms an account and budget. The same container image is used there.

## Consequences

**Positive:** the team builds and tests the increment without waiting on an AWS account or spending budget. Every member runs the same database version. The container image built now is the one ECS runs later.

**Negative:** the report's goals for Iterations 5 to 8 promise a deployed application and must be rewritten. The deployment diagram describes a target that does not run yet, so the report must say so to avoid overstating the increment. Cloud-specific problems such as networking, permissions and cost appear later.

**Neutral:** Terraform and GitHub Actions deployment work moves with the AWS deployment to the Elaboration Release.

## Alternatives considered

**Deploy to AWS by 2026-11-17** - For: matches the report's iteration goals and shows the cloud architecture working. Against: needs a confirmed account and budget now, plus Terraform, networking and permissions work on top of the first backend code, in two weeks. Why not chosen: it puts the 40% product increment at risk for work the brief does not grade.

**A platform service such as Render or Railway** - For: deploys a container in minutes. Against: the report and the course commit to AWS, so the work would be repeated. Why not chosen: no lasting value.

## References

INFO 49635 Architectural Release brief, parts III and IV. Capstone Project Report draft, Cloud Computing section and Iteration Plan. ADR-0007.
