import { useMemo } from 'react';
import { Checkbox } from '../Checkbox';
import { DocRequestRow } from './DocRequestRow';
import type { PartyGroup } from '../../hooks/useDocRequestsByParty';

interface PartyCardProps {
  partyGroup: PartyGroup;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
  descriptions: Map<string, string>;
  onDescriptionChange: (id: string, value: string) => void;
}

export function PartyCard({
  partyGroup,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  descriptions,
  onDescriptionChange,
}: PartyCardProps) {
  const docRequestIds = partyGroup.docRequests.map(dr => dr.id);

  const selectionState = useMemo(() => {
    const selectedCount = docRequestIds.filter(id => selectedIds.has(id)).length;
    if (selectedCount === 0) return 'none';
    if (selectedCount === docRequestIds.length) return 'all';
    return 'partial';
  }, [docRequestIds, selectedIds]);

  const handleMasterCheckboxChange = () => {
    if (selectionState === 'all') {
      docRequestIds.forEach(id => {
        if (selectedIds.has(id)) {
          onToggleSelect(id);
        }
      });
    } else {
      onSelectAll(docRequestIds);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="flex items-center gap-3 py-3 px-4 border-b border-gray-100">
        <Checkbox
          checked={selectionState === 'all'}
          onChange={handleMasterCheckboxChange}
        />
        <span className="text-xs font-bold text-gray-900">
          {partyGroup.partyDisplay}
        </span>
      </div>
      <div className="divide-y divide-gray-100">
        {partyGroup.docRequests.map(dr => (
          <DocRequestRow
            key={dr.id}
            docRequest={dr}
            isSelected={selectedIds.has(dr.id)}
            onSelect={() => onToggleSelect(dr.id)}
            description={descriptions.get(dr.id) ?? dr.description_for_borrower ?? ''}
            onDescriptionChange={(value) => onDescriptionChange(dr.id, value)}
            conditionCode={dr.condition_code}
            conditionName={dr.condition_name}
            conditionDescription={dr.condition_description}
          />
        ))}
      </div>
    </div>
  );
}
