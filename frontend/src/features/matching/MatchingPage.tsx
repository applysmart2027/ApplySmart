import { useState } from 'react';

import { sampleResumeVersions } from '../resumes/sampleData';
import { useResumes } from '../resumes/store';

import {
  ComparisonRequestError,
  createComparison,
  getComparisonResult,
  retryComparison,
  type ComparisonApiResult,
} from './api';

import { CompareResumeJobView } from './CompareResumeJobView';
import { ComparisonFailedView } from './ComparisonFailedView';
import { ComparisonProcessingView } from './ComparisonProcessingView';
import { MatchGapResultsView } from './MatchGapResultsView';

import { sampleJobPostings } from './sampleData';

import {
  hasMatchingErrors,
  type MatchingErrors,
  validateComparison,
} from './validation';

import type {
  ComparisonResult,
  MatchStatus,
} from './types';

import './matching.css';


type MatchingView =
  | 'compare'
  | 'processing'
  | 'results'
  | 'failed';


export function MatchingPage() {
  const { resumes: resumeVersions } = useResumes();

  // Removes prototype resumes so Matching only uses
  // the student's real confirmed resume versions
  const sampleResumeIds = new Set(
    sampleResumeVersions.map((resume) => resume.id),
  );

  const resumes = resumeVersions
    .filter(
      (resume) =>
        !sampleResumeIds.has(resume.id) &&
        resume.parseStatus === 'Confirmed',
    )
    .map((resume) => ({
      id: resume.id,
      name: resume.versionName,
    }));

  const [view, setView] =
    useState<MatchingView>('compare');

  const [resumeId, setResumeId] =
    useState('');

  const [jobPostingId, setJobPostingId] =
    useState('');

  const [comparisonId, setComparisonId] =
    useState('');

  const [status, setStatus] =
    useState<MatchStatus>('Ready');

  const [errors, setErrors] =
    useState<MatchingErrors>({});

  const [result, setResult] =
    useState<ComparisonApiResult | null>(null);

  const [simulateFailure, setSimulateFailure] =
    useState(false);


  const selectedResume = resumes.find(
    (resume) => resume.id === resumeId,
  );

  const selectedJob = sampleJobPostings.find(
    (job) => job.id === jobPostingId,
  );


  // Starts a new comparison through the backend API
  async function handleStart() {
    const validationErrors = validateComparison(
      resumeId,
      jobPostingId,
    );

    setErrors(validationErrors);

    if (hasMatchingErrors(validationErrors)) {
      return;
    }

    try {
      const created = await createComparison(
        resumeId,
        jobPostingId,
        simulateFailure,
      );

      setComparisonId(created.id);
      setStatus(created.status);
      setResult(null);
      setView('processing');
    } catch (error) {
      if (error instanceof ComparisonRequestError) {
        setErrors(error.fieldErrors);
        return;
      }

      throw error;
    }
  }


  // Clears the resume error when the student chooses a resume
  function handleResumeChange(id: string) {
    setResumeId(id);

    setErrors((current) => ({
      ...current,
      resumeId: undefined,
    }));
  }


  // Clears the job posting error when the student chooses a posting
  function handleJobPostingChange(id: string) {
    setJobPostingId(id);

    setErrors((current) => ({
      ...current,
      jobPostingId: undefined,
    }));
  }


  // Checks the latest comparison status
  async function handleRefresh() {
    if (!comparisonId) {
      return;
    }

    const latest =
      await getComparisonResult(comparisonId);

    setStatus(latest.status);

    if (
      latest.status === 'Queued' ||
      latest.status === 'Processing'
    ) {
      setView('processing');
      return;
    }

    if (latest.status === 'Failed') {
      setResult(latest);
      setView('failed');
      return;
    }

    if (latest.status === 'Completed') {
      setResult(latest);
      setView('results');
    }
  }


  // Retries a failed comparison
  async function handleRetry() {
    if (!comparisonId) {
      return;
    }

    const retried =
      await retryComparison(comparisonId);

    setComparisonId(retried.id);
    setStatus(retried.status);
    setResult(null);
    setSimulateFailure(false);
    setView('processing');
  }


  // Returns to the selection screen
  function handleBackToComparison() {
    setErrors({});
    setView('compare');
  }


  // Resets the feature for a new comparison
  function handleReset() {
    setResumeId('');
    setJobPostingId('');
    setComparisonId('');
    setStatus('Ready');
    setErrors({});
    setResult(null);
    setSimulateFailure(false);
    setView('compare');
  }


  if (view === 'processing') {
    return (
      <ComparisonProcessingView
        resumeName={selectedResume?.name ?? ''}
        jobTitle={selectedJob?.title ?? ''}
        company={selectedJob?.company ?? ''}
        status={status}
        onRefresh={handleRefresh}
        onBack={handleBackToComparison}
      />
    );
  }


  if (view === 'failed') {
    return (
      <ComparisonFailedView
        resumeName={selectedResume?.name ?? ''}
        jobTitle={selectedJob?.title ?? ''}
        company={selectedJob?.company ?? ''}
        onRetry={handleRetry}
        onChooseDifferent={handleBackToComparison}
        onBack={handleBackToComparison}
      />
    );
  }


  if (
    view === 'results' &&
    result &&
    selectedResume &&
    selectedJob
  ) {
    const comparisonResult: ComparisonResult = {
      id: result.id,
      resume: selectedResume,
      jobPosting: selectedJob,
      status: result.status,
      matchedQualifications:
        result.matchedQualifications,
      qualificationGaps:
        result.qualificationGaps,
    };

    return (
      <MatchGapResultsView
        result={comparisonResult}
        onRunNewComparison={handleReset}
        onBack={handleBackToComparison}
      />
    );
  }


  return (
    <CompareResumeJobView
      resumes={resumes}
      resumeId={resumeId}
      jobPostingId={jobPostingId}
      errors={errors}
      simulateFailure={simulateFailure}
      onResumeChange={handleResumeChange}
      onJobPostingChange={handleJobPostingChange}
      onSimulateFailureChange={setSimulateFailure}
      onStart={handleStart}
      onCancel={handleReset}
    />
  );
}