// Possible statuses for a resume-to-job comparison
export const MATCH_STATUSES = [
  'Ready',
  'Queued',
  'Processing',
  'Completed',
  'Failed',
] as const;

export type MatchStatus = (typeof MATCH_STATUSES)[number];

// Shows how important a qualification is in the job posting
export const QUALIFICATION_PRIORITIES = [
  'Required',
  'Preferred',
  'Unspecified',
] as const;

export type QualificationPriority =
  (typeof QUALIFICATION_PRIORITIES)[number];

// Basic resume information used during a comparison
export type ResumeRef = {
  id: string;
  name: string;
};

// Basic job posting information used during a comparison
export type JobPostingRef = {
  id: string;
  title: string;
  company: string;
};

// A qualification found in the job posting
export type Qualification = {
  id: string;
  title: string;
  priority: QualificationPriority;
  jobEvidence: string;
};

// A qualification that was matched to the resume
export type QualificationMatch = {
  qualification: Qualification;
  resumeEvidence: string;
};

// A qualification that was not found in the resume
export type QualificationGap = {
  qualification: Qualification;
  reason: string;
};

// Full result of comparing a resume with a job posting
export type ComparisonResult = {
  id: string;
  resume: ResumeRef;
  jobPosting: JobPostingRef;
  status: MatchStatus;
  matchedQualifications: QualificationMatch[];
  qualificationGaps: QualificationGap[];
};