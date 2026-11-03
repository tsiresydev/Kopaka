'use client';
import { useId } from 'react';
import type { InputHTMLAttributes } from 'react';
import { cn } from '../lib/utils.js';
export function Field({
  label,
  help,
  error,
  id,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  help?: string;
  error?: string;
}) {
  const generated = useId();
  const inputId = id ?? generated;
  const describedBy =
    [
      props['aria-describedby'],
      help ? inputId + '-help' : undefined,
      error ? inputId + '-error' : undefined,
    ]
      .filter(Boolean)
      .join(' ') || undefined;
  return (
    <div className="k-field">
      <label className="k-label" htmlFor={inputId}>
        {label}
      </label>
      <input
        {...props}
        id={inputId}
        className={cn('k-control', className)}
        aria-invalid={error ? true : props['aria-invalid']}
        aria-describedby={describedBy}
      />
      {help && (
        <p className="k-help" id={inputId + '-help'}>
          {help}
        </p>
      )}
      {error && (
        <p className="k-field-error" id={inputId + '-error'}>
          {error}
        </p>
      )}
    </div>
  );
}
