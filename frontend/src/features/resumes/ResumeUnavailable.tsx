import { Link } from 'react-router';
import { PageHeader } from '../../shared/ui/PageHeader';

const messages = {
  'not-found': {
    title: 'Resume not found',
    text: 'There is no resume version at this address. It may have been deleted.',
  },
  'not-failed': {
    title: 'Nothing to resolve',
    text: 'This resume version did not fail to parse, so there is nothing to fix here.',
  },
  'not-reviewable': {
    title: 'Nothing to review',
    text: 'This resume version is not waiting for review.',
  },
};

export function ResumeUnavailable({ reason }: { reason: keyof typeof messages }) {
  const { title, text } = messages[reason];
  return (
    <PageHeader
      title={title}
      subtitle={
        <>
          {text}{' '}
          <Link to="/resumes" className="text-link">
            Back to My Resumes
          </Link>
        </>
      }
    />
  );
}
