import { useState } from 'react';
import { useLoanContext } from '../contexts/LoanContext';
import { useRoleContext } from '../contexts/RoleContext';
import { useConditions } from '../hooks/useConditions';
import { useConditionFlags } from '../hooks/useConditionFlags';
import { useNotes } from '../hooks/useNotes';
import { useLoanParties } from '../hooks/useLoanParties';
import { supabase } from '../lib/supabase';
import { getAuthorNameForRole } from '../types/roles';
import { ConditionsHeader } from './ConditionsHeader';
import { ColumnHeaders } from './ColumnHeaders';
import { SectionHeader } from './SectionHeader';
import { ConditionRow } from './ConditionRow';
import { AddConditionsModal } from './AddConditionsModal';
import { EditConditionModal } from './EditConditionModal';
import { SelectDocRequestsModal } from './SelectDocRequestsModal';
import { ReviewDocsModal } from './ReviewDocsModal';
import { UploadDocumentsModal } from './UploadDocumentsModal';
import { BulkActionsBar } from './BulkActionsBar';
import { ConfirmationDialog } from './ConfirmationDialog';
import { NotesModal } from './NotesModal';
import type { Stage, ConditionStatus, FlagColor, DocRequest } from '../types/conditions';
import type { NotesModalEntryPoint } from '../types/notes';

interface UploadModalState {
  conditionId: string | null;
  initialFiles?: File[];
}

export function ConditionsPortal() {
  const { selectedLoanId, loading: loanLoading } = useLoanContext();
  const { selectedRole } = useRoleContext();

  const {
    groupedByStage,
    loading,
    counts,
    viewFilter,
    setViewFilter,
    pageFilter,
    setPageFilter,
    searchQuery,
    setSearchQuery,
    collapsedSections,
    toggleSection,
    collapseAll,
    expandAll,
    updateConditionStatus,
    addNote,
    bulkUpdateStage,
    bulkUpdateStatus,
    bulkDeleteConditions,
    updateConditionDetails,
    refetch,
  } = useConditions(selectedLoanId || '', selectedRole);

  const { setFlag, bulkSetFlags, getFlag } = useConditionFlags(selectedLoanId || '', selectedRole);

  const { unreadCount: unreadNotesCount, refetch: refetchNotes } = useNotes({ loanId: selectedLoanId });

  const { parties } = useLoanParties(selectedLoanId || '');

  const [selectedConditions, setSelectedConditions] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [editConditionId, setEditConditionId] = useState<string | null>(null);
  const [showSelectDocRequestsModal, setShowSelectDocRequestsModal] = useState(false);
  const [selectDocRequestsMode, setSelectDocRequestsMode] = useState<'request' | 'reminder'>('request');
  const [showSuspendConfirm, setShowSuspendConfirm] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [showReviewDocsModal, setShowReviewDocsModal] = useState(false);
  const [uploadModalState, setUploadModalState] = useState<UploadModalState | null>(null);
  const [reviewDocsFilterConditionId, setReviewDocsFilterConditionId] = useState<string | null>(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notesModalEntryPoint, setNotesModalEntryPoint] = useState<NotesModalEntryPoint>('bell');
  const [notesModalConditionId, setNotesModalConditionId] = useState<string | null>(null);

  const allStages: Stage[] = [
    'Suspend',
    'Prior to Docs',
    'Prior to Funding',
    'Prior to Purchase',
    'Post Funding',
    'Trailing Docs',
  ];
  const allCollapsed = allStages.every((stage) => collapsedSections.has(stage));

  function handleSelectCondition(conditionId: string) {
    setSelectedConditions((prev) => {
      const next = new Set(prev);
      if (next.has(conditionId)) {
        next.delete(conditionId);
      } else {
        next.add(conditionId);
      }
      return next;
    });
  }

  function handleSelectSection(_stage: Stage, conditionIds: string[]) {
    const allSelected = conditionIds.every((id) => selectedConditions.has(id));

    setSelectedConditions((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        conditionIds.forEach((id) => next.delete(id));
      } else {
        conditionIds.forEach((id) => next.add(id));
      }
      return next;
    });
  }

  function handleStatusChange(conditionId: string, status: ConditionStatus) {
    updateConditionStatus(conditionId, status);
  }

  function handleAddNote(conditionId: string, content: string) {
    addNote(conditionId, content);
  }

  function handleDeselectAll() {
    setSelectedConditions(new Set());
  }

  async function handleBulkSetFlag(color: FlagColor | null) {
    const ids = Array.from(selectedConditions);
    const success = await bulkSetFlags(ids, color);
    if (success) {
      setSelectedConditions(new Set());
    }
  }

  async function handleBulkSetStatus(status: ConditionStatus) {
    const ids = Array.from(selectedConditions);
    const success = await bulkUpdateStatus(ids, status);
    if (success) {
      setSelectedConditions(new Set());
    }
  }

  async function handleSuspendConfirm() {
    const ids = Array.from(selectedConditions);
    const success = await bulkUpdateStage(ids, 'Suspend');
    if (success) {
      setSelectedConditions(new Set());
    }
    setShowSuspendConfirm(false);
  }

  async function handleRemoveConfirm() {
    const ids = Array.from(selectedConditions);
    const success = await bulkDeleteConditions(ids);
    if (success) {
      setSelectedConditions(new Set());
    }
    setShowRemoveConfirm(false);
  }

  function handleOpenUploadModal(conditionId: string | null, files?: File[]) {
    setUploadModalState({ conditionId, initialFiles: files });
  }

  function handleCloseUploadModal() {
    setUploadModalState(null);
    refetch();
  }

  function handleBulkUpload(files: File[]) {
    setUploadModalState({ conditionId: null, initialFiles: files });
  }

  function handleReviewDocsFromUpload(conditionId: string | null) {
    setReviewDocsFilterConditionId(conditionId === null ? '__unassigned__' : conditionId);
    setShowReviewDocsModal(true);
    setUploadModalState(null);
  }

  function handleOpenReviewDocs() {
    setReviewDocsFilterConditionId(null);
    setShowReviewDocsModal(true);
  }

  function handleOpenReviewDocsForCondition(conditionId: string) {
    setReviewDocsFilterConditionId(conditionId);
    setShowReviewDocsModal(true);
  }

  function handleCloseReviewDocs() {
    setShowReviewDocsModal(false);
    setReviewDocsFilterConditionId(null);
  }

  function handleOpenNotesModal(entryPoint: NotesModalEntryPoint, conditionId?: string) {
    setNotesModalEntryPoint(entryPoint);
    setNotesModalConditionId(conditionId || null);
    setShowNotesModal(true);
  }

  function handleCloseNotesModal() {
    setShowNotesModal(false);
    setNotesModalConditionId(null);
    refetchNotes();
    refetch();
  }

  async function handleAddDocRequest(
    conditionId: string,
    data: { document_type: string; fulfillment_party: string; description_for_borrower: string }
  ): Promise<boolean> {
    const { error } = await supabase.from('doc_requests').insert({
      condition_id: conditionId,
      document_type: data.document_type,
      fulfillment_party: data.fulfillment_party,
      description_for_borrower: data.description_for_borrower,
      status: 'New',
    });

    if (error) {
      console.error('Error adding doc request:', error);
      return false;
    }

    refetch();
    return true;
  }

  async function handleUpdateDocRequest(
    docRequestId: string,
    data: Partial<DocRequest>
  ): Promise<boolean> {
    const { error } = await supabase
      .from('doc_requests')
      .update(data)
      .eq('id', docRequestId);

    if (error) {
      console.error('Error updating doc request:', error);
      return false;
    }

    refetch();
    return true;
  }

  async function handleDeleteDocRequest(docRequestId: string): Promise<boolean> {
    const { error } = await supabase
      .from('doc_requests')
      .delete()
      .eq('id', docRequestId);

    if (error) {
      console.error('Error deleting doc request:', error);
      return false;
    }

    refetch();
    return true;
  }

  if (loanLoading || loading || !selectedLoanId) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Loading conditions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <ConditionsHeader
        viewFilter={viewFilter}
        setViewFilter={setViewFilter}
        pageFilter={pageFilter}
        setPageFilter={setPageFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        counts={counts}
        onAddConditions={() => setShowAddModal(true)}
        onSendBrwRequests={() => {
          setSelectDocRequestsMode('request');
          setShowSelectDocRequestsModal(true);
        }}
        onSendBrwReminder={() => {
          setSelectDocRequestsMode('reminder');
          setShowSelectDocRequestsModal(true);
        }}
        onReviewDocs={handleOpenReviewDocs}
        onBulkUpload={handleBulkUpload}
        onOpenNotesModal={() => handleOpenNotesModal('bell')}
        unreadNotesCount={unreadNotesCount}
      />

      {selectedConditions.size > 0 && (
        <BulkActionsBar
          selectedCount={selectedConditions.size}
          onDeselectAll={handleDeselectAll}
          onSetFlag={handleBulkSetFlag}
          onSetStatus={handleBulkSetStatus}
          onSuspend={() => setShowSuspendConfirm(true)}
          onRemove={() => setShowRemoveConfirm(true)}
        />
      )}

      <ColumnHeaders
        onCollapseAll={collapseAll}
        onExpandAll={expandAll}
        allCollapsed={allCollapsed}
      />

      <div className="divide-y divide-gray-200">
        {groupedByStage.length === 0 ? (
          <div className="bg-white px-4 py-8 text-center text-gray-500">
            No conditions match the current filters.
          </div>
        ) : (
          groupedByStage.map(({ stage, conditions }) => {
            const conditionIds = conditions.map((c) => c.id);
            const allInSectionSelected = conditionIds.every((id) =>
              selectedConditions.has(id)
            );
            const isCollapsed = collapsedSections.has(stage);

            return (
              <div key={stage}>
                <SectionHeader
                  stage={stage}
                  count={conditions.length}
                  isCollapsed={isCollapsed}
                  onToggle={() => toggleSection(stage)}
                  isSelected={allInSectionSelected && conditions.length > 0}
                  onSelectAll={() => handleSelectSection(stage, conditionIds)}
                />

                {!isCollapsed && (
                  <div>
                    {conditions.map((condition) => (
                      <ConditionRow
                        key={condition.id}
                        condition={condition}
                        isSelected={selectedConditions.has(condition.id)}
                        flagColor={getFlag(condition.id)}
                        loanId={selectedLoanId}
                        parties={parties}
                        userRole={selectedRole}
                        onSelect={() => handleSelectCondition(condition.id)}
                        onStatusChange={(status) =>
                          handleStatusChange(condition.id, status)
                        }
                        onAddNote={(content) =>
                          handleAddNote(condition.id, content)
                        }
                        onEdit={() => setEditConditionId(condition.id)}
                        onFlagChange={(color) => setFlag(condition.id, color)}
                        onOpenUploadModal={handleOpenUploadModal}
                        onOpenNotesModal={(conditionId) => handleOpenNotesModal('condition', conditionId)}
                        onOpenReviewDocs={handleOpenReviewDocsForCondition}
                        onUpdateDetails={updateConditionDetails}
                        onAddDocRequest={(data) => handleAddDocRequest(condition.id, data)}
                        onUpdateDocRequest={handleUpdateDocRequest}
                        onDeleteDocRequest={handleDeleteDocRequest}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {showAddModal && (
        <AddConditionsModal
          loanId={selectedLoanId}
          onClose={() => setShowAddModal(false)}
          onAdd={refetch}
        />
      )}

      {editConditionId && (
        <EditConditionModal
          conditionId={editConditionId}
          loanId={selectedLoanId}
          flagColor={getFlag(editConditionId)}
          onClose={() => setEditConditionId(null)}
          onUpdate={refetch}
          onFlagChange={(color) => setFlag(editConditionId, color)}
        />
      )}

      {showSelectDocRequestsModal && (
        <SelectDocRequestsModal
          loanId={selectedLoanId}
          mode={selectDocRequestsMode}
          onClose={() => setShowSelectDocRequestsModal(false)}
          onSave={refetch}
        />
      )}

      {showSuspendConfirm && (
        <ConfirmationDialog
          title="Suspend Conditions"
          message={`Are you sure you want to suspend ${selectedConditions.size} condition${selectedConditions.size === 1 ? '' : 's'}? They will be moved to the Suspend stage.`}
          confirmLabel="Suspend"
          cancelLabel="Cancel"
          confirmVariant="danger"
          onConfirm={handleSuspendConfirm}
          onCancel={() => setShowSuspendConfirm(false)}
        />
      )}

      {showRemoveConfirm && (
        <ConfirmationDialog
          title="Remove Conditions"
          message={`Are you sure you want to permanently delete ${selectedConditions.size} condition${selectedConditions.size === 1 ? '' : 's'}? This action cannot be undone.`}
          confirmLabel="Remove"
          cancelLabel="Cancel"
          confirmVariant="danger"
          onConfirm={handleRemoveConfirm}
          onCancel={() => setShowRemoveConfirm(false)}
        />
      )}

      {showReviewDocsModal && (
        <ReviewDocsModal
          loanId={selectedLoanId}
          filterConditionId={reviewDocsFilterConditionId}
          onClose={handleCloseReviewDocs}
          onUpdate={refetch}
        />
      )}

      {uploadModalState && (
        <UploadDocumentsModal
          conditionId={uploadModalState.conditionId}
          loanId={selectedLoanId}
          initialFiles={uploadModalState.initialFiles}
          onClose={handleCloseUploadModal}
          onUploadComplete={refetch}
          onReviewDocs={handleReviewDocsFromUpload}
          createdBy={getAuthorNameForRole(selectedRole)}
        />
      )}

      <NotesModal
        isOpen={showNotesModal}
        onClose={handleCloseNotesModal}
        entryPoint={notesModalEntryPoint}
        conditionId={notesModalConditionId}
      />
    </div>
  );
}
