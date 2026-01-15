import { Tag } from '../Tag';

interface ConditionFilterBarProps {
  conditionDisplayId: string;
  onClear: () => void;
}

export function ConditionFilterBar({ conditionDisplayId, onClear }: ConditionFilterBarProps) {
  return (
    <div className="px-4 py-2.5 bg-white border-b border-gray-200 flex items-center gap-2 animate-fade-in">
      <span className="text-xs text-gray-500">Filtered by:</span>
      <Tag variant="grey" onDismiss={onClear}>
        {conditionDisplayId}
      </Tag>
    </div>
  );
}
