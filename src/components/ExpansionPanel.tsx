import { useState, ReactNode } from 'react';
import { ChevronUp } from 'lucide-react';

type ExpansionPanelSize = 'default' | 'sm';
type ExpansionPanelVariant = 'default' | 'text';

interface ExpansionPanelProps {
  title: string;
  defaultExpanded?: boolean;
  expandable?: boolean;
  size?: ExpansionPanelSize;
  variant?: ExpansionPanelVariant;
  rightContent?: ReactNode;
  children: ReactNode;
  noBorder?: boolean;
}

export function ExpansionPanel({
  title,
  defaultExpanded = true,
  expandable = true,
  size = 'default',
  variant = 'default',
  rightContent,
  children,
  noBorder = false,
}: ExpansionPanelProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const effectiveExpanded = expandable ? isExpanded : true;

  const isTextVariant = variant === 'text';

  const headerSizeStyles = size === 'sm'
    ? 'h-6 px-2'
    : isTextVariant ? 'h-8 px-4' : 'h-8 px-4';

  const titleSizeStyles = size === 'sm'
    ? 'text-xs font-semibold'
    : isTextVariant ? 'text-xs font-bold' : 'text-sm font-semibold';

  const chevronSizeStyles = size === 'sm'
    ? 'w-3.5 h-3.5'
    : isTextVariant ? 'w-3.5 h-3.5' : 'w-5 h-5';

  const contentPaddingStyles = size === 'sm'
    ? 'py-2'
    : 'px-4 py-4';

  const borderStyles = noBorder ? '' : 'border-t border-gray-200';

  const textVariantStyles = isTextVariant
    ? 'text-cmg-teal hover:text-cmg-teal-dark'
    : 'text-gray-900';

  const defaultHeaderStyles = 'w-full flex items-center justify-between bg-gray-100 rounded-md hover:bg-gray-200 transition-colors';
  const textHeaderStyles = 'flex items-center gap-1 transition-colors';

  return (
    <div className={borderStyles}>
      {expandable ? (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className={isTextVariant ? `${textHeaderStyles} ${headerSizeStyles}` : `${defaultHeaderStyles} ${headerSizeStyles}`}
        >
          {isTextVariant ? (
            <>
              <span className={`${textVariantStyles} ${titleSizeStyles}`}>{title}</span>
              <ChevronUp
                className={`text-cmg-teal transition-transform duration-200 ${chevronSizeStyles} ${
                  effectiveExpanded ? '' : 'rotate-180'
                }`}
              />
              {rightContent && <div className="flex items-center ml-2">{rightContent}</div>}
            </>
          ) : (
            <>
              <span className={`${textVariantStyles} ${titleSizeStyles}`}>{title}</span>
              <div className="flex items-center gap-2">
                {rightContent}
                <ChevronUp
                  className={`text-gray-500 transition-transform duration-200 ${chevronSizeStyles} ${
                    effectiveExpanded ? '' : 'rotate-180'
                  }`}
                />
              </div>
            </>
          )}
        </button>
      ) : (
        <div
          className={`w-full flex items-center justify-between bg-gray-100 rounded-md ${headerSizeStyles}`}
        >
          <span className={`text-gray-900 ${titleSizeStyles}`}>{title}</span>
          {rightContent && <div className="flex items-center">{rightContent}</div>}
        </div>
      )}
      <div
        className={`overflow-hidden transition-all duration-200 ${
          effectiveExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className={contentPaddingStyles}>{children}</div>
      </div>
    </div>
  );
}

interface ExpansionPanelRowProps {
  label: string;
  value: string;
}

export function ExpansionPanelRow({ label, value }: ExpansionPanelRowProps) {
  return (
    <div className="flex py-2">
      <span className="text-sm text-gray-900 w-32 flex-shrink-0">{label}</span>
      <span className="text-sm text-gray-900">{value}</span>
    </div>
  );
}
