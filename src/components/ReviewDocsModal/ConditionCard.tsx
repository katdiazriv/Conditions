import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { type ConditionGroup, getDocumentReviewState } from '../../hooks/useReviewDocsWizard';
import type { ConditionStatus, Stage } from '../../types/conditions';
import type { UserRole } from '../../types/roles';
import { DocumentThumbnail } from './DocumentThumbnail';
import { Button } from '../Button';
import { Badge } from '../Badge';
import { ExpansionPanel } from '../ExpansionPanel';
import { NoteEditor } from '../NoteEditor';
import { ConditionNoteItem } from '../ConditionNoteItem';

interface ConditionCardProps {
  conditionGroup: ConditionGroup;
  isExpanded: boolean;
  onToggle: () => void;
  selectedDocumentId: string | null;
  userRole: UserRole;
  onSelectDocument: (documentId: string) => void;
  onUpdateConditionStatus: (conditionId: string, status: ConditionStatus, stage?: Stage) => Promise<boolean>;
  onAddConditionNote: (conditionId: string, content: string) => Promise<boolean>;
}

export function ConditionCard({
  conditionGroup,
  isExpanded,
  onToggle,
  selectedDocumentId,
  userRole,
  onSelectDocument,
  onUpdateConditionStatus,
  onAddConditionNote,
}: ConditionCardProps) {
  const { condition, documents, docsToReviewCount } = conditionGroup;
  const [noteContent, setNoteContent] = useState('');
  const [isNoteExpanded, setIsNoteExpanded] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [showAllNotes, setShowAllNotes] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const documentsByType = useMemo(() => {
    const byType: Record<string, typeof documents> = {};
    documents.forEach((doc) => {
      const key = doc.document_type
        ? `${doc.document_type}${doc.partyName ? ` (${doc.partyName})` : ''}`
        : 'Miscellaneous';
      if (!byType[key]) {
        byType[key] = [];
      }
      byType[key].push(doc);
    });
    return byType;
  }, [documents]);

  async function handleStatusUpdate(status: ConditionStatus, stage?: Stage) {
    setUpdatingStatus(true);
    await onUpdateConditionStatus(condition.id, status, stage);
    setUpdatingStatus(false);
  }

  async function handleAddNote() {
    if (!noteContent.trim() || noteContent === '<p></p>' || isSavingNote) return;

    setIsSavingNote(true);
    const success = await onAddConditionNote(condition.id, noteContent);
    setIsSavingNote(false);

    if (success) {
      setNoteContent('');
      setIsNoteExpanded(false);
    }
  }

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
        <span className="flex-1 min-w-0 text-sm font-semibold text-gray-700 truncate">{condition.condition_id}</span>
        {!isExpanded && docsToReviewCount > 0 && (
          <span className="flex-shrink-0 whitespace-nowrap px-2 py-1 text-2xs font-bold rounded-full bg-[#EAF6F7] text-cmg-teal">
            {docsToReviewCount} Docs to Review
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
          <div>
            <div className="text-xs font-semibold text-gray-900">{condition.title}</div>
            <div className="text-[11px] text-gray-600 mt-1 line-clamp-3">
              {condition.description}
            </div>
          </div>

          {Object.entries(documentsByType).map(([typeKey, docs]) => {
            const reviewState = (docId: string) => {
              const doc = docs.find((d) => d.id === docId);
              return doc ? getDocumentReviewState(doc, userRole) : 'pending';
            };
            return (
              <div key={typeKey}>
                <div className="text-[10px] font-semibold text-gray-700 mb-2">{typeKey}</div>
                <div className="flex flex-wrap gap-2">
                  {docs.map((doc) => (
                    <DocumentThumbnail
                      key={doc.id}
                      document={doc}
                      isSelected={selectedDocumentId === doc.id}
                      isAccepted={reviewState(doc.id) === 'accepted'}
                      isRejected={reviewState(doc.id) === 'rejected'}
                      onClick={() => onSelectDocument(doc.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          <div className="pt-2 border-t border-gray-100">
            <ExpansionPanel
              title="Condition Notes"
              size="sm"
              noBorder
              rightContent={<Badge variant="light">{condition.notes.length}</Badge>}
            >
              {!isNoteExpanded ? (
                <button
                  onClick={() => setIsNoteExpanded(true)}
                  className="w-full h-9 px-3 text-left text-xs text-gray-400 bg-white border border-gray-300 rounded-lg hover:border-cmg-teal focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-cmg-teal transition-colors"
                >
                  Add Condition Notes...
                </button>
              ) : (
                <div className="mb-2">
                  <NoteEditor
                    value={noteContent}
                    onChange={setNoteContent}
                    placeholder="Add Condition Notes..."
                    onSubmit={handleAddNote}
                    autoFocus
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={() => {
                        setNoteContent('');
                        setIsNoteExpanded(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleAddNote}
                      disabled={!noteContent.trim() || noteContent === '<p></p>' || isSavingNote}
                    >
                      {isSavingNote ? 'Saving...' : 'Add Note'}
                    </Button>
                  </div>
                </div>
              )}

              {condition.notes.length > 0 && (
                <div className="mt-4">
                  {(showAllNotes ? condition.notes : [condition.notes[0]]).map((note) => (
                    <ConditionNoteItem key={note.id} note={note} />
                  ))}

                  {condition.notes.length > 1 && (
                    <button
                      onClick={() => setShowAllNotes(!showAllNotes)}
                      className="text-xs font-medium text-cmg-teal hover:text-cmg-teal-dark transition-colors"
                    >
                      {showAllNotes ? 'Show Less' : `See All Notes (${condition.notes.length})`}
                    </button>
                  )}
                </div>
              )}
            </ExpansionPanel>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <ExpansionPanel
              title="Set Condition Status"
              size="sm"
              expandable={false}
              noBorder
            >
              <div className="text-xs text-gray-500 mb-3">
                Current status: {condition.status}
              </div>
              <div className="flex gap-2">
                {userRole === 'Underwriter' ? (
                  <>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => handleStatusUpdate('Not Cleared', 'Suspend')}
                      disabled={updatingStatus}
                    >
                      Suspend
                    </Button>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => handleStatusUpdate('Not Cleared')}
                      disabled={updatingStatus}
                    >
                      Not Cleared
                    </Button>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => handleStatusUpdate('Cleared')}
                      disabled={updatingStatus}
                    >
                      Cleared
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => handleStatusUpdate('Requested')}
                      disabled={updatingStatus}
                    >
                      Not Ready
                    </Button>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => handleStatusUpdate('Ready for UW')}
                      disabled={updatingStatus}
                    >
                      Ready for UW
                    </Button>
                  </>
                )}
              </div>
            </ExpansionPanel>
          </div>
        </div>
      )}
    </div>
  );
}
