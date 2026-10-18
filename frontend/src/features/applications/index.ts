import type { RouteObject } from 'react-router';
import { ApplicationsListPage } from './ApplicationsListPage';

export const applicationsRoutes: RouteObject[] = [
  { path: 'applications', Component: ApplicationsListPage },
];
