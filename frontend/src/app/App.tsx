import { createBrowserRouter, RouterProvider } from 'react-router';
import { ApplicationsProvider } from '../features/applications';
import { ResumesProvider } from '../features/resumes';
import { routes } from './routes';

const router = createBrowserRouter(routes);

export function App() {
  return (
    <ApplicationsProvider>
      <ResumesProvider>
        <RouterProvider router={router} />
      </ResumesProvider>
    </ApplicationsProvider>
  );
}
