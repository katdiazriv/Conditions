import { Check, X, FileText } from 'lucide-react';
import type { DocumentForReview } from '../../hooks/useReviewDocsWizard';

interface DocumentThumbnailProps {
  document: DocumentForReview;
  isSelected: boolean;
  isAccepted: boolean;
  isRejected: boolean;
  onClick: () => void;
}

export function DocumentThumbnail({
  document,
  isSelected,
  isAccepted,
  isRejected,
  onClick,
}: DocumentThumbnailProps) {
  const thumbnailSrc = document.thumbnail_url;
  const displayName = document.document_name.length > 12
    ? `${document.document_name.slice(0, 10)}...`
    : document.document_name;

  const getBorderClass = () => {
    if (isSelected) return 'border-cmg-teal ring-2 ring-cmg-teal/30 border-2';
    if (isAccepted) return 'border-green-500 border-[3px]';
    if (isRejected) return 'border-red-500 border-[3px]';
    return 'border-gray-200 hover:border-gray-300 border-2';
  };

  return (
    <button
      onClick={onClick}
      className={`relative w-[72px] flex flex-col rounded overflow-hidden transition-all shadow-md ${getBorderClass()}`}
    >
      <div className="relative aspect-[3/4] bg-gray-100">
        {thumbnailSrc ? (
          <img
            src={thumbnailSrc}
            alt={document.document_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <FileText className="w-6 h-6 text-gray-300" />
          </div>
        )}

        {isAccepted && (
          <>
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center border-2 border-white shadow-sm z-10">
              <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-green-500/70 py-1">
              <span className="text-[10px] font-semibold text-white block text-center">
                Accepted
              </span>
            </div>
          </>
        )}

        {isRejected && (
          <>
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center border-2 border-white shadow-sm z-10">
              <X className="w-3.5 h-3.5 text-white" strokeWidth={3} />
            </div>
            <div className="absolute inset-0 bg-red-500/20" />
            <div className="absolute bottom-0 left-0 right-0 bg-red-500/70 py-1">
              <span className="text-[10px] font-semibold text-white block text-center">
                Rejected
              </span>
            </div>
          </>
        )}
      </div>

      <div className="px-1 py-0.5 bg-white">
        <div className="text-[9px] text-gray-600 truncate" title={document.document_name}>
          {displayName}
        </div>
      </div>
    </button>
  );
}
