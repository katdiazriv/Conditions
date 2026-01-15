import { ArrowUpDown, Info, Filter } from 'lucide-react';
import { TextButton } from './TextButton';

interface ColumnHeadersProps {
  onCollapseAll: () => void;
  allCollapsed: boolean;
  onExpandAll: () => void;
}

export function ColumnHeaders({ onCollapseAll, allCollapsed, onExpandAll }: ColumnHeadersProps) {
  return (
    <div className="bg-gray-50 border-b border-gray-200 px-4 py-2">
      <div className="grid grid-cols-[40px_140px_1fr_160px_400px_180px_120px_100px] gap-2 items-center">
        <div className="flex items-center justify-center">
          <Filter className="w-4 h-4 text-gray-400" />
        </div>

        <div className="flex items-center gap-1 text-xs font-semibold text-gray-600 uppercase tracking-wide">
          <span>Category</span>
        </div>

        <div className="flex items-center gap-1 text-xs font-semibold text-gray-600 uppercase tracking-wide">
          <span>Condition Description</span>
          <ArrowUpDown className="w-3 h-3 text-gray-400" />
        </div>

        <div className="flex items-center gap-1 text-xs font-semibold text-gray-600 uppercase tracking-wide">
          <span>Status</span>
          <Info className="w-3 h-3 text-gray-400" />
          <ArrowUpDown className="w-3 h-3 text-gray-400" />
        </div>

        <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          Condition Notes
        </div>

        <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          Doc Requests
        </div>

        <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          Docs
        </div>

        <div className="text-right">
          <TextButton
            onClick={allCollapsed ? onExpandAll : onCollapseAll}
            size="md"
          >
            {allCollapsed ? 'Expand All' : 'Collapse All'}
          </TextButton>
        </div>
      </div>
    </div>
  );
}
