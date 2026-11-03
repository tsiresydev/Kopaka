import type { ReactNode } from 'react';
import { cn } from '../lib/utils.js';
export function Card({
  title,
  description,
  children,
  id,
  className,
  variant = 'default',
  headingLevel = 2,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  id?: string;
  className?: string;
  variant?: 'default' | 'soft';
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 3 ? 'h3' : 'h2';
  const titleId = id ? id + '-title' : undefined;
  return (
    <section
      id={id}
      className={cn('k-card', className)}
      data-variant={variant}
      aria-labelledby={titleId}
    >
      <header className="k-card-heading">
        <Heading id={titleId}>{title}</Heading>
        {description && <p>{description}</p>}
      </header>
      {children}
    </section>
  );
}
