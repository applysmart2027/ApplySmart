import type { RouteObject } from 'react-router';
import { RecommendationsPage } from './RecommendationsPage';
import { RecommendationPreferencesPage } from './RecommendationPreferencesPage';
import { JobDetailsPage } from './JobDetailsPage';
import { ProgressSummaryPage } from './ProgressSummaryPage';
import { RemindersPage } from './RemindersPage';

export const recommendationsRoutes: RouteObject[] = [
  { path: 'recommendations', Component: RecommendationsPage },
  { path: 'recommendations/preferences', Component: RecommendationPreferencesPage },
  { path: 'recommendations/job/:jobId', Component: JobDetailsPage },
  { path: 'recommendations/summary', Component: ProgressSummaryPage},
  { path: 'recommendations/reminders', Component: RemindersPage},
];
