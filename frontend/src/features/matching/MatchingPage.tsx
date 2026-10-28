import { useState } from 'react';
import { CompareResumeJobView } from './CompareResumeJobView';
import { ComparisonFailedView } from './ComparisonFailedView';
import { ComparisonProcessingView } from './ComparisonProcessingView';
import { MatchGapResultsView } from './MatchGapResultsView';
import {
  sampleComparisonResult,
  sampleJobPostings,
  sampleResumes,
} from './sampleData';
import {
  hasMatchingErrors,
  type MatchingErrors,
  validateComparison,
} from './validation';
import './matching.css';

type MatchingView = 'compare' | 'processing' | 'results' | 'failed';

// Controls the screens and state for the resume matching prototype
export function MatchingPage() {
  const [view, setView] = useState<MatchingView>('compare');
  const [resumeId, setResumeId] = useState('');
  const [jobPostingId, setJobPostingId] = useState('');
  const [errors, setErrors] = useState<MatchingErrors>({});
  const [simulateFailure, setSimulateFailure] = useState(false);

  const selectedResume = sampleResumes.find(
    (resume) => resume.id === resumeId,
  );

  const selectedJob = sampleJobPostings.find(
    (job) => job.id === jobPostingId,
  );

  // Starts the comparison only when both required selections are valid
  function handleStart() {
    const validationErrors = validateComparison(resumeId, jobPostingId);

    setErrors(validationErrors);

    if (hasMatchingErrors(validationErrors)) {
      return;
    }

    setView('processing');
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

  // Simulates the comparison finishing when the status is refreshed
  function handleRefresh() {
    setView(simulateFailure ? 'failed' : 'results');
  }

  // Starts another attempt using the same selections
  function handleRetry() {
    setSimulateFailure(false);
    setView('processing');
  }

  // Returns to the selection screen without removing the current choices
  function handleBackToComparison() {
    setErrors({});
    setView('compare');
  }

  // Resets the feature for a completely new comparison
  function handleReset() {
    setResumeId('');
    setJobPostingId('');
    setErrors({});
    setSimulateFailure(false);
    setView('compare');
  }

  if (view === 'processing') {
    return (
      <ComparisonProcessingView
        resumeName={selectedResume?.name ?? ''}
        jobTitle={selectedJob?.title ?? ''}
        company={selectedJob?.company ?? ''}
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

  if (view === 'results') {
    const result = {
      ...sampleComparisonResult,
      resume: selectedResume ?? sampleComparisonResult.resume,
      jobPosting: selectedJob ?? sampleComparisonResult.jobPosting,
    };

    return (
      <MatchGapResultsView
        result={result}
        onRunNewComparison={handleReset}
        onBack={handleBackToComparison}
      />
    );
  }

  return (
    <CompareResumeJobView
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