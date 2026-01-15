import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { X } from 'lucide-react';
import { useReviewDocsWizard, getDocumentReviewState, type DocumentForReview } from '../../hooks/useReviewDocsWizard';
import { useDocumentDetail } from '../../hooks/useDocumentDetail';
import { useSplitDocumentEditor } from '../../hooks/useSplitDocumentEditor';
import { useRoleContext } from '../../contexts/RoleContext';
import { getAuthorNameForRole } from '../../types/roles';
import { DocumentExplorer } from './DocumentExplorer';
import { DocumentPropertiesPanel } from './DocumentPropertiesPanel';
import { DocumentViewer } from './DocumentViewer';
import { SplitDocEditor } from './SplitDocEditor';
import { ReviewDocsActionBar } from './ReviewDocsActionBar';
import { ReRequestDocumentModal } from './ReRequestDocumentModal';
import { ConfirmationDialog } from '../ConfirmationDialog';
import type { PendingDocumentAssociation, ConditionWithRelations, DocumentConditionAssociation, DocRequest } from '../../types/conditions';
import { supabase } from '../../lib/supabase';
import { autoCompleteDocRequests } from '../../services/docRequestAutoComplete';
import { updateConditionExpirationFromDocument } from '../../services/conditionExpirationService';

type ExpandedCardId = string | 'unassigned' | null;

interface ReviewDocsModalProps {
  loanId: string;
  filterConditionId?: string | null;
  onClose: () => void;
  onUpdate: () => void;
}

export function ReviewDocsModal({ loanId, filterConditionId, onClose, onUpdate }: ReviewDocsModalProps) {
  const { selectedRole } = useRoleContext();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReRequestModal, setShowReRequestModal] = useState(false);
  const [existingDocRequest, setExistingDocRequest] = useState<DocRequest | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [loanConditions, setLoanConditions] = useState<ConditionWithRelations[]>([]);
  const [pendingAssociations, setPendingAssociations] = useState<PendingDocumentAssociation[]>([]);
  const [expandedCardId, setExpandedCardId] = useState<ExpandedCardId>(null);
  const [initialCardExpanded, setInitialCardExpanded] = useState(false);
  const [isSplitMode, setIsSplitMode] = useState(false);
  const [splitSourceDocument, setSplitSourceDocument] = useState<DocumentForReview | null>(null);

  const wizard = useReviewDocsWizard({
    loanId,
    userRole: selectedRole,
    filterConditionId: filterConditionId || undefined,
  });

  const documentDetail = useDocumentDetail({
    documentId: wizard.selectedDocumentId,
  });

  const splitEditor = useSplitDocumentEditor();

  const [formState, setFormState] = useState({
    document_name: '',
    document_type: '',
    description: '',
    expiration_date: '',
    document_for_party_id: '',
  });

  const hasSelectedDocument = wizard.selectedDocument !== null;
  const selectedDocReviewState = wizard.selectedDocument
    ? getDocumentReviewState(wizard.selectedDocument, selectedRole)
    : 'pending';

  const findFirstPendingDocInCard = useCallback((cardId: ExpandedCardId): DocumentForReview | null => {
    if (!cardId) return null;

    if (cardId === 'unassigned') {
      const unassignedDocs = Object.values(wizard.unassignedByType).flat();
      return unassignedDocs.find(
        (doc) => getDocumentReviewState(doc, selectedRole) === 'pending'
      ) || null;
    }

    const group = wizard.conditionGroups.find((g) => g.condition.id === cardId);
    if (!group) return null;

    return group.documents.find(
      (doc) => getDocumentReviewState(doc, selectedRole) === 'pending'
    ) || null;
  }, [wizard.unassignedByType, wizard.conditionGroups, selectedRole]);

  const currentCardAllDocsReviewed = useMemo(() => {
    if (!expandedCardId) return false;

    if (expandedCardId === 'unassigned') {
      const unassignedDocs = Object.values(wizard.unassignedByType).flat();
      return unassignedDocs.length > 0 && unassignedDocs.every(
        (doc) => getDocumentReviewState(doc, selectedRole) !== 'pending'
      );
    }

    const group = wizard.conditionGroups.find((g) => g.condition.id === expandedCardId);
    if (group) {
      if (group.documents.length === 0) return false;
      return group.documents.every(
        (doc) => getDocumentReviewState(doc, selectedRole) !== 'pending'
      );
    }

    const docsForCondition = wizard.allDocuments.filter(
      (doc) => doc.associatedConditionIds.includes(expandedCardId)
    );
    if (docsForCondition.length === 0) return false;

    return docsForCondition.every(
      (doc) => getDocumentReviewState(doc, selectedRole) !== 'pending'
    );
  }, [expandedCardId, wizard.unassignedByType, wizard.conditionGroups, wizard.allDocuments, selectedRole]);

  const showAllDocsReviewedMode = currentCardAllDocsReviewed && !hasSelectedDocument;

  const handleExpandCard = useCallback((cardId: ExpandedCardId) => {
    if (expandedCardId === cardId) {
      setExpandedCardId(null);
      wizard.selectDocument('');
    } else {
      setExpandedCardId(cardId);
      const firstPending = findFirstPendingDocInCard(cardId);
      if (firstPending) {
        wizard.selectDocument(firstPending.id);
      } else {
        wizard.selectDocument('');
      }
    }
  }, [expandedCardId, findFirstPendingDocInCard, wizard]);

  useEffect(() => {
    if (!wizard.loading && !initialCardExpanded) {
      const hasUnassigned = Object.keys(wizard.unassignedByType).length > 0;
      const hasConditions = wizard.conditionGroups.length > 0;

      if (hasUnassigned || hasConditions) {
        const firstCardId: ExpandedCardId = hasUnassigned ? 'unassigned' : wizard.conditionGroups[0]?.condition.id || null;
        if (firstCardId) {
          setExpandedCardId(firstCardId);
          const firstPending = findFirstPendingDocInCard(firstCardId);
          if (firstPending) {
            wizard.selectDocument(firstPending.id);
          }
          setInitialCardExpanded(true);
        }
      }
    }
  }, [wizard.loading, wizard.unassignedByType, wizard.conditionGroups, initialCardExpanded, findFirstPendingDocInCard, wizard]);

  const fetchConditions = useCallback(async () => {
    const { data: conditionsData } = await supabase
      .from('conditions')
      .select('*')
      .eq('loan_id', loanId);

    const { data: docRequests } = await supabase
      .from('doc_requests')
      .select('*');

    const { data: notes } = await supabase
      .from('condition_notes')
      .select('*')
      .eq('loan_id', loanId)
      .order('created_at', { ascending: false });

    const noteIds = (notes || []).map((n) => n.id);
    let readStatusSet = new Set<string>();

    if (noteIds.length > 0) {
      const { data: readStatusData } = await supabase
        .from('note_read_status')
        .select('note_id')
        .eq('role', selectedRole)
        .in('note_id', noteIds);

      if (readStatusData) {
        readStatusSet = new Set(readStatusData.map((r: { note_id: string }) => r.note_id));
      }
    }

    const notesWithReadStatus = (notes || []).map((note) => ({
      ...note,
      is_read: readStatusSet.has(note.id),
    }));

    const { data: documents } = await supabase
      .from('condition_documents')
      .select('*')
      .eq('loan_id', loanId);

    const { data: associations } = await supabase
      .from('document_condition_associations')
      .select('*');

    const conditionsWithRelations: ConditionWithRelations[] = (conditionsData || []).map(
      (condition) => {
        const conditionDocIds = (associations || [])
          .filter((a: DocumentConditionAssociation) => a.condition_id === condition.id)
          .map((a: DocumentConditionAssociation) => a.document_id);
        return {
          ...condition,
          doc_requests: (docRequests || []).filter((dr) => dr.condition_id === condition.id),
          notes: notesWithReadStatus.filter((n) => n.condition_id === condition.id),
          documents: (documents || []).filter((d) => conditionDocIds.includes(d.id)),
        };
      }
    );

    setLoanConditions(conditionsWithRelations);
  }, [loanId, selectedRole]);

  const refreshAllData = useCallback(async () => {
    await Promise.all([wizard.refetch(), fetchConditions()]);
  }, [wizard.refetch, fetchConditions]);

  useEffect(() => {
    if (loanId) {
      fetchConditions();
    }
  }, [loanId, fetchConditions]);

  useEffect(() => {
    if (documentDetail.associations) {
      const initialAssociations: PendingDocumentAssociation[] = documentDetail.associations.map((a) => {
        const condition = loanConditions.find((c) => c.id === a.condition_id);
        return {
          tempId: a.id,
          conditionId: a.condition_id,
          pendingStatus: condition?.status ?? null,
          isNew: false,
        };
      });
      setPendingAssociations(initialAssociations);
    } else {
      setPendingAssociations([]);
    }
  }, [documentDetail.associations, loanConditions]);

  useEffect(() => {
    setCurrentPage(1);
    if (wizard.selectedDocument?.page_count) {
      setPageCount(wizard.selectedDocument.page_count);
    } else {
      setPageCount(1);
    }
  }, [wizard.selectedDocumentId, wizard.selectedDocument?.page_count]);

  const handlePageCountUpdate = useCallback((count: number) => {
    setPageCount(count);
  }, []);

  function handleFieldChange(field: string, value: string) {
    setFormState((prev) => ({ ...prev, [field]: value }));
  }

  async function saveAllChanges() {
    if (!wizard.selectedDocumentId) return false;

    await documentDetail.updateDocument({
      document_name: formState.document_name || undefined,
      document_type: formState.document_type || null,
      description: formState.description || null,
      expiration_date: formState.expiration_date || null,
      document_for_party_id: formState.document_for_party_id || null,
      modified_by: getAuthorNameForRole(selectedRole),
      modified_on: new Date().toISOString(),
    });

    const validAssociations = pendingAssociations
      .filter((a) => a.conditionId)
      .map((a) => ({
        conditionId: a.conditionId,
        pendingStatus: a.pendingStatus,
      }));

    await documentDetail.saveAssociations(validAssociations);

    if (formState.expiration_date && validAssociations.length > 0) {
      const conditionIds = validAssociations.map((a) => a.conditionId);
      await updateConditionExpirationFromDocument(conditionIds, formState.expiration_date);
    }

    return true;
  }

  async function handleSaveChanges() {
    const currentDocId = wizard.selectedDocumentId;
    await saveAllChanges();
    await refreshAllData();
    if (currentDocId) {
      wizard.selectDocument(currentDocId);
    }
  }

  const selectNextPendingInCurrentCard = useCallback(() => {
    if (!expandedCardId) return;

    const firstPending = findFirstPendingDocInCard(expandedCardId);
    if (firstPending) {
      wizard.selectDocument(firstPending.id);
    } else {
      wizard.selectDocument('');
    }
  }, [expandedCardId, findFirstPendingDocInCard, wizard]);

  const selectNextPendingRef = useRef(selectNextPendingInCurrentCard);
  useEffect(() => {
    selectNextPendingRef.current = selectNextPendingInCurrentCard;
  }, [selectNextPendingInCurrentCard]);

  async function handleAcceptDoc() {
    if (!wizard.selectedDocumentId || !wizard.selectedDocument) return;

    const docId = wizard.selectedDocumentId;
    const documentType = wizard.selectedDocument.document_type;
    const associatedConditionIds = wizard.selectedDocument.associatedConditionIds;

    await saveAllChanges();

    const newStatus = selectedRole === 'Underwriter' ? 'Approved' : 'Reviewed';
    const success = await wizard.updateDocumentStatus(docId, newStatus);

    if (success) {
      if (newStatus === 'Reviewed' && documentType && associatedConditionIds.length > 0) {
        await autoCompleteDocRequests(documentType, associatedConditionIds);
      }
      wizard.markDocumentAccepted(docId);
      await refreshAllData();
      selectNextPendingRef.current();
    }
  }

  async function handleRejectWithoutReRequest() {
    if (!wizard.selectedDocumentId || !wizard.selectedDocument) return;

    const docId = wizard.selectedDocumentId;
    const doc = wizard.selectedDocument;
    const originalConditionIds = [...doc.associatedConditionIds];

    await saveAllChanges();

    const conditionTitles: string[] = [];
    for (const condId of originalConditionIds) {
      const condition = wizard.conditions.find((c) => c.id === condId);
      if (condition) {
        conditionTitles.push(condition.condition_id);
      }
    }

    if (originalConditionIds.length > 0) {
      await supabase
        .from('document_condition_associations')
        .delete()
        .eq('document_id', docId);

      const noteContent = conditionTitles.length > 0
        ? `Document detached from condition${conditionTitles.length > 1 ? 's' : ''}: ${conditionTitles.join(', ')}`
        : 'Document detached from condition(s)';

      await supabase.from('document_notes').insert({
        document_id: docId,
        author_name: getAuthorNameForRole(selectedRole),
        author_role: selectedRole,
        content: noteContent,
      });
    }

    const success = await wizard.updateDocumentStatus(docId, 'Inactive');

    if (success) {
      wizard.markDocumentRejected(docId, originalConditionIds);
      await refreshAllData();
      selectNextPendingRef.current();
    }
  }

  async function handleRejectWithReRequest() {
    if (!wizard.selectedDocument || !expandedCardId || expandedCardId === 'unassigned') return;

    const documentType = wizard.selectedDocument.document_type;
    const conditionId = expandedCardId;

    const condition = wizard.conditions.find((c) => c.id === conditionId);
    if (!condition) return;

    const matchingDocRequest = condition.doc_requests?.find(
      (dr) => dr.document_type?.toLowerCase() === documentType?.toLowerCase()
    ) || null;

    setExistingDocRequest(matchingDocRequest);
    setShowReRequestModal(true);
  }

  async function handleReRequestSave(data: {
    isNew: boolean;
    docRequestId?: string;
    document_type: string;
    fulfillment_party: string;
    description_for_borrower: string;
  }) {
    if (!wizard.selectedDocumentId || !wizard.selectedDocument || !expandedCardId || expandedCardId === 'unassigned') {
      return false;
    }

    const docId = wizard.selectedDocumentId;
    const doc = wizard.selectedDocument;
    const originalConditionIds = [...doc.associatedConditionIds];
    const conditionId = expandedCardId;

    if (data.isNew) {
      const { error: insertError } = await supabase.from('doc_requests').insert({
        condition_id: conditionId,
        document_type: data.document_type,
        fulfillment_party: data.fulfillment_party,
        description_for_borrower: data.description_for_borrower,
        status: 'New',
      });
      if (insertError) return false;
    } else if (data.docRequestId) {
      const { error: updateError } = await supabase
        .from('doc_requests')
        .update({
          status: 'New',
          description_for_borrower: data.description_for_borrower,
        })
        .eq('id', data.docRequestId);
      if (updateError) return false;
    }

    const conditionTitles: string[] = [];
    for (const condId of originalConditionIds) {
      const condition = wizard.conditions.find((c) => c.id === condId);
      if (condition) {
        conditionTitles.push(condition.condition_id);
      }
    }

    if (originalConditionIds.length > 0) {
      await supabase
        .from('document_condition_associations')
        .delete()
        .eq('document_id', docId);

      const noteContent = conditionTitles.length > 0
        ? `Document rejected and re-requested. Detached from condition${conditionTitles.length > 1 ? 's' : ''}: ${conditionTitles.join(', ')}`
        : 'Document rejected and re-requested';

      await supabase.from('document_notes').insert({
        document_id: docId,
        author_name: getAuthorNameForRole(selectedRole),
        author_role: selectedRole,
        content: noteContent,
      });
    }

    const success = await wizard.updateDocumentStatus(docId, 'Inactive');

    if (success) {
      wizard.markDocumentRejected(docId, originalConditionIds);
      await refreshAllData();
      selectNextPendingRef.current();
    }

    return true;
  }

  async function handleDeleteDocument() {
    if (!wizard.selectedDocumentId) return;

    const docId = wizard.selectedDocumentId;

    const success = await documentDetail.deleteDocument();
    if (success) {
      wizard.markDocumentRejected(docId);
      await refreshAllData();
      selectNextPendingRef.current();
      setShowDeleteConfirm(false);
    }
  }

  const handleClose = useCallback(() => {
    onUpdate();
    onClose();
  }, [onUpdate, onClose]);

  const handleConditionStatusUpdate = useCallback(async (conditionId: string, status: import('../../types/conditions').ConditionStatus, stage?: import('../../types/conditions').Stage) => {
    const success = await wizard.updateConditionStatus(conditionId, status, stage);
    if (success) {
      const isSingleConditionMode = filterConditionId && filterConditionId !== '__unassigned__';
      if (isSingleConditionMode) {
        handleClose();
        return success;
      }

      const currentIndex = wizard.conditionGroups.findIndex((g) => g.condition.id === conditionId);
      let nextCardId: ExpandedCardId = null;

      for (let i = currentIndex + 1; i < wizard.conditionGroups.length; i++) {
        const group = wizard.conditionGroups[i];
        if (group.docsToReviewCount > 0) {
          nextCardId = group.condition.id;
          break;
        }
      }

      if (!nextCardId) {
        const hasUnassigned = Object.keys(wizard.unassignedByType).length > 0;
        if (hasUnassigned) {
          const unassignedDocs = Object.values(wizard.unassignedByType).flat();
          const hasPending = unassignedDocs.some(
            (doc) => getDocumentReviewState(doc, selectedRole) === 'pending'
          );
          if (hasPending) {
            nextCardId = 'unassigned';
          }
        }
      }

      if (nextCardId) {
        setExpandedCardId(nextCardId);
        setTimeout(() => {
          const firstPending = findFirstPendingDocInCard(nextCardId);
          if (firstPending) {
            wizard.selectDocument(firstPending.id);
          }
        }, 50);
      } else {
        setExpandedCardId(null);
        wizard.selectDocument('');
      }
    }
    return success;
  }, [wizard, selectedRole, findFirstPendingDocInCard, filterConditionId, handleClose]);

  const handleEnterSplitMode = useCallback(() => {
    if (wizard.selectedDocument && wizard.selectedDocument.file_url) {
      setSplitSourceDocument(wizard.selectedDocument);
      setIsSplitMode(true);
      splitEditor.reset();
    }
  }, [wizard.selectedDocument, splitEditor]);

  const handleCancelSplit = useCallback(() => {
    setIsSplitMode(false);
    setSplitSourceDocument(null);
    splitEditor.reset();
  }, [splitEditor]);

  const handleFinishSplit = useCallback(async () => {
    if (!splitSourceDocument) return;

    const result = await splitEditor.finishSplit(splitSourceDocument);

    if (result.success) {
      setIsSplitMode(false);
      setSplitSourceDocument(null);
      splitEditor.reset();
      wizard.selectDocument('');
      await refreshAllData();
      setExpandedCardId('unassigned');
    }
  }, [splitSourceDocument, splitEditor, wizard, refreshAllData]);

  if (wizard.loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="text-gray-500">Loading documents...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-[95vw] h-[95vh] flex flex-col shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
          <h2 className="text-lg font-bold text-gray-900">Review Documents</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden relative">
          {wizard.refreshing && (
            <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-cmg-teal rounded-full animate-spin" />
                Updating...
              </div>
            </div>
          )}

          <div className="w-[350px] border-r border-gray-200 overflow-y-auto bg-white">
            <DocumentExplorer
              unassignedByType={wizard.unassignedByType}
              conditionGroups={wizard.conditionGroups}
              selectedDocumentId={wizard.selectedDocumentId}
              userRole={selectedRole}
              onSelectDocument={wizard.selectDocument}
              onUpdateConditionStatus={handleConditionStatusUpdate}
              onAddConditionNote={wizard.addConditionNote}
              expandedCardId={expandedCardId}
              onExpandCard={handleExpandCard}
            />
          </div>

          {!showAllDocsReviewedMode && !isSplitMode && (
            <>
              <div className="w-[320px] border-r border-gray-200 overflow-y-auto">
                {hasSelectedDocument && (
                  <DocumentPropertiesPanel
                    document={wizard.selectedDocument}
                    notes={documentDetail.notes}
                    formState={formState}
                    onFieldChange={handleFieldChange}
                    onAddNote={(content) => documentDetail.addNote(content)}
                    loanConditions={loanConditions}
                    pendingAssociations={pendingAssociations}
                    onAssociationsChange={setPendingAssociations}
                    loanParties={wizard.parties}
                  />
                )}
                {!hasSelectedDocument && (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                    Select a document to view properties
                  </div>
                )}
              </div>

              <div className="flex-1 flex flex-col bg-gray-100 overflow-hidden">
                {hasSelectedDocument && (
                  <DocumentViewer
                    document={wizard.selectedDocument}
                    currentPage={currentPage}
                    totalPages={pageCount}
                    onPageChange={setCurrentPage}
                    onPageCountUpdate={handlePageCountUpdate}
                    reviewState={selectedDocReviewState}
                    onSplitClick={handleEnterSplitMode}
                  />
                )}
                {!hasSelectedDocument && (
                  <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                    Select a document to view
                  </div>
                )}
              </div>
            </>
          )}

          {isSplitMode && splitSourceDocument && (
            <div className="flex-1 flex flex-col bg-gray-100 overflow-hidden">
              <SplitDocEditor
                sourceDocument={splitSourceDocument}
                splits={splitEditor.splits}
                assignedPages={splitEditor.assignedPages}
                keepOriginalDocument={splitEditor.keepOriginalDocument}
                processing={splitEditor.processing}
                loanConditions={loanConditions}
                onAddSplit={splitEditor.addSplit}
                onRemoveSplit={splitEditor.removeSplit}
                onUpdateSplit={splitEditor.updateSplit}
                onAssignPageToSplit={splitEditor.assignPageToSplit}
                onRemovePageFromSplit={splitEditor.removePageFromSplit}
                onReorderPagesInSplit={splitEditor.reorderPagesInSplit}
                onSetKeepOriginalDocument={splitEditor.setKeepOriginalDocument}
                onAddConditionToSplit={splitEditor.addConditionToSplit}
                onUpdateConditionInSplit={splitEditor.updateConditionInSplit}
                onRemoveConditionFromSplit={splitEditor.removeConditionFromSplit}
                getPagesDisplay={splitEditor.getPagesDisplay}
                onCancel={handleCancelSplit}
                onFinish={handleFinishSplit}
              />
            </div>
          )}

          {showAllDocsReviewedMode && (
            <div className="flex-1 bg-gray-100" />
          )}
        </div>

        {hasSelectedDocument && !showAllDocsReviewedMode && !isSplitMode && (
          <ReviewDocsActionBar
            onDeleteDocument={() => setShowDeleteConfirm(true)}
            onSaveChanges={handleSaveChanges}
            onRejectWithReRequest={handleRejectWithReRequest}
            onRejectWithoutReRequest={handleRejectWithoutReRequest}
            onAcceptDoc={handleAcceptDoc}
            currentIndex={wizard.currentDocumentIndex + 1}
            totalDocs={wizard.totalDocsToReview}
            saving={documentDetail.saving || wizard.refreshing}
            currentConditionId={expandedCardId}
            isProcessor={selectedRole !== 'Underwriter'}
          />
        )}
      </div>

      {showDeleteConfirm && (
        <ConfirmationDialog
          title="Delete Document"
          message="Are you sure you want to delete this document? This action cannot be undone."
          confirmLabel="Delete"
          cancelLabel="Cancel"
          confirmVariant="danger"
          onConfirm={handleDeleteDocument}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      {showReRequestModal && wizard.selectedDocument && (
        <ReRequestDocumentModal
          documentType={wizard.selectedDocument.document_type}
          existingDocRequest={existingDocRequest}
          parties={wizard.parties}
          onSave={handleReRequestSave}
          onClose={() => {
            setShowReRequestModal(false);
            setExistingDocRequest(null);
          }}
        />
      )}
    </div>
  );
}
