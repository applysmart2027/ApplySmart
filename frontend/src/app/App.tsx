import { createBrowserRouter, RouterProvider } from 'react-router';
import { ApplicationsProvider } from '../features/applications';
import { routes } from './routes';

const router = createBrowserRouter(routes);

export function App() {
  return (
    <ApplicationsProvider>
      <RouterProvider router={router} />
    </ApplicationsProvider>
  );
}
