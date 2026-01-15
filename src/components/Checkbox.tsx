import { InputHTMLAttributes } from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
}

export function Checkbox({ checked = false, onChange, className = '', disabled, label, ...props }: CheckboxProps) {
  return (
    <label className={`relative inline-flex items-center gap-2 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only peer"
        {...props}
      />
      <div
        className={`
          w-5 h-5 border rounded flex-shrink-0
          transition-all duration-200
          peer-focus:ring-2 peer-focus:ring-cmg-teal peer-focus:ring-offset-1
          ${disabled ? 'bg-gray-100 border-gray-300' : ''}
          ${
            !disabled && checked
              ? 'bg-cmg-teal border-cmg-teal'
              : !disabled && !checked
              ? 'bg-white border-gray-300 peer-hover:border-cmg-teal'
              : ''
          }
          ${className}
        `}
      >
        {checked && (
          <Check className={`w-4 h-4 ${disabled ? 'text-gray-400' : 'text-white'}`} strokeWidth={3} />
        )}
      </div>
      {label && (
        <span className={`text-sm ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>{label}</span>
      )}
    </label>
  );
}
