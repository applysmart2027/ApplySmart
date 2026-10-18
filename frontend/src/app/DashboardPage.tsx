import { Link } from 'react-router';
import { areas } from './areas';
import './app.css';

export function DashboardPage() {
  return (
    <>
      <h1>Dashboard</h1>
      <p className="page-intro">Choose an area to work in.</p>
      <ul className="panel area-list">
        {areas.map((area) => (
          <li key={area.path}>
            <Link to={area.path} className="text-link">
              {area.name}
            </Link>
            <p>{area.description}</p>
          </li>
        ))}
      </ul>
    </>
  );
}
