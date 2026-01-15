import { useRef, useEffect } from 'react';

export interface ActionMenuItem {
  id: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

type HorizontalAlignment = 'left' | 'right';
type VerticalAlignment = 'top' | 'bottom';

interface ActionMenuProps {
  items: ActionMenuItem[];
  isOpen: boolean;
  onClose: () => void;
  horizontalAlign?: HorizontalAlignment;
  verticalAlign?: VerticalAlignment;
}

export function ActionMenu({
  items,
  isOpen,
  onClose,
  horizontalAlign = 'left',
  verticalAlign = 'bottom',
}: ActionMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const horizontalClass = horizontalAlign === 'right' ? 'right-0' : 'left-0';
  const verticalClass = verticalAlign === 'top' ? 'bottom-full mb-1' : 'top-full mt-1';

  return (
    <div
      ref={menuRef}
      className={`absolute ${horizontalClass} ${verticalClass} z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[280px]`}
    >
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => {
            if (!item.disabled) {
              item.onClick();
              onClose();
            }
          }}
          disabled={item.disabled}
          className={`w-full text-left px-4 py-2.5 text-xs transition-colors ${
            item.disabled
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
