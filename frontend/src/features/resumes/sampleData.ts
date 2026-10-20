import type { ResumeVersion } from './types';

export const sampleResumeVersions: ResumeVersion[] = [
  {
    id: 'res-1',
    versionName: 'Software Developer - General',
    parseStatus: 'Confirmed',
    isPrimary: true,
    uploaded: '2026-09-30',
  },
  {
    id: 'res-2',
    versionName: 'Cloud Co-op',
    parseStatus: 'Needs review',
    isPrimary: false,
    uploaded: '2026-10-17',
  },
  {
    id: 'res-3',
    versionName: 'Data Analyst Internship',
    parseStatus: 'Processing',
    isPrimary: false,
    uploaded: '2026-10-18',
  },
  {
    id: 'res-4',
    versionName: 'Old Resume 2025',
    parseStatus: 'Failed',
    isPrimary: false,
    uploaded: '2026-10-12',
  },
];
