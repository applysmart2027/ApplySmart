import { Link } from 'react-router';
import { PageHeader } from '../shared/ui/PageHeader';

export function PageNotFound() {
  return (
    <PageHeader
      title="Page not found"
      subtitle={
        <>
          This address does not match any page.{' '}
          <Link to="/" className="text-link">
            Go to the dashboard
          </Link>
        </>
      }
    />
  );
}
