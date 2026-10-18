import { Link, NavLink, Outlet } from 'react-router';
import { areas } from './areas';
import './app.css';

export function AppShell() {
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
              <NavLink to={area.path}>{area.name}</NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <main id="main" className="shell-main" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  );
}
