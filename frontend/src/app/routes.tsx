import type { RouteObject } from 'react-router';
import { applicationsRoutes } from '../features/applications';
import { matchingRoutes } from '../features/matching';
import { recommendationsRoutes } from '../features/recommendations';
import { resumesRoutes } from '../features/resumes';
import { AppShell } from './AppShell';
import { DashboardPage } from './DashboardPage';
import { PageNotFound } from './PageNotFound';

export const routes: RouteObject[] = [
  {
    path: '/',
    Component: AppShell,
    children: [
      { index: true, Component: DashboardPage },
      ...applicationsRoutes,
      ...resumesRoutes,
      ...matchingRoutes,
      ...recommendationsRoutes,
      { path: '*', Component: PageNotFound },
    ],
  },
];
