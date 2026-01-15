import { X } from 'lucide-react';

interface RemovableTagProps {
  label: string;
  onRemove: () => void;
}

export function RemovableTag({ label, onRemove }: RemovableTagProps) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="p-0.5 hover:bg-gray-200 rounded transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}
