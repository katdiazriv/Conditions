import { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: boolean;
  helperText?: string;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error = false, helperText, resize = 'vertical', className = '', rows = 4, ...props }, ref) => {
    const resizeClass = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize',
    }[resize];

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label className="text-xs font-medium text-gray-900">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          rows={rows}
          className={`
            w-full min-h-[36px] px-4 py-3 text-xs
            bg-white border rounded-lg
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-1
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${resizeClass}
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

TextArea.displayName = 'TextArea';
