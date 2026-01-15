import { InputHTMLAttributes, forwardRef } from 'react';

interface InputTextProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: boolean;
  helperText?: string;
  wrapperClassName?: string;
}

export const InputText = forwardRef<HTMLInputElement, InputTextProps>(
  ({ label, error = false, helperText, className = '', wrapperClassName = '', ...props }, ref) => {
    return (
      <div className={`flex flex-col gap-2 ${wrapperClassName}`}>
        {label && (
          <label className="text-xs font-medium text-gray-900">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type="text"
          className={`
            w-full h-9 px-4 text-xs
            bg-white border rounded-lg
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-1
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${
              error
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-cmg-teal hover:border-cmg-teal'
            }
            ${className}
          `}
          {...props}
        />
        {helperText && (
          <span className={`text-2xs ${error ? 'text-red-500' : 'text-gray-500'}`}>
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

InputText.displayName = 'InputText';
