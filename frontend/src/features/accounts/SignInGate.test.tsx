import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { SignInGate } from './SignInGate';

afterEach(() => vi.unstubAllGlobals());

// Each call to fetch gets the next status in the list.
function serverAnswers(...statuses: number[]) {
  const fetch = vi.fn();
  for (const status of statuses) fetch.mockResolvedValueOnce(new Response(null, { status }));
  vi.stubGlobal('fetch', fetch);
  return fetch;
}

function renderGate() {
  render(
    <SignInGate>
      <p>Signed-in app</p>
    </SignInGate>,
  );
}

function submit(username: string, password: string) {
  fireEvent.change(screen.getByLabelText('Username'), { target: { value: username } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: password } });
  fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
}

test('a student who is not signed in sees the sign-in form', async () => {
  serverAnswers(403);
  renderGate();

  expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
  expect(screen.queryByText('Signed-in app')).not.toBeInTheDocument();
});

test('a correct sign-in opens the app', async () => {
  const fetch = serverAnswers(403, 200);
  renderGate();
  await screen.findByRole('heading', { name: 'Sign in' });

  submit('maya.okafor', 'applysmart-demo');

  expect(await screen.findByText('Signed-in app')).toBeInTheDocument();
  expect(JSON.parse(fetch.mock.calls[1][1].body)).toEqual({
    username: 'maya.okafor',
    password: 'applysmart-demo',
  });
});

test('a wrong sign-in says so and keeps the username', async () => {
  serverAnswers(403, 400);
  renderGate();
  await screen.findByRole('heading', { name: 'Sign in' });

  submit('maya.okafor', 'wrong');

  expect(await screen.findByRole('alert')).toHaveTextContent('Username or password is incorrect.');
  expect(screen.getByLabelText('Username')).toHaveValue('maya.okafor');
});

test('a student already signed in goes straight to the app', async () => {
  serverAnswers(200);
  renderGate();

  expect(await screen.findByText('Signed-in app')).toBeInTheDocument();
});

test('an empty field is caught before anything is sent', async () => {
  const fetch = serverAnswers(403);
  renderGate();
  await screen.findByRole('heading', { name: 'Sign in' });

  submit('maya.okafor', '');

  expect(screen.getByRole('alert')).toHaveTextContent('Enter your username and password.');
  expect(fetch).toHaveBeenCalledTimes(1);
});
