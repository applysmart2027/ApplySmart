import { Link } from 'react-router';

export function NotBuiltYetPage() {
  return (
    <>
      <h1>Not available yet</h1>
      <p className="page-intro">
        This screen is not available in the prototype yet.{' '}
        <Link to="/applications" className="text-link">
          Back to Application Records
        </Link>
      </p>
    </>
  );
}
