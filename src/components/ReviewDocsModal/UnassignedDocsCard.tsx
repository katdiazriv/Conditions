import { ChevronDown, ChevronUp } from 'lucide-react';
import { type DocumentForReview, getDocumentReviewState } from '../../hooks/useReviewDocsWizard';
import type { UserRole } from '../../types/roles';
import { DocumentThumbnail } from './DocumentThumbnail';

interface UnassignedDocsCardProps {
  documentsByType: Record<string, DocumentForReview[]>;
  isExpanded: boolean;
  onToggle: () => void;
  selectedDocumentId: string | null;
  userRole: UserRole;
  onSelectDocument: (documentId: string) => void;
}

export function UnassignedDocsCard({
  documentsByType,
  isExpanded,
  onToggle,
  selectedDocumentId,
  userRole,
  onSelectDocument,
}: UnassignedDocsCardProps) {
  const docsToReview = Object.values(documentsByType)
    .flat()
    .filter((doc) => getDocumentReviewState(doc, userRole) === 'pending').length;

  const cardBorderStyles = isExpanded
    ? 'border-2 border-cmg-teal'
    : 'border border-gray-200';

  return (
    <div className={`bg-white rounded-lg overflow-hidden ${cardBorderStyles}`}>
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle();
          }
        }}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <span className="flex-1 min-w-0 text-sm font-semibold text-gray-700 text-left truncate">
          Not Assigned to Condition
        </span>
        {!isExpanded && docsToReview > 0 && (
          <span className="flex-shrink-0 whitespace-nowrap px-2 py-1 text-2xs font-bold rounded-full bg-[#EAF6F7] text-cmg-teal">
            {docsToReview} Docs to Review
          </span>
        )}
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
        )}
      </div>

      {isExpanded && (
        <div className="px-3 pb-3 space-y-3">
          {Object.entries(documentsByType).map(([docType, docs]) => (
            <div key={docType}>
              <div className="text-[10px] font-medium text-gray-500 mb-2">
                {docType} ({docs.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {docs.map((doc) => {
                  const reviewState = getDocumentReviewState(doc, userRole);
                  return (
                    <DocumentThumbnail
                      key={doc.id}
                      document={doc}
                      isSelected={selectedDocumentId === doc.id}
                      isAccepted={reviewState === 'accepted'}
                      isRejected={reviewState === 'rejected'}
                      onClick={() => onSelectDocument(doc.id)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
