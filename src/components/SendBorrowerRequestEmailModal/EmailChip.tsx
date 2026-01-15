import { X } from 'lucide-react';

interface EmailChipProps {
  email: string;
  onRemove: () => void;
}

export function EmailChip({ email, onRemove }: EmailChipProps) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-cmg-teal-lightest border border-cmg-teal/30 text-gray-700 text-xs rounded">
      {email}
      <button
        type="button"
        onClick={onRemove}
        className="p-0.5 hover:bg-cmg-teal/20 rounded transition-colors"
      >
        <X className="w-3 h-3 text-gray-500" />
      </button>
    </span>
  );
}
