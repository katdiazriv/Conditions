import { useState, useEffect } from 'react';
import { FileText, Info, PlusCircle } from 'lucide-react';
import type { DocumentForReview } from '../../hooks/useReviewDocsWizard';
import type {
  DocumentNote,
  ConditionWithRelations,
  PendingDocumentAssociation,
  ConditionStatus,
  LoanParty,
} from '../../types/conditions';
import { InputText } from '../InputText';
import { SearchableDropdown } from '../SearchableDropdown';
import { TextArea } from '../TextArea';
import { Datepicker } from '../Datepicker';
import { ExpansionPanel } from '../ExpansionPanel';
import { TextButton } from '../TextButton';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { NoteEditor } from '../NoteEditor';
import { ConditionNoteItem } from '../ConditionNoteItem';
import { DOCUMENT_TYPE_OPTIONS } from '../../types/conditions';
import { AssociatedConditionRow } from './AssociatedConditionRow';

function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: '2-digit',
  }) + ' ' + date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

interface DocumentPropertiesPanelProps {
  document: DocumentForReview | null;
  notes: DocumentNote[];
  formState: {
    document_name: string;
    document_type: string;
    description: string;
    expiration_date: string;
    document_for_party_id: string;
  };
  onFieldChange: (field: string, value: string) => void;
  onAddNote: (content: string) => Promise<boolean>;
  loanConditions: ConditionWithRelations[];
  pendingAssociations: PendingDocumentAssociation[];
  onAssociationsChange: (associations: PendingDocumentAssociation[]) => void;
  loanParties: LoanParty[];
}

export function DocumentPropertiesPanel({
  document,
  notes,
  formState,
  onFieldChange,
  onAddNote,
  loanConditions,
  pendingAssociations,
  onAssociationsChange,
  loanParties,
}: DocumentPropertiesPanelProps) {
  const [isEditorExpanded, setIsEditorExpanded] = useState(false);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAllNotes, setShowAllNotes] = useState(false);

  useEffect(() => {
    if (document) {
      onFieldChange('document_name', document.document_name || '');
      onFieldChange('document_type', document.document_type || '');
      onFieldChange('description', document.description || '');
      onFieldChange('expiration_date', document.expiration_date?.split('T')[0] || '');
      onFieldChange('document_for_party_id', document.document_for_party_id || '');
    }
  }, [document?.id]);

  const borrowerParties = loanParties.filter(
    (party) => !party.party_type.includes('APP')
  );

  async function handleAddNote() {
    if (!content.trim() || content === '<p></p>' || isSubmitting) return;

    setIsSubmitting(true);
    const success = await onAddNote(content);
    setIsSubmitting(false);

    if (success) {
      setContent('');
      setIsEditorExpanded(false);
    }
  }

  function handleAddAssociation() {
    const newAssociation: PendingDocumentAssociation = {
      tempId: `temp-${Date.now()}`,
      conditionId: '',
      pendingStatus: null,
      isNew: true,
    };
    onAssociationsChange([...pendingAssociations, newAssociation]);
  }

  function handleConditionChange(tempId: string, newConditionId: string) {
    const condition = loanConditions.find((c) => c.id === newConditionId);
    onAssociationsChange(
      pendingAssociations.map((a) =>
        a.tempId === tempId
          ? { ...a, conditionId: newConditionId, pendingStatus: condition?.status ?? null }
          : a
      )
    );
  }

  function handleStatusChange(tempId: string, newStatus: ConditionStatus) {
    onAssociationsChange(
      pendingAssociations.map((a) =>
        a.tempId === tempId ? { ...a, pendingStatus: newStatus } : a
      )
    );
  }

  function handleRemoveAssociation(tempId: string) {
    onAssociationsChange(pendingAssociations.filter((a) => a.tempId !== tempId));
  }

  if (!document) return null;

  const activeConditions = loanConditions.filter((c) => c.status !== 'Cleared');
  const excludedConditionIds = pendingAssociations.map((a) => a.conditionId).filter(Boolean);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 px-4 py-3">
        <FileText className="w-4 h-4 text-gray-500" />
        <span className="text-base font-bold text-gray-900 truncate">
          {document.document_type || 'Miscellaneous'}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        <ExpansionPanel title="Document Properties" defaultExpanded={true}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Document Name <span className="text-red-500">*</span>
              </label>
              <InputText
                value={formState.document_name}
                onChange={(e) => onFieldChange('document_name', e.target.value)}
                placeholder="Enter document name"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Document Type <span className="text-red-500">*</span>
              </label>
              <SearchableDropdown
                value={formState.document_type}
                onChange={(value) => onFieldChange('document_type', value)}
                options={DOCUMENT_TYPE_OPTIONS.map((opt) => ({ value: opt, label: opt }))}
                placeholder="Select document type"
              />
            </div>

            <div>
              <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
                Document Description
                <Info className="w-3 h-3 text-gray-400" />
              </label>
              <TextArea
                value={formState.description}
                onChange={(e) => onFieldChange('description', e.target.value)}
                placeholder="Enter description"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Document Expiration Date
              </label>
              <Datepicker
                value={formState.expiration_date ? new Date(formState.expiration_date) : null}
                onChange={(date) => onFieldChange('expiration_date', date ? date.toISOString().split('T')[0] : '')}
              />
            </div>
          </div>
        </ExpansionPanel>

        <div className="mb-4">
        <ExpansionPanel title="Details" defaultExpanded={false} variant="text" noBorder>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Document for
              </label>
              <SearchableDropdown
                value={formState.document_for_party_id}
                onChange={(value) => onFieldChange('document_for_party_id', value)}
                options={borrowerParties.map((party) => ({
                  value: party.id,
                  label: `${party.party_type}: ${party.party_name}`,
                }))}
                placeholder="Select"
              />
            </div>

            <div className="text-xs text-gray-700">
              <span className="font-medium">Created by:</span> {document.created_by || ''}
            </div>
            <div className="text-xs text-gray-700">
              <span className="font-medium">Created on:</span> {formatDateTime(document.created_on)}
            </div>
            <div className="text-xs text-gray-700">
              <span className="font-medium">Modified by:</span> {document.modified_by || ''}
            </div>
            <div className="text-xs text-gray-700">
              <span className="font-medium">Modified on:</span> {formatDateTime(document.modified_on)}
            </div>
          </div>
        </ExpansionPanel>
        </div>

        <ExpansionPanel
          title="Document Notes"
          defaultExpanded={true}
          rightContent={<Badge variant="light" size="xs">{notes.length}</Badge>}
        >
          {!isEditorExpanded ? (
            <button
              onClick={() => setIsEditorExpanded(true)}
              className="w-full h-9 px-4 text-left text-xs text-gray-400 bg-white border border-gray-300 rounded-lg hover:border-cmg-teal focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-cmg-teal transition-colors"
            >
              Type notes about the document...
            </button>
          ) : (
            <div className="mb-3">
              <NoteEditor
                value={content}
                onChange={setContent}
                placeholder="Type notes about the document..."
                onSubmit={handleAddNote}
                autoFocus
              />
              <div className="flex justify-end gap-2 mt-3">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    setContent('');
                    setIsEditorExpanded(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleAddNote}
                  disabled={!content.trim() || content === '<p></p>' || isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Add Note'}
                </Button>
              </div>
            </div>
          )}

          {notes.length > 0 && (
            <div className="mt-5">
              {(showAllNotes ? notes : [notes[0]]).map((note) => (
                <ConditionNoteItem key={note.id} note={note} />
              ))}

              {notes.length > 1 && (
                <button
                  onClick={() => setShowAllNotes(!showAllNotes)}
                  className="text-xs font-medium text-cmg-teal hover:text-cmg-teal-dark transition-colors"
                >
                  {showAllNotes ? 'Show Less' : `See All Notes (${notes.length})`}
                </button>
              )}
            </div>
          )}
        </ExpansionPanel>

        <ExpansionPanel
          title="Associated Conditions"
          defaultExpanded={true}
          rightContent={<Badge variant="light" size="xs">{pendingAssociations.filter((a) => a.conditionId).length}</Badge>}
        >
          <div className="space-y-4">
            {pendingAssociations.map((assoc) => (
              <AssociatedConditionRow
                key={assoc.tempId}
                conditionId={assoc.conditionId}
                status={assoc.pendingStatus}
                conditions={activeConditions}
                excludedConditionIds={excludedConditionIds}
                onConditionChange={(newId) => handleConditionChange(assoc.tempId, newId)}
                onStatusChange={(newStatus) => handleStatusChange(assoc.tempId, newStatus)}
                onRemove={() => handleRemoveAssociation(assoc.tempId)}
              />
            ))}

            <TextButton icon={<PlusCircle />} size="xs" onClick={handleAddAssociation}>
              Associate This Document to a Condition
            </TextButton>
          </div>
        </ExpansionPanel>
      </div>
    </div>
  );
}
