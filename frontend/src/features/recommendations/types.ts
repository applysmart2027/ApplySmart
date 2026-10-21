export type Recommendation = {
  id: string;
  title: string;
  company: string;
  location: string;
  workType: string;
  experienceLevel: string;
  industry: string;
  description: string;
  responsibilities: string[];
  companyAbout: string;
};

export type RecommendationPreferences = {
  jobTypes: string[];
  locations: string[];
  industries: string[];
  experienceLevels: string[];
};

export type Reminder = {
  id: string;
  title: string;
  relatedJob: string;
  dueDate: string;
  completed: boolean;
};

export type ProgressMetrics = {
  applications: number;
  interviews: number;
  offers: number;
  inProgress: number;
  offerRate: number;
};

export type RecentApplication = {
  id: string;
  jobTitle: string;
  company: string;
  status: string;
  date: string;
};