import type { RouteObject } from 'react-router';
import { ApplicationDetailsPage } from './ApplicationDetailsPage';
import { ApplicationsListPage } from './ApplicationsListPage';
import { CreateApplicationPage } from './CreateApplicationPage';
import { DeleteApplicationPage } from './DeleteApplicationPage';
import { EditApplicationPage } from './EditApplicationPage';

export { ApplicationsProvider } from './ApplicationsProvider';

export const applicationsRoutes: RouteObject[] = [
  { path: 'applications', Component: ApplicationsListPage },
  { path: 'applications/new', Component: CreateApplicationPage },
  { path: 'applications/:id', Component: ApplicationDetailsPage },
  { path: 'applications/:id/edit', Component: EditApplicationPage },
  { path: 'applications/:id/delete', Component: DeleteApplicationPage },
];
