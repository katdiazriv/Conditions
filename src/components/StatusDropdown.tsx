import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import type { ConditionStatus } from '../types/conditions';
import { STATUS_OPTIONS } from '../types/conditions';

interface StatusDropdownProps {
  status: ConditionStatus;
  onStatusChange: (status: ConditionStatus) => void;
}

export function StatusDropdown({ status, onStatusChange }: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-xs text-gray-900 hover:text-cmg-teal"
      >
        <span>{status}</span>
        <ChevronDown className="w-3 h-3 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-44 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option}
              onClick={() => {
                onStatusChange(option);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 ${
                status === option
                  ? 'bg-gray-50 text-cmg-teal font-medium'
                  : 'text-gray-700'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
