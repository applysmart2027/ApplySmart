import type {
  ProgressMetrics,
  RecentApplication,
  Recommendation,
  RecommendationPreferences,
  Reminder,
} from './types';

export const sampleRecommendations: Recommendation[] = [
  {
    id: 'rec-1',
    title: 'Tech Support Technician',
    company: 'Deloitte',
    location: 'Edmonton, AB',
    workType: 'Full Time',
    experienceLevel: 'Entry Level',
    industry: 'Technology',
    description:
      'Provide technical support and help resolve hardware, software, and user issues.',
    responsibilities: [
      'Respond to technical support requests',
      'Troubleshoot hardware and software issues',
      'Document solutions and recurring problems',
    ],
    companyAbout:
      'Deloitte provides professional services to organizations across multiple industries.',
  },
  {
    id: 'rec-2',
    title: 'Software Engineer Co-op',
    company: 'Ubisoft',
    location: 'Toronto, ON',
    workType: 'Co-op',
    experienceLevel: 'Entry Level',
    industry: 'Software',
    description:
      'Support software development tasks as part of a collaborative engineering team.',
    responsibilities: [
      'Assist with feature development',
      'Fix bugs and test changes',
      'Participate in code reviews',
    ],
    companyAbout:
      'Ubisoft develops interactive entertainment and software products.',
  },
  {
    id: 'rec-3',
    title: 'Developer Co-op',
    company: 'Ubisoft',
    location: 'Ottawa, ON',
    workType: 'Co-op',
    experienceLevel: 'Entry Level',
    industry: 'Software',
    description:
      'Work with a development team on application features and testing.',
    responsibilities: [
      'Implement small development tasks',
      'Test application features',
      'Support team documentation',
    ],
    companyAbout:
      'Ubisoft creates software and interactive entertainment products.',
  },
  {
    id: 'rec-4',
    title: 'Computer Science Intern',
    company: 'Microsoft',
    location: 'Toronto, ON',
    workType: 'Internship',
    experienceLevel: 'Entry Level',
    industry: 'Technology',
    description:
      'Contribute to technical projects while learning from experienced software teams.',
    responsibilities: [
      'Support software projects',
      'Participate in testing and debugging',
      'Collaborate with engineering teams',
    ],
    companyAbout:
      'Microsoft develops software, cloud services, and technology products.',
  },
];

export const samplePreferences: RecommendationPreferences = {
  jobTypes: ['Full Time', 'Co-op', 'Internship'],
  locations: ['Toronto, ON', 'Mississauga, ON'],
  industries: ['Software', 'IT', 'Technology', 'Computer Science'],
  experienceLevels: ['Entry Level'],
};

export const sampleReminders: Reminder[] = [
  {
    id: 'rem-1',
    title: 'Interview preparation',
    relatedJob: 'Deloitte - Tech Support Technician',
    dueDate: '2026-11-10',
    completed: false,
  },
  {
    id: 'rem-2',
    title: 'Check application status',
    relatedJob: 'Ubisoft - Developer Co-op',
    dueDate: '2026-11-13',
    completed: false,
  },
  {
    id: 'rem-3',
    title: 'Send follow-up email',
    relatedJob: 'Ubisoft - Developer Co-op',
    dueDate: '2026-11-21',
    completed: false,
  },
];

export const sampleProgressMetrics: ProgressMetrics = {
  applications: 34,
  interviews: 7,
  offers: 4,
  inProgress: 20,
  offerRate: 11,
};

export const sampleRecentApplications: RecentApplication[] = [
  {
    id: 'recent-1',
    jobTitle: 'Cyber Security Intern',
    company: 'Google',
    status: 'Interview',
    date: 'Oct 10, 2026',
  },
  {
    id: 'recent-2',
    jobTitle: 'Software Developer Co-op',
    company: 'Apple',
    status: 'Rejected',
    date: 'Oct 7, 2026',
  },
];