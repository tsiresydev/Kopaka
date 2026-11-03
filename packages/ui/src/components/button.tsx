'use client';
import type { ButtonHTMLAttributes } from 'react';
import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils.js';

// Primitive shadcn adaptée aux rôles Kopaka ; aucun comportement de navigation implicite.
export const buttonVariants = cva(
  'k-button inline-flex items-center justify-center gap-2',
  {
    variants: {
      variant: {
        primary: 'k-button--primary',
        secondary: 'k-button--secondary',
        ghost: 'k-button--ghost',
      },
    },
    defaultVariants: { variant: 'primary' },
  },
);
export function Button({
  className,
  variant,
  type = 'button',
  disabled,
  onClick,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>) {
  const locked =
    disabled ||
    props['aria-disabled'] === true ||
    props['aria-disabled'] === 'true';
  return (
    <button
      {...props}
      type={type}
      disabled={disabled}
      className={cn(buttonVariants({ variant }), className)}
      onClick={(event) => {
        if (locked) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
    />
  );
}
