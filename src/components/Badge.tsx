import { ReactNode } from 'react';

type BadgeVariant = 'default' | 'light' | 'teal' | 'danger';
type BadgeSize = 'sm' | 'md' | 'xs';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: ReactNode;
  className?: string;
}

const variantStyles = {
  default: 'bg-[#EAF6F7] text-cmg-teal',
  light: 'bg-white text-gray-900',
  teal: 'bg-cmg-teal text-white',
  danger: 'bg-red-500 text-white',
};

const sizeStyles = {
  xs: 'min-w-[16px] h-4 px-1 text-[10px]',
  sm: 'px-1.5 py-0.5 text-2xs',
  md: 'px-2 py-1 text-xs',
};

export function Badge({
  variant = 'default',
  size = 'sm',
  children,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center justify-center font-semibold rounded-full ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
}
