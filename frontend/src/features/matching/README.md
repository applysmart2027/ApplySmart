# Matching

Resume Matching and Gap Analysis. Owner: Nicolas Mesti (SCRUM-278).

## Routes

| Path        | Screen                           |
| ----------- | -------------------------------- |
| `/matching` | Resume Matching and Gap Analysis |

The matching route contains the full prototype workflow for comparing a resume with a job posting, reviewing processing status, viewing matching qualifications and gaps, and handling a failed comparison.

## Public surface

`index.ts` exports `matchingRoutes`, which `src/app/routes.tsx` spreads into the main application route table.

The feature currently manages its prototype state inside `MatchingPage.tsx`. No matching provider or shared store is needed yet because the workflow only exists within this feature.

## Code

`MatchingPage.tsx` controls the current matching screen and connects the four views in this folder.

`CompareResumeJobView.tsx` allows the student to select a resume and job posting. Both selections are required before a comparison can begin. The validation rules and messages are kept in `validation.ts`.

`ComparisonProcessingView.tsx` shows the selected resume and job posting while the comparison is being processed. Because this is a prototype without a backend, Refresh Status moves the comparison to either the completed results screen or the failed screen.

`MatchGapResultsView.tsx` displays qualifications that were matched to the selected resume and qualifications that were not identified. Each result includes the qualification priority and supporting job or resume evidence where available. The results are intended to show resume-to-job alignment only and do not predict hiring outcomes.

`ComparisonFailedView.tsx` shows the failed comparison state while keeping the selected resume and job posting available. The student can retry the comparison or return to the selection screen.

`sampleData.ts` contains the prototype resumes, job postings, matched qualifications and qualification gaps used by the feature. `types.ts` defines the matching statuses, qualification priorities and comparison result structures.

The Simulate processing failure checkbox is a prototype-only control that allows the failed comparison workflow to be demonstrated without a backend.

`matching.css` contains layout and styling specific to the matching feature. Shared controls such as buttons, panels and form fields continue to use the styles provided by the application.

## Tests

`MatchingPage.test.tsx` covers the main matching workflow, including the comparison form, required-field validation, processing, completed results, simulated failure, retry and resetting for a new comparison.

`validation.test.ts` covers the resume and job posting selection rules.

Run the matching tests from `frontend/` with:

```bash
npm test -- src/features/matching/MatchingPage.test.tsx
npm test -- src/features/matching/validation.test.ts
```

Run the full frontend test suite with:

```bash
npm test
```

The feature should also pass:

```bash
npm run build
npm run lint
```