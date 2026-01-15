import { SelectHTMLAttributes, forwardRef, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  options: DropdownOption[];
  placeholder?: string;
  error?: boolean;
  helperText?: string;
  icon?: ReactNode;
}

export const Dropdown = forwardRef<HTMLSelectElement, DropdownProps>(
  ({ label, options, placeholder, error = false, helperText, icon, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label className="text-xs font-medium text-gray-900 flex items-center gap-2">
            {label}
            {icon && <span className="inline-flex">{icon}</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={`
              w-full h-9 px-4 text-xs
              bg-white border rounded-lg
              appearance-none cursor-pointer
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-1
              disabled:bg-gray-100 disabled:cursor-not-allowed
              ${
                error
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-cmg-teal hover:border-cmg-teal'
              }
              ${!props.value || props.value === '' ? 'text-gray-400' : 'text-gray-900'}
              ${className}
            `}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            <ChevronDown size={20} />
          </div>
        </div>
        {helperText && (
          <span className={`text-2xs ${error ? 'text-red-500' : 'text-gray-500'}`}>
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Dropdown.displayName = 'Dropdown';
