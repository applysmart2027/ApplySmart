export const APPLICATION_STATUSES = [
  'Saved',
  'Applied',
  'Interview',
  'Offer',
  'Rejected',
  'Withdrawn',
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

// Optional text fields hold an empty string when the student leaves them blank.
export type ApplicationDraft = Omit<ApplicationRecord, 'id'>;

export type ApplicationRecord = {
  id: string;
  jobTitle: string;
  employer: string;
  postingUrl: string;
  status: ApplicationStatus;
  deadline: string; // YYYY-MM-DD
  resumeId: string;
  notes: string;
  contactName: string;
  contactEmail: string;
};
