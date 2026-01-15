import { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, AlertTriangle, Trash2 } from 'lucide-react';
import type { ConditionStatus, FlagColor } from '../types/conditions';
import { STATUS_OPTIONS } from '../types/conditions';
import { FlagSelectPopover } from './FlagSelectPopover';
import { TextButton } from './TextButton';

interface BulkActionsBarProps {
  selectedCount: number;
  onDeselectAll: () => void;
  onSetFlag: (color: FlagColor | null) => void;
  onSetStatus: (status: ConditionStatus) => void;
  onSuspend: () => void;
  onRemove: () => void;
}

export function BulkActionsBar({
  selectedCount,
  onDeselectAll,
  onSetFlag,
  onSetStatus,
  onSuspend,
  onRemove,
}: BulkActionsBarProps) {
  const [showFlagDropdown, setShowFlagDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const flagRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setShowStatusDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2">
      <div className="flex items-center gap-6">
        <button
          onClick={onDeselectAll}
          className="flex items-center gap-1.5 text-xs text-gray-700 hover:text-gray-900"
        >
          <X className="w-3.5 h-3.5" />
          <span>Deselect All</span>
        </button>

        <div className="h-4 w-px bg-gray-300" />

        <span className="text-xs text-gray-600">
          ({selectedCount})
        </span>

        <div ref={flagRef} className="relative">
          <TextButton
            onClick={() => setShowFlagDropdown(!showFlagDropdown)}
            icon={<ChevronDown className="w-3.5 h-3.5" />}
            iconPosition="right"
            size="md"
          >
            Flag
          </TextButton>
          {showFlagDropdown && (
            <div className="absolute top-full left-0 mt-1 z-50">
              <FlagSelectPopover
                currentColor={null}
                onApply={(color) => {
                  onSetFlag(color);
                  setShowFlagDropdown(false);
                }}
                onClose={() => setShowFlagDropdown(false)}
              />
            </div>
          )}
        </div>

        <div ref={statusRef} className="relative">
          <TextButton
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
            icon={<ChevronDown className="w-3.5 h-3.5" />}
            iconPosition="right"
            size="md"
          >
            Set Condition Status
          </TextButton>
          {showStatusDropdown && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[180px]">
              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    onSetStatus(status);
                    setShowStatusDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50"
                >
                  {status}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="h-4 w-px bg-gray-300" />

        <TextButton
          onClick={onSuspend}
          icon={<AlertTriangle className="w-3.5 h-3.5" />}
          size="md"
          variant="danger"
        >
          Suspend
        </TextButton>

        <TextButton
          onClick={onRemove}
          icon={<Trash2 className="w-3.5 h-3.5" />}
          size="md"
        >
          Remove
        </TextButton>
      </div>
    </div>
  );
}
