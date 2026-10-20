import { useEffect, useRef } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';
import { areas } from './areas';
import './app.css';

export function AppShell() {
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const previousPath = useRef(pathname);

  // After navigating, start keyboard and screen-reader users at the new page's content.
  // Comparing paths (not a first-render flag) keeps focus put on load, even under StrictMode.
  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    mainRef.current?.focus();
  }, [pathname]);

  return (
    <div className="shell">
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <header className="shell-header">
        <Link to="/" className="shell-brand">
          ApplySmart
        </Link>
        <p className="shell-note">Prototype with sample data</p>
      </header>
      <nav className="shell-nav" aria-label="Main">
        <ul>
          <li>
            <NavLink to="/" end>
              Dashboard
            </NavLink>
          </li>
          {areas.map((area) => (
            <li key={area.path}>
              <NavLink to={area.path}>{area.label}</NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <main id="main" className="shell-main" tabIndex={-1} ref={mainRef}>
        <Outlet />
      </main>
    </div>
  );
}
