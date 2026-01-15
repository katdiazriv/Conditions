import { ChevronDown, ChevronRight } from 'lucide-react';
import type { Stage } from '../types/conditions';
import { Checkbox } from './Checkbox';

interface SectionHeaderProps {
  stage: Stage;
  count: number;
  isCollapsed: boolean;
  onToggle: () => void;
  isSelected: boolean;
  onSelectAll: () => void;
}

export function SectionHeader({
  stage,
  count,
  isCollapsed,
  onToggle,
  isSelected,
  onSelectAll,
}: SectionHeaderProps) {
  return (
    <div className="bg-gray-100 border-b border-gray-200 px-4 py-2">
      <div className="flex items-center gap-3">
        <Checkbox
          checked={isSelected}
          onChange={onSelectAll}
        />

        <button
          onClick={onToggle}
          className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        <span className="text-xs font-semibold text-gray-800">
          {stage} ({count})
        </span>
      </div>
    </div>
  );
}
