import { InputHTMLAttributes, forwardRef, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DatepickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  label?: string;
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  error?: boolean;
  helperText?: string;
  dateFormat?: (date: Date) => string;
  minDate?: Date;
  maxDate?: Date;
  showClearButton?: boolean;
}

const defaultDateFormat = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
};

export const Datepicker = forwardRef<HTMLInputElement, DatepickerProps>(
  (
    {
      label,
      value = null,
      onChange,
      error = false,
      helperText,
      dateFormat = defaultDateFormat,
      minDate,
      maxDate,
      showClearButton = true,
      className = '',
      placeholder = 'Select date',
      disabled,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(value || new Date());
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;
        if (
          containerRef.current &&
          !containerRef.current.contains(target) &&
          dropdownRef.current &&
          !dropdownRef.current.contains(target)
        ) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen]);

    useEffect(() => {
      if (isOpen && inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 8,
          left: rect.left + window.scrollX,
          width: Math.max(rect.width, 320),
        });
      }
    }, [isOpen]);

    const getDaysInMonth = (date: Date) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startingDayOfWeek = firstDay.getDay();

      return { daysInMonth, startingDayOfWeek, year, month };
    };

    const handleDateSelect = (day: number) => {
      const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);

      if (minDate && newDate < minDate) return;
      if (maxDate && newDate > maxDate) return;

      onChange?.(newDate);
      setIsOpen(false);
    };

    const handlePreviousMonth = () => {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const handleNextMonth = () => {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const handleClear = () => {
      onChange?.(null);
    };

    const isDateDisabled = (day: number): boolean => {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      if (minDate && date < minDate) return true;
      if (maxDate && date > maxDate) return true;
      return false;
    };

    const isDateSelected = (day: number): boolean => {
      if (!value) return false;
      return (
        value.getDate() === day &&
        value.getMonth() === currentMonth.getMonth() &&
        value.getFullYear() === currentMonth.getFullYear()
      );
    };

    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
    const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
      <div className="flex flex-col gap-2" ref={containerRef}>
        {label && (
          <label className="text-xs font-medium text-gray-900">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={(node) => {
              (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
              if (typeof ref === 'function') {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
            }}
            type="text"
            readOnly
            value={value ? dateFormat(value) : ''}
            placeholder={placeholder}
            disabled={disabled}
            onClick={() => !disabled && setIsOpen(!isOpen)}
            className={`
              w-full h-9 px-4 pr-20 text-xs
              bg-white border rounded-lg
              cursor-pointer
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
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {showClearButton && value && !disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            )}
            <button
              type="button"
              onClick={() => !disabled && setIsOpen(!isOpen)}
              disabled={disabled}
              className="text-gray-400 hover:text-cmg-teal transition-colors"
            >
              <Calendar size={20} />
            </button>
          </div>

          {isOpen && createPortal(
            <div
              ref={dropdownRef}
              style={{
                position: 'absolute',
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                minWidth: dropdownPosition.width,
              }}
              className="z-[9999] bg-white border border-gray-200 rounded-lg shadow-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={handlePreviousMonth}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-xs font-medium text-gray-900">{monthName}</span>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                  <div key={day} className="text-center text-2xs font-medium text-gray-600 py-2">
                    {day}
                  </div>
                ))}

                {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                  <div key={`empty-${index}`} />
                ))}

                {Array.from({ length: daysInMonth }).map((_, index) => {
                  const day = index + 1;
                  const disabled = isDateDisabled(day);
                  const selected = isDateSelected(day);

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => !disabled && handleDateSelect(day)}
                      disabled={disabled}
                      className={`
                        py-2 text-xs rounded transition-all duration-200
                        ${
                          selected
                            ? 'bg-cmg-teal text-white font-medium'
                            : disabled
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-700 hover:bg-cmg-teal-lightest hover:text-cmg-teal'
                        }
                      `}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>,
            document.body
          )}
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

Datepicker.displayName = 'Datepicker';
