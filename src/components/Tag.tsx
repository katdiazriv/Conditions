import { X } from 'lucide-react';

interface TagProps {
  variant: 'green' | 'grey' | 'amber';
  size?: 'default' | 'sm';
  children: React.ReactNode;
  className?: string;
  onDismiss?: () => void;
}

const variantStyles = {
  green: 'bg-green-50 text-green-700',
  grey: 'bg-gray-200 text-gray-700',
  amber: 'bg-amber-50 text-amber-700',
};

const dismissButtonStyles = {
  green: 'hover:bg-green-100 text-green-600',
  grey: 'hover:bg-gray-300 text-gray-600',
  amber: 'hover:bg-amber-100 text-amber-600',
};

const sizeStyles = {
  default: 'text-xs px-2 py-0.5',
  sm: 'text-2xs px-1.5 py-0.5',
};

const dismissIconSize = {
  default: 'w-3 h-3',
  sm: 'w-2.5 h-2.5',
};

export function Tag({ variant, size = 'default', children, className = '', onDismiss }: TagProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className={`p-0.5 rounded-full transition-colors ${dismissButtonStyles[variant]}`}
          aria-label="Remove"
        >
          <X className={dismissIconSize[size]} />
        </button>
      )}
    </span>
  );
}
