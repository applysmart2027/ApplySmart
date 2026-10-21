import { fireEvent, render, screen, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { expect, test } from 'vitest';
import { ApplicationsProvider } from '../features/applications';
import { ResumesProvider } from '../features/resumes';
import { routes } from './routes';

function renderAt(path: string) {
  render(
    <ApplicationsProvider>
      <ResumesProvider>
        <RouterProvider router={createMemoryRouter(routes, { initialEntries: [path] })} />
      </ResumesProvider>
    </ApplicationsProvider>,
  );
}

function sidebar() {
  return within(screen.getByRole('navigation', { name: 'Main' }));
}

test('the dashboard lists every area in the sidebar and in the page', () => {
  renderAt('/');

  expect(screen.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeInTheDocument();
  expect(sidebar().getAllByRole('link')).toHaveLength(5);
  expect(within(screen.getByRole('main')).getAllByRole('link')).toHaveLength(4);
});

test.each([
  ['Applications', 'Application Records'],
  ['Resumes', 'My Resumes'],
  ['Matching', 'Resume Matching and Gap Analysis'],
  ['Recommendations', 'Recommendations, Analytics and Follow-ups'],
])('the "%s" link opens its page, marks it current and moves focus to it', (linkName, heading) => {
  renderAt('/');
  expect(document.title).toBe('Dashboard | ApplySmart');
  expect(screen.getByRole('main')).not.toHaveFocus();

  fireEvent.click(sidebar().getByRole('link', { name: linkName }));

  expect(screen.getByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
  expect(sidebar().getByRole('link', { current: 'page' })).toHaveAccessibleName(linkName);
  expect(screen.getByRole('main')).toHaveFocus();
});

test('an unknown address shows page not found and links back to the dashboard', () => {
  renderAt('/no-such-page');

  expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('link', { name: 'Go to the dashboard' }));
  expect(screen.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeInTheDocument();
});

test('a student creates, views, edits and deletes an application from the dashboard', () => {
  renderAt('/');
  const click = (role: 'link' | 'button' | 'radio', name: string) =>
    fireEvent.click(screen.getByRole(role, { name }));
  const fill = (label: string, value: string) =>
    fireEvent.change(screen.getByLabelText(label), { target: { value } });
  const detail = (term: string) =>
    screen.getByText(term, { selector: 'dt' }).nextElementSibling as HTMLElement;
  const heading = () => screen.getByRole('heading', { level: 1 });

  click('link', 'Applications');
  click('link', 'New application');
  expect(heading()).toHaveTextContent('Create Application Record');
  expect(document.title).toBe('Create Application Record | ApplySmart');

  fill('Job title (required)', 'Data Engineer');
  fill('Employer (required)', 'Maplestone Robotics');
  click('button', 'Select or upload resume');
  click('radio', 'Cloud and DevOps resume.docx');
  click('button', 'Attach resume');
  click('button', 'Save application');
  expect(heading()).toHaveTextContent('Application Records');

  click('link', 'View Data Engineer at Maplestone Robotics');
  expect(heading().textContent).toBe('Data Engineer');
  expect(detail('Resume')).toHaveTextContent('Cloud and DevOps resume.docx');

  click('link', 'Edit application');
  fill('Status', 'Interview');
  click('button', 'Change resume');
  fireEvent.change(screen.getByLabelText('Upload a new resume (PDF or DOCX)'), {
    target: { files: [new File(['resume'], 'cover-resume.pdf')] },
  });
  click('button', 'Attach resume');
  click('button', 'Save changes');
  expect(heading().textContent).toBe('Data Engineer');
  expect(detail('Status')).toHaveTextContent('Interview');
  expect(detail('Resume')).toHaveTextContent('cover-resume.pdf');

  click('link', 'Delete application');
  expect(heading()).toHaveTextContent('Delete Application Record');
  click('button', 'Delete application');
  expect(heading()).toHaveTextContent('Application Records');
  expect(screen.getAllByRole('row')).toHaveLength(7);
  expect(screen.queryByText('Data Engineer')).not.toBeInTheDocument();
});

test.each([
  ['Job Discovery and Application Tracking', 'Application Records'],
  ['Resume Management and Parsing', 'My Resumes'],
  ['Resume Matching and Gap Analysis', 'Resume Matching and Gap Analysis'],
  ['Recommendations, Analytics and Follow-ups', 'Recommendations, Analytics and Follow-ups'],
])('the dashboard link "%s" opens its page', (linkName, heading) => {
  renderAt('/');

  fireEvent.click(within(screen.getByRole('main')).getByRole('link', { name: linkName }));

  expect(screen.getByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
});
