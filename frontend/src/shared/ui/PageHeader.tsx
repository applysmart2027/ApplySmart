import type { ReactNode } from 'react';

export function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="page-header">
      <title>{`${title} | ApplySmart`}</title>
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="page-intro">{subtitle}</p>}
      </div>
      {children && <div className="page-header-actions">{children}</div>}
    </div>
  );
}
