import { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';
type BadgeVariant = 'default' | 'danger' | 'info';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  badge?: number | string;
  badgeVariant?: BadgeVariant;
  children: ReactNode;
}

const variantStyles = {
  primary: 'bg-cmg-teal text-white hover:bg-cmg-teal-dark',
  secondary: 'bg-[#EAF6F7] text-cmg-teal hover:bg-cmg-teal-light/20',
  ghost: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
  danger: 'bg-red-100 text-red-700 hover:bg-red-200',
};

const sizeStyles = {
  xs: 'px-1.5 py-0.5 text-[10px]',
  sm: 'px-2 py-1 text-2xs',
  md: 'px-3 py-2.5 text-xs',
  lg: 'px-4 py-2 text-sm',
};

const badgeStyles = {
  default: 'text-gray-600',
  danger: 'bg-red-500 text-white text-2xs font-medium px-1.5 py-0.5 rounded-full min-w-[20px] text-center',
  info: 'bg-cmg-teal text-white text-2xs font-medium px-1.5 py-0.5 rounded-full min-w-[20px] text-center',
};

export function Button({
  variant = 'secondary',
  size = 'md',
  badge,
  badgeVariant = 'default',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`flex items-center gap-2 font-bold rounded-full transition-colors whitespace-nowrap ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
      {badge !== undefined && (
        <span className={badgeStyles[badgeVariant]}>
          {badge}
        </span>
      )}
    </button>
  );
}
