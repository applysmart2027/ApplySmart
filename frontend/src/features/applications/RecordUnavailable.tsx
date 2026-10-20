import { Link } from 'react-router';
import { PageHeader } from '../../shared/ui/PageHeader';

const messages = {
  'not-found': {
    title: 'Application not found',
    text: 'There is no application record at this address. It may have been deleted.',
  },
  denied: {
    title: 'You cannot view this application',
    text: 'This record belongs to another account. Open one of your own applications instead.',
  },
};

export function RecordUnavailable({ reason }: { reason: keyof typeof messages }) {
  const { title, text } = messages[reason];
  return (
    <PageHeader
      title={title}
      subtitle={
        <>
          {text}{' '}
          <Link to="/applications" className="text-link">
            Back to Application Records
          </Link>
        </>
      }
    />
  );
}
