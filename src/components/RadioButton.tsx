import { InputHTMLAttributes } from 'react';

interface RadioButtonProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  labelClassName?: string;
}

export function RadioButton({
  checked = false,
  onChange,
  label,
  labelClassName = '',
  className = '',
  disabled,
  ...props
}: RadioButtonProps) {
  return (
    <label className={`relative inline-flex items-center ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} gap-2`}>
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only peer"
        {...props}
      />
      <div
        className={`
          w-5 h-5 border rounded-full
          flex items-center justify-center
          transition-all duration-200
          peer-focus:ring-2 peer-focus:ring-cmg-teal peer-focus:ring-offset-1
          ${disabled ? 'bg-gray-100 border-gray-300' : ''}
          ${
            !disabled && checked
              ? 'bg-white border-cmg-teal'
              : !disabled && !checked
              ? 'bg-white border-gray-300 peer-hover:border-cmg-teal'
              : ''
          }
          ${className}
        `}
      >
        {checked && (
          <div className={`w-2.5 h-2.5 rounded-full ${disabled ? 'bg-gray-400' : 'bg-cmg-teal'}`} />
        )}
      </div>
      {label && <span className={labelClassName}>{label}</span>}
    </label>
  );
}
