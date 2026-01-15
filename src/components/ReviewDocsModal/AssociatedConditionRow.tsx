import { MinusCircle } from 'lucide-react';
import { SearchableDropdown } from '../SearchableDropdown';
import { Dropdown } from '../Dropdown';
import type { ConditionWithRelations, ConditionStatus } from '../../types/conditions';
import { STATUS_OPTIONS } from '../../types/conditions';

interface AssociatedConditionRowProps {
  conditionId: string;
  status: ConditionStatus | null;
  conditions: ConditionWithRelations[];
  excludedConditionIds: string[];
  onConditionChange: (newConditionId: string) => void;
  onStatusChange: (newStatus: ConditionStatus) => void;
  onRemove: () => void;
}

export function AssociatedConditionRow({
  conditionId,
  status,
  conditions,
  excludedConditionIds,
  onConditionChange,
  onStatusChange,
  onRemove,
}: AssociatedConditionRowProps) {
  const selectedCondition = conditions.find((c) => c.id === conditionId);

  const availableConditions = conditions.filter(
    (c) => c.id === conditionId || !excludedConditionIds.includes(c.id)
  );

  const conditionOptions = availableConditions.map((c) => ({
    value: c.id,
    label: `${c.condition_id} - ${c.title}`,
    description: c.description,
  }));

  const statusOptions = STATUS_OPTIONS.map((s) => ({
    value: s,
    label: s,
  }));

  const displayStatus = status ?? selectedCondition?.status ?? 'New';

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Condition <span className="text-red-500">*</span>
          </label>
          <SearchableDropdown
            value={conditionId}
            onChange={onConditionChange}
            options={conditionOptions}
            placeholder="Select condition..."
          />
        </div>

        <div className="w-[140px] flex-shrink-0">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Condition Status <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-1">
            <Dropdown
              value={displayStatus}
              onChange={(e) => onStatusChange(e.target.value as ConditionStatus)}
              options={statusOptions}
              className="flex-1"
            />
            <button
              type="button"
              onClick={onRemove}
              className="flex-shrink-0 p-1 text-red-500 hover:text-red-600 transition-colors"
              title="Remove association"
            >
              <MinusCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {selectedCondition && (
        <div>
          <span className="text-[10px] text-gray-400 uppercase tracking-wide">
            Condition Description
          </span>
          <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
            {selectedCondition.description}
          </p>
        </div>
      )}
    </div>
  );
}
