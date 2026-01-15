import { ButtonHTMLAttributes, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

type BadgeVariant = 'default' | 'danger' | 'info';

interface FilterButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isSelected?: boolean;
  badge?: number | string;
  badgeVariant?: BadgeVariant;
  showChevron?: boolean;
  children: ReactNode;
}

const badgeStyles = {
  default: 'text-gray-600',
  danger: 'bg-red-500 text-white text-2xs font-medium px-1.5 py-0.5 rounded-full min-w-[20px] text-center',
  info: 'bg-cmg-teal text-white text-2xs font-medium px-1.5 py-0.5 rounded-full min-w-[20px] text-center',
};

export function FilterButton({
  isSelected = false,
  badge,
  badgeVariant = 'default',
  showChevron = false,
  className = '',
  children,
  ...props
}: FilterButtonProps) {
  return (
    <button
      className={`flex items-center gap-2 px-3 py-2.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
        isSelected
          ? 'border-2 border-cmg-teal text-gray-900'
          : 'border border-gray-300 text-gray-700 hover:border-gray-400'
      } ${className}`}
      {...props}
    >
      {children}
      {badge !== undefined && (
        <span className={badgeStyles[badgeVariant]}>
          {badge}
        </span>
      )}
      {showChevron && (
        <ChevronDown className="w-4 h-4 text-gray-500" />
      )}
    </button>
  );
}
