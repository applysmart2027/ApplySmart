import type {
  ComparisonResult,
  JobPostingRef,
  ResumeRef,
} from './types';

// Sample resumes available for comparison in the prototype
export const sampleResumes: ResumeRef[] = [
  {
    id: 'res-1',
    name: 'Software Developer - General',
  },
  {
    id: 'res-2',
    name: 'Cloud Co-op',
  },
];

// Sample job postings available for comparison in the prototype
export const sampleJobPostings: JobPostingRef[] = [
  {
    id: 'job-1',
    title: 'Junior Cloud Developer',
    company: 'Northstar Systems',
  },
  {
    id: 'job-2',
    title: 'Cloud Support Associate',
    company: 'MapleTech Solutions',
  },
];

// Sample completed comparison used to display matching and gap results
export const sampleComparisonResult: ComparisonResult = {
  id: 'comparison-1',

  resume: {
    id: 'res-2',
    name: 'Cloud Co-op',
  },

  jobPosting: {
    id: 'job-1',
    title: 'Junior Cloud Developer',
    company: 'Northstar Systems',
  },

  status: 'Completed',

  matchedQualifications: [
    {
      qualification: {
        id: 'qual-1',
        title: 'AWS experience',
        priority: 'Required',
        jobEvidence: 'Experience with AWS cloud services is required.',
      },
      resumeEvidence:
        'Built cloud projects using AWS services including Lambda and EC2.',
    },
    {
      qualification: {
        id: 'qual-2',
        title: 'Python',
        priority: 'Required',
        jobEvidence: 'Experience programming with Python.',
      },
      resumeEvidence:
        'Used Python for automation and cloud development projects.',
    },
    {
      qualification: {
        id: 'qual-3',
        title: 'Git and GitHub',
        priority: 'Preferred',
        jobEvidence: 'Experience using Git-based version control is preferred.',
      },
      resumeEvidence:
        'Used Git and GitHub for coursework and team development projects.',
    },
  ],

  qualificationGaps: [
    {
      qualification: {
        id: 'qual-4',
        title: 'Kubernetes',
        priority: 'Required',
        jobEvidence:
          'Experience deploying containerized applications with Kubernetes.',
      },
      reason:
        'No Kubernetes experience was identified in the selected resume.',
    },
    {
      qualification: {
        id: 'qual-5',
        title: 'Terraform',
        priority: 'Preferred',
        jobEvidence:
          'Infrastructure as code experience using Terraform is preferred.',
      },
      reason:
        'No Terraform experience was identified in the selected resume.',
    },
  ],
};