import { ChevronRight, ChevronLeft } from 'lucide-react';

interface TransferButtonsProps {
  onAdd: () => void;
  onRemove: () => void;
  addDisabled: boolean;
  removeDisabled: boolean;
}

export function TransferButtons({
  onAdd,
  onRemove,
  addDisabled,
  removeDisabled,
}: TransferButtonsProps) {
  return (
    <div className="flex flex-col gap-2 px-2 py-4 justify-center">
      <button
        onClick={onAdd}
        disabled={addDisabled}
        className={`flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-md border transition-colors ${
          addDisabled
            ? 'border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed'
            : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
        }`}
      >
        Add
        <ChevronRight className="w-4 h-4" />
      </button>
      <button
        onClick={onRemove}
        disabled={removeDisabled}
        className={`flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-md border transition-colors ${
          removeDisabled
            ? 'border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed'
            : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
        }`}
      >
        <ChevronLeft className="w-4 h-4" />
        Remove
      </button>
    </div>
  );
}
