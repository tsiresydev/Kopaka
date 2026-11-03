'use client';
import { useId } from 'react';
import type { SelectHTMLAttributes } from 'react';
import { cn } from '../lib/utils.js';
export function Select({
  label,
  help,
  id,
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string; help?: string }) {
  const generated = useId();
  const inputId = id ?? generated;
  return (
    <div className="k-field">
      <label className="k-label" htmlFor={inputId}>
        {label}
      </label>
      <select
        {...props}
        id={inputId}
        className={cn('k-control k-select', className)}
        aria-describedby={
          [props['aria-describedby'], help ? inputId + '-help' : undefined]
            .filter(Boolean)
            .join(' ') || undefined
        }
      >
        {children}
      </select>
      {help && (
        <p className="k-help" id={inputId + '-help'}>
          {help}
        </p>
      )}
    </div>
  );
}
