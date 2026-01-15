import type { ConditionGroup, DocumentForReview } from '../../hooks/useReviewDocsWizard';
import type { ConditionStatus, Stage } from '../../types/conditions';
import type { UserRole } from '../../types/roles';
import { UnassignedDocsCard } from './UnassignedDocsCard';
import { ConditionCard } from './ConditionCard';

type ExpandedCardId = string | 'unassigned' | null;

interface DocumentExplorerProps {
  unassignedByType: Record<string, DocumentForReview[]>;
  conditionGroups: ConditionGroup[];
  selectedDocumentId: string | null;
  userRole: UserRole;
  onSelectDocument: (documentId: string) => void;
  onUpdateConditionStatus: (conditionId: string, status: ConditionStatus, stage?: Stage) => Promise<boolean>;
  onAddConditionNote: (conditionId: string, content: string) => Promise<boolean>;
  expandedCardId: ExpandedCardId;
  onExpandCard: (cardId: ExpandedCardId) => void;
}

export function DocumentExplorer({
  unassignedByType,
  conditionGroups,
  selectedDocumentId,
  userRole,
  onSelectDocument,
  onUpdateConditionStatus,
  onAddConditionNote,
  expandedCardId,
  onExpandCard,
}: DocumentExplorerProps) {
  const hasUnassignedDocs = Object.keys(unassignedByType).length > 0;

  return (
    <div className="p-3 space-y-2 bg-white">
      {hasUnassignedDocs && (
        <UnassignedDocsCard
          documentsByType={unassignedByType}
          isExpanded={expandedCardId === 'unassigned'}
          onToggle={() => onExpandCard('unassigned')}
          selectedDocumentId={selectedDocumentId}
          userRole={userRole}
          onSelectDocument={onSelectDocument}
        />
      )}

      {conditionGroups.map((group) => (
        <ConditionCard
          key={group.condition.id}
          conditionGroup={group}
          isExpanded={expandedCardId === group.condition.id}
          onToggle={() => onExpandCard(group.condition.id)}
          selectedDocumentId={selectedDocumentId}
          userRole={userRole}
          onSelectDocument={onSelectDocument}
          onUpdateConditionStatus={onUpdateConditionStatus}
          onAddConditionNote={onAddConditionNote}
        />
      ))}

      {!hasUnassignedDocs && conditionGroups.length === 0 && (
        <div className="text-center py-8 text-gray-400 text-sm">
          No documents to review
        </div>
      )}
    </div>
  );
}
