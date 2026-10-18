import type { RouteObject } from 'react-router';
import { RecommendationsPage } from './RecommendationsPage';

export const recommendationsRoutes: RouteObject[] = [
  { path: 'recommendations', Component: RecommendationsPage },
];
