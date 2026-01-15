import { useRef, useEffect } from 'react';
import { Checkbox } from '../Checkbox';
import type { DocRequestWithParty } from '../../hooks/useDocRequestsByParty';

interface DocRequestRowProps {
  docRequest: DocRequestWithParty;
  isSelected: boolean;
  onSelect: () => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  conditionCode: string;
  conditionName: string;
  conditionDescription: string;
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

export function DocRequestRow({
  docRequest,
  isSelected,
  onSelect,
  description,
  onDescriptionChange,
  conditionCode,
  conditionName,
  conditionDescription,
}: DocRequestRowProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const showNeedToRequest = !docRequest.requested_date;
  const requestedDate = docRequest.requested_date ? formatDate(docRequest.requested_date) : null;

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [description]);

  const conditionText = [conditionCode, conditionName].filter(Boolean).join(' - ');
  const fullConditionText = conditionDescription
    ? `${conditionText}: ${conditionDescription}`
    : conditionText;

  return (
    <div className="flex items-start gap-3 py-2.5 px-4">
      <div className="pt-1">
        <Checkbox checked={isSelected} onChange={onSelect} />
      </div>
      <div className="w-[512px] flex-shrink-0">
        <span className="text-xs text-gray-500 leading-relaxed">
          {fullConditionText}
        </span>
      </div>
      <span className="text-xs font-semibold text-gray-900 w-36 flex-shrink-0 truncate pt-1">
        {docRequest.document_type}
      </span>
      <textarea
        ref={textareaRef}
        rows={1}
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
        placeholder="Enter description for borrower..."
        className="flex-1 min-w-0 min-h-[36px] text-xs text-gray-700 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-cmg-teal focus:border-cmg-teal resize-none overflow-hidden"
      />
      <div className="w-32 flex-shrink-0 text-right pt-1">
        {showNeedToRequest ? (
          <span className="text-2xs font-medium text-[#867704] uppercase">
            Need to Request
          </span>
        ) : (
          <span className="text-2xs text-gray-500">
            Requested {requestedDate}
          </span>
        )}
      </div>
    </div>
  );
}
