import type { ReactNode } from 'react';

export function PageHeader({
  title,
  status,
  subtitle,
  children,
}: {
  title: string;
  status?: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="page-header">
      <title>{`${title} | ApplySmart`}</title>
      <div>
        {status ? (
          <div className="page-title-row">
            <h1>{title}</h1>
            {status}
          </div>
        ) : (
          <h1>{title}</h1>
        )}
        {subtitle && <p className="page-intro">{subtitle}</p>}
      </div>
      {children && <div className="page-header-actions">{children}</div>}
    </div>
  );
}
