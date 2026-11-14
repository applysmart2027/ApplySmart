import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { PageHeader } from '../../shared/ui/PageHeader';
import './accounts.css';

export function SignInGate({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<'checking' | 'signed-out' | 'signed-in'>('checking');

  useEffect(() => {
    // Any failure, including an unreachable backend, shows the form, which explains a failed sign-in.
    fetch('/api/session/')
      .then((response) => setSession(response.ok ? 'signed-in' : 'signed-out'))
      .catch(() => setSession('signed-out'));
  }, []);

  if (session === 'checking') return <p className="sign-in">Checking sign-in…</p>;
  if (session === 'signed-out') return <SignInPage onSignedIn={() => setSession('signed-in')} />;
  return children;
}

function SignInPage({ onSignedIn }: { onSignedIn: () => void }) {
  const [error, setError] = useState('');

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const username = form.get('username');
    const password = form.get('password');
    if (!username || !password) {
      setError('Enter your username and password.');
      return;
    }
    const response = await fetch('/api/session/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Django sets this cookie on the session check and rejects a POST without it.
        'X-CSRFToken': document.cookie.match(/csrftoken=([^;]+)/)?.[1] ?? '',
      },
      body: JSON.stringify({ username, password }),
    }).catch(() => null);
    if (response?.ok) {
      onSignedIn();
    } else if (response?.status === 400) {
      setError('Username or password is incorrect. Check both and try again.');
    } else {
      setError(
        'ApplySmart could not sign you in. Check that the backend is running, then try again.',
      );
    }
  }

  return (
    <main className="sign-in">
      <PageHeader
        title="Sign in"
        subtitle="Use one of the sample student accounts listed in the project README."
      />
      <form className="panel sign-in-form" noValidate onSubmit={signIn}>
        {error && (
          <p className="notice-error" role="alert">
            {error}
          </p>
        )}
        <div className="field">
          <label htmlFor="username">Username</label>
          <input id="username" name="username" autoComplete="username" />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" autoComplete="current-password" />
        </div>
        <button className="button button-primary">Sign in</button>
      </form>
    </main>
  );
}
