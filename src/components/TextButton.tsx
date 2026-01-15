import { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react';

type TextButtonVariant = 'default' | 'danger';

interface TextButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  children: ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: TextButtonVariant;
}

const variantStyles = {
  default: 'text-cmg-teal hover:text-cmg-teal-dark',
  danger: 'text-red-700 hover:text-red-800',
};

const sizeStyles = {
  xs: 'text-[10px]',
  sm: 'text-2xs',
  md: 'text-xs',
  lg: 'text-sm',
};

const iconSizes = {
  xs: 'w-2.5 h-2.5',
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export const TextButton = forwardRef<HTMLButtonElement, TextButtonProps>(
  (
    {
      icon,
      iconPosition = 'left',
      children,
      size = 'md',
      variant = 'default',
      className = '',
      ...props
    },
    ref
  ) => {
    const iconElement = icon ? (
      <span className={`inline-flex items-center justify-center shrink-0 ${iconSizes[size]}`}>
        {icon}
      </span>
    ) : null;

    return (
      <button
        ref={ref}
        className={`flex items-center gap-1 font-bold transition-colors ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {iconPosition === 'left' && iconElement}
        <span>{children}</span>
        {iconPosition === 'right' && iconElement}
      </button>
    );
  }
);

TextButton.displayName = 'TextButton';
