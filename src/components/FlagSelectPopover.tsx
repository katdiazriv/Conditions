import { useState, useRef, useEffect } from 'react';
import { RadioButton } from './RadioButton';
import { Button } from './Button';
import { FLAG_COLOR_OPTIONS, FLAG_COLORS } from '../types/conditions';
import type { FlagColor } from '../types/conditions';

type HorizontalAlignment = 'left' | 'right';
type VerticalAlignment = 'top' | 'bottom';

interface FlagSelectPopoverProps {
  currentColor: FlagColor | null;
  onApply: (color: FlagColor | null) => void;
  onClose: () => void;
  horizontalAlign?: HorizontalAlignment;
  verticalAlign?: VerticalAlignment;
}

export function FlagSelectPopover({
  currentColor,
  onApply,
  onClose,
  horizontalAlign = 'left',
  verticalAlign = 'bottom',
}: FlagSelectPopoverProps) {
  const [selectedColor, setSelectedColor] = useState<FlagColor | null>(currentColor);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  function handleApply() {
    onApply(selectedColor);
    onClose();
  }

  const horizontalClass = horizontalAlign === 'right' ? 'right-0' : 'left-0';
  const verticalClass = verticalAlign === 'top' ? 'bottom-full mb-2' : 'top-full mt-2';

  return (
    <div
      ref={popoverRef}
      className={`absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-64 ${horizontalClass} ${verticalClass}`}
    >
      <h3 className="text-sm font-semibold text-gray-900 mb-1">Select Flag</h3>
      <p className="text-xs text-gray-500 mb-4">
        These flags are your personal flags and will not be visible to others accessing the file.
      </p>

      <div className="space-y-2">
        {FLAG_COLOR_OPTIONS.map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-3 cursor-pointer py-1"
          >
            <RadioButton
              name="flag-color"
              checked={selectedColor === option.value}
              onChange={() => setSelectedColor(option.value)}
            />
            <span
              className={`w-3 h-3 rounded-full ${FLAG_COLORS[option.value].bg}`}
            />
            <span className="text-sm text-gray-700">{option.label}</span>
          </label>
        ))}

        <label className="flex items-center gap-3 cursor-pointer py-1">
          <RadioButton
            name="flag-color"
            checked={selectedColor === null}
            onChange={() => setSelectedColor(null)}
          />
          <span className="w-3 h-3 rounded-full border-2 border-cmg-teal bg-white" />
          <span className="text-sm text-gray-700">No Flag</span>
        </label>
      </div>

      <div className="mt-4">
        <Button
          variant="primary"
          size="md"
          onClick={handleApply}
          className="w-full justify-center"
        >
          Apply
        </Button>
      </div>
    </div>
  );
}
