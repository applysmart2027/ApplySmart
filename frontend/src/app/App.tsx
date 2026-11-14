import { createBrowserRouter, RouterProvider } from 'react-router';
import { SignInGate } from '../features/accounts';
import { ApplicationsProvider } from '../features/applications';
import { ResumesProvider } from '../features/resumes';
import { routes } from './routes';

const router = createBrowserRouter(routes);

export function App() {
  return (
    <SignInGate>
      <ApplicationsProvider>
        <ResumesProvider>
          <RouterProvider router={router} />
        </ResumesProvider>
      </ApplicationsProvider>
    </SignInGate>
  );
}
