import { Link } from 'react-router';
import { PageHeader } from '../shared/ui/PageHeader';
import { areas } from './areas';
import './app.css';

export function DashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard" subtitle="Choose an area to work in." />
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
