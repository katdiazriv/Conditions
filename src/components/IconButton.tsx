import { ButtonHTMLAttributes, ReactNode } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: 'p-1',
  md: 'p-1.5',
  lg: 'p-2',
};

export function IconButton({
  icon,
  size = 'md',
  className = '',
  ...props
}: IconButtonProps) {
  return (
    <button
      className={`text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {icon}
    </button>
  );
}
