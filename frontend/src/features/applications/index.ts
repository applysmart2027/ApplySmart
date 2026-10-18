import type { RouteObject } from 'react-router';
import { ApplicationsListPage } from './ApplicationsListPage';
import { NotBuiltYetPage } from './NotBuiltYetPage';

export { ApplicationsProvider } from './ApplicationsProvider';

export const applicationsRoutes: RouteObject[] = [
  { path: 'applications', Component: ApplicationsListPage },
  { path: 'applications/new', Component: NotBuiltYetPage },
  { path: 'applications/:id', Component: NotBuiltYetPage },
  { path: 'applications/:id/edit', Component: NotBuiltYetPage },
  { path: 'applications/:id/delete', Component: NotBuiltYetPage },
];
