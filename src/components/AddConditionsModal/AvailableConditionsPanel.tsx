import { Search, Plus } from 'lucide-react';
import type { AvailableCondition } from '../../types/conditions';
import { Checkbox } from '../Checkbox';
import { Button } from '../Button';
import { Tag } from '../Tag';

interface AvailableConditionsPanelProps {
  conditions: AvailableCondition[];
  addedConditionIds: Set<string>;
  selectedIds: Set<string>;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onCustomClick: () => void;
  loading: boolean;
}

export function AvailableConditionsPanel({
  conditions,
  addedConditionIds,
  selectedIds,
  searchQuery,
  onSearchChange,
  onToggleSelect,
  onSelectAll,
  onCustomClick,
  loading,
}: AvailableConditionsPanelProps) {
  const allSelected = conditions.length > 0 &&
    conditions.every(c => selectedIds.has(c.id));

  return (
    <div className="flex-1 flex flex-col min-w-0 border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-gray-900 whitespace-nowrap">
            Available Conditions
          </h2>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search All Conditions"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-cmg-teal focus:border-transparent"
            />
          </div>
          <Button variant="primary" size="md" onClick={onCustomClick}>
            <Plus className="w-4 h-4" />
            Custom
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : conditions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No conditions found
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="w-10 px-3 py-2 text-left">
                  <Checkbox
                    checked={allSelected}
                    onChange={onSelectAll}
                  />
                </th>
                <th className="w-28 px-3 py-2 text-left text-2xs font-medium text-gray-500 uppercase">
                  No.
                </th>
                <th className="px-3 py-2 text-left text-2xs font-medium text-gray-500 uppercase">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {conditions.map(condition => {
                const isAdded = addedConditionIds.has(condition.condition_id);
                const isSelected = selectedIds.has(condition.id);

                return (
                  <tr
                    key={condition.id}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-3 py-3">
                      <Checkbox
                        checked={isSelected}
                        onChange={() => onToggleSelect(condition.id)}
                      />
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-900 align-top">
                      <div className="flex items-center gap-2">
                        <span>{condition.condition_id}</span>
                        {isAdded && (
                          <Tag variant="green" size="sm">Added</Tag>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-600 align-top">
                      <span className="font-medium text-gray-900">
                        {condition.title}:
                      </span>{' '}
                      <span className="line-clamp-1">{condition.description}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
