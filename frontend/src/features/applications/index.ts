import type { RouteObject } from 'react-router';
import { ApplicationsListPage } from './ApplicationsListPage';
import { CreateApplicationPage } from './CreateApplicationPage';
import { NotBuiltYetPage } from './NotBuiltYetPage';

export { ApplicationsProvider } from './ApplicationsProvider';

export const applicationsRoutes: RouteObject[] = [
  { path: 'applications', Component: ApplicationsListPage },
  { path: 'applications/new', Component: CreateApplicationPage },
  { path: 'applications/:id', Component: NotBuiltYetPage },
  { path: 'applications/:id/edit', Component: NotBuiltYetPage },
  { path: 'applications/:id/delete', Component: NotBuiltYetPage },
];
