import { useState } from 'react';
import { ChevronUp } from 'lucide-react';
import { PartyCard } from './PartyCard';
import type { ParentGroup } from '../../hooks/useDocRequestsByParty';

interface ParentSectionProps {
  parentGroup: ParentGroup;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
  descriptions: Map<string, string>;
  onDescriptionChange: (id: string, value: string) => void;
  defaultExpanded?: boolean;
}

export function ParentSection({
  parentGroup,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  descriptions,
  onDescriptionChange,
  defaultExpanded = true,
}: ParentSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full h-10 flex items-center justify-between px-4 bg-stone-100 hover:bg-stone-200 transition-colors"
      >
        <span className="text-sm font-bold text-gray-900">
          {parentGroup.parentLabel}
        </span>
        <ChevronUp
          className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
            isExpanded ? '' : 'rotate-180'
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          isExpanded ? 'max-h-[4000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-4 space-y-3 bg-stone-50">
          {parentGroup.partyGroups.map(partyGroup => (
            <PartyCard
              key={partyGroup.partyId}
              partyGroup={partyGroup}
              selectedIds={selectedIds}
              onToggleSelect={onToggleSelect}
              onSelectAll={onSelectAll}
              descriptions={descriptions}
              onDescriptionChange={onDescriptionChange}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
