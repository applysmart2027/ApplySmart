import { Link } from 'react-router';

export function PageNotFound() {
  return (
    <>
      <h1>Page not found</h1>
      <p className="page-intro">
        This address does not match any page.{' '}
        <Link to="/" className="text-link">
          Go to the dashboard
        </Link>
      </p>
    </>
  );
}
