import { emptySections, type ParsedSections, type ResumeVersion } from './types';

// What the parser read from Cloud Co-op. The second end date is a misread the student fixes.
const cloudCoopSections: ParsedSections = {
  Experience: [
    {
      id: 'ent-1',
      title: 'Co-op Developer',
      organization: 'ABC Corp',
      startDate: 'May 2025',
      endDate: 'Aug 2025',
      details: 'Built internal dashboards in React and moved two services to AWS Lambda.',
    },
    {
      id: 'ent-2',
      title: 'IT Support Assistant',
      organization: 'Sheridan College',
      startDate: 'Sep 2025',
      endDate: 'Jan 2025',
      details: 'Resolved help desk tickets and set up lab machines for new terms.',
    },
  ],
  Education: [
    {
      id: 'ent-3',
      title: 'Computer Programming and Analysis',
      organization: 'Sheridan College',
      startDate: 'Sep 2024',
      endDate: 'Present',
      details: '',
    },
  ],
  Projects: [],
};

export const sampleResumeVersions: ResumeVersion[] = [
  {
    id: 'res-1',
    versionName: 'Software Developer - General',
    parseStatus: 'Confirmed',
    isPrimary: true,
    uploaded: '2026-09-30',
    parseAttempts: 1,
    failureReason: '',
    sections: emptySections(),
  },
  {
    id: 'res-2',
    versionName: 'Cloud Co-op',
    parseStatus: 'Needs review',
    isPrimary: false,
    uploaded: '2026-10-17',
    parseAttempts: 1,
    failureReason: '',
    sections: cloudCoopSections,
  },
  {
    id: 'res-3',
    versionName: 'Data Analyst Internship',
    parseStatus: 'Processing',
    isPrimary: false,
    uploaded: '2026-10-18',
    parseAttempts: 1,
    failureReason: '',
    sections: emptySections(),
  },
  {
    id: 'res-4',
    versionName: 'Old Resume 2025',
    parseStatus: 'Failed',
    isPrimary: false,
    uploaded: '2026-10-12',
    parseAttempts: 2,
    failureReason: 'Text could not be extracted from the file.',
    sections: emptySections(),
  },
];
