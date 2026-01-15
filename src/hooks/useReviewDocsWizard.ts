import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type {
  ConditionDocument,
  ConditionWithRelations,
  DocumentStatus,
  ConditionStatus,
  DocumentConditionAssociation,
  Stage,
  LoanParty,
} from '../types/conditions';
import { getAuthorNameForRole, type UserRole } from '../types/roles';

export interface DocumentForReview extends ConditionDocument {
  condition?: ConditionWithRelations;
  partyName?: string;
  associatedConditionIds: string[];
}

export interface ConditionGroup {
  condition: ConditionWithRelations;
  documents: DocumentForReview[];
  docsToReviewCount: number;
}

export type DocumentReviewState = 'pending' | 'accepted' | 'rejected';

export function getDocumentReviewState(
  doc: DocumentForReview,
  userRole: UserRole
): DocumentReviewState {
  if (doc.status === 'Inactive') {
    return 'rejected';
  }
  if (userRole === 'Underwriter' && doc.status === 'Approved') {
    return 'accepted';
  }
  if (userRole !== 'Underwriter' && doc.status === 'Reviewed') {
    return 'accepted';
  }
  return 'pending';
}

interface UseReviewDocsWizardProps {
  loanId: string;
  userRole: UserRole;
  filterConditionId?: string;
}

export function useReviewDocsWizard({ loanId, userRole, filterConditionId }: UseReviewDocsWizardProps) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [allDocuments, setAllDocuments] = useState<DocumentForReview[]>([]);
  const [conditions, setConditions] = useState<ConditionWithRelations[]>([]);
  const [parties, setParties] = useState<LoanParty[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [sessionAccepted, setSessionAccepted] = useState<Set<string>>(new Set());
  const [sessionRejected, setSessionRejected] = useState<Set<string>>(new Set());
  const [sessionRejectedWithConditions, setSessionRejectedWithConditions] = useState<Map<string, string[]>>(new Map());
  const [conditionsWithStatusSet, setConditionsWithStatusSet] = useState<Set<string>>(new Set());
  const [sessionConditionsWorkedOn, setSessionConditionsWorkedOn] = useState<Set<string>>(new Set());
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const statusToReview: DocumentStatus = userRole === 'Underwriter' ? 'Reviewed' : 'Need to Review';

  const fetchData = useCallback(async () => {
    if (isInitialLoad) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

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
        .eq('role', userRole)
        .in('note_id', noteIds);

      if (readStatusData) {
        readStatusSet = new Set(readStatusData.map((r: { note_id: string }) => r.note_id));
      }
    }

    const notesWithReadStatus = (notes || []).map((note) => ({
      ...note,
      is_read: readStatusSet.has(note.id),
    }));

    const { data: documentsData } = await supabase
      .from('condition_documents')
      .select('*')
      .eq('loan_id', loanId);

    const { data: parties } = await supabase
      .from('loan_parties')
      .select('*')
      .eq('loan_id', loanId);

    const { data: associations } = await supabase
      .from('document_condition_associations')
      .select('*');

    const docAssociationMap = new Map<string, string[]>();
    (associations || []).forEach((assoc: DocumentConditionAssociation) => {
      const existing = docAssociationMap.get(assoc.document_id) || [];
      existing.push(assoc.condition_id);
      docAssociationMap.set(assoc.document_id, existing);
    });

    const conditionsWithRelations: ConditionWithRelations[] = (conditionsData || []).map(
      (condition) => {
        const conditionDocIds = (associations || [])
          .filter((a: DocumentConditionAssociation) => a.condition_id === condition.id)
          .map((a: DocumentConditionAssociation) => a.document_id);
        return {
          ...condition,
          doc_requests: (docRequests || []).filter((dr) => dr.condition_id === condition.id),
          notes: notesWithReadStatus.filter((n) => n.condition_id === condition.id),
          documents: (documentsData || []).filter((d) => conditionDocIds.includes(d.id)),
        };
      }
    );

    setConditions(conditionsWithRelations);
    setParties(parties || []);

    const allDocs: DocumentForReview[] = (documentsData || [])
      .map((doc) => {
        const associatedConditionIds = docAssociationMap.get(doc.id) || [];
        const primaryConditionId = associatedConditionIds[0];
        const condition = primaryConditionId
          ? conditionsWithRelations.find((c) => c.id === primaryConditionId)
          : undefined;
        const docRequest = condition?.doc_requests.find((dr) => dr.id === doc.doc_request_id);
        const party = docRequest
          ? (parties || []).find((p) => p.party_type === docRequest.fulfillment_party)
          : undefined;

        return {
          ...doc,
          condition,
          partyName: party?.party_name,
          associatedConditionIds,
        };
      });

    setAllDocuments(allDocs);
    setLoading(false);
    setRefreshing(false);
    setIsInitialLoad(false);
  }, [loanId, userRole, isInitialLoad]);

  useEffect(() => {
    if (loanId) {
      fetchData();
    }
  }, [loanId, fetchData]);

  const documentsToReview = useMemo(() => {
    return allDocuments.filter((doc) => doc.status === statusToReview);
  }, [allDocuments, statusToReview]);

  const unassignedDocuments = useMemo(() => {
    return documentsToReview.filter((doc) => doc.associatedConditionIds.length === 0 && doc.loan_id);
  }, [documentsToReview]);

  const getDocsForCondition = useCallback((conditionId: string) => {
    const docsFromAssociations = allDocuments.filter(
      (doc) => doc.associatedConditionIds.includes(conditionId)
    );
    const docIdsFromAssociations = new Set(docsFromAssociations.map((d) => d.id));

    const sessionRejectedDocs: DocumentForReview[] = [];
    sessionRejectedWithConditions.forEach((originalConditionIds, docId) => {
      if (originalConditionIds.includes(conditionId) && !docIdsFromAssociations.has(docId)) {
        const doc = allDocuments.find((d) => d.id === docId);
        if (doc) {
          sessionRejectedDocs.push(doc);
        }
      }
    });

    return [...docsFromAssociations, ...sessionRejectedDocs];
  }, [allDocuments, sessionRejectedWithConditions]);

  const conditionGroups = useMemo(() => {
    const groups: ConditionGroup[] = [];

    if (filterConditionId === '__unassigned__') {
      return groups;
    }

    if (filterConditionId) {
      const condition = conditions.find((c) => c.id === filterConditionId);
      if (condition) {
        const allDocsForCondition = getDocsForCondition(filterConditionId);
        const docsToReviewCount = allDocsForCondition.filter(
          (doc) => getDocumentReviewState(doc, userRole) === 'pending'
        ).length;
        groups.push({
          condition,
          documents: allDocsForCondition,
          docsToReviewCount,
        });
      }
      return groups;
    }

    const conditionIdsWithPendingDocs = new Set<string>();
    documentsToReview.forEach((doc) => {
      doc.associatedConditionIds.forEach((condId) => {
        conditionIdsWithPendingDocs.add(condId);
      });
    });

    const conditionIdsToDisplay = new Set<string>();
    conditionIdsWithPendingDocs.forEach((id) => {
      conditionIdsToDisplay.add(id);
    });
    sessionConditionsWorkedOn.forEach((id) => {
      if (!conditionsWithStatusSet.has(id)) {
        conditionIdsToDisplay.add(id);
      }
    });

    conditionIdsToDisplay.forEach((conditionId) => {
      if (conditionsWithStatusSet.has(conditionId)) return;

      const condition = conditions.find((c) => c.id === conditionId);
      if (!condition) return;

      const allDocsForCondition = getDocsForCondition(conditionId);

      const docsToReviewCount = allDocsForCondition.filter(
        (doc) => getDocumentReviewState(doc, userRole) === 'pending'
      ).length;

      groups.push({
        condition,
        documents: allDocsForCondition,
        docsToReviewCount,
      });
    });

    return groups.sort((a, b) => a.condition.condition_id.localeCompare(b.condition.condition_id));
  }, [documentsToReview, conditions, conditionsWithStatusSet, sessionConditionsWorkedOn, getDocsForCondition, userRole, filterConditionId]);

  const unassignedByType = useMemo(() => {
    if (filterConditionId && filterConditionId !== '__unassigned__') {
      return {};
    }
    const byType: Record<string, DocumentForReview[]> = {};
    unassignedDocuments.forEach((doc) => {
      const docType = doc.document_type || 'Miscellaneous';
      if (!byType[docType]) {
        byType[docType] = [];
      }
      byType[docType].push(doc);
    });
    return byType;
  }, [unassignedDocuments, filterConditionId]);

  const selectedDocument = useMemo(() => {
    return allDocuments.find((doc) => doc.id === selectedDocumentId) || null;
  }, [allDocuments, selectedDocumentId]);

  const currentDocumentIndex = useMemo(() => {
    if (!selectedDocumentId) return -1;
    return documentsToReview.findIndex((doc) => doc.id === selectedDocumentId);
  }, [documentsToReview, selectedDocumentId]);

  const totalDocsToReview = documentsToReview.length;

  const selectNextDocument = useCallback(() => {
    const remainingDocs = documentsToReview.filter(
      (doc) => !sessionAccepted.has(doc.id) && !sessionRejected.has(doc.id)
    );

    if (remainingDocs.length > 0) {
      const currentIndex = remainingDocs.findIndex((doc) => doc.id === selectedDocumentId);
      const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % remainingDocs.length : 0;
      setSelectedDocumentId(remainingDocs[nextIndex].id);
    } else {
      setSelectedDocumentId(null);
    }
  }, [documentsToReview, sessionAccepted, sessionRejected, selectedDocumentId]);

  const selectNextDocumentInCondition = useCallback((conditionId: string, excludeDocId: string) => {
    const docsInCondition = allDocuments.filter(
      (doc) =>
        doc.associatedConditionIds.includes(conditionId) &&
        doc.id !== excludeDocId &&
        getDocumentReviewState(doc, userRole) === 'pending' &&
        !sessionAccepted.has(doc.id) &&
        !sessionRejected.has(doc.id)
    );

    if (docsInCondition.length > 0) {
      setSelectedDocumentId(docsInCondition[0].id);
    } else {
      setSelectedDocumentId(null);
    }
  }, [allDocuments, userRole, sessionAccepted, sessionRejected]);

  const markDocumentAccepted = useCallback((documentId: string) => {
    const doc = allDocuments.find((d) => d.id === documentId);
    if (doc && doc.associatedConditionIds.length > 0) {
      setSessionConditionsWorkedOn((prev) => new Set([...prev, ...doc.associatedConditionIds]));
    }
    setSessionAccepted((prev) => new Set([...prev, documentId]));
  }, [allDocuments]);

  const markDocumentRejected = useCallback((documentId: string, originalConditionIds?: string[]) => {
    const doc = allDocuments.find((d) => d.id === documentId);
    const conditionIds = originalConditionIds || doc?.associatedConditionIds || [];
    if (conditionIds.length > 0) {
      setSessionConditionsWorkedOn((prev) => new Set([...prev, ...conditionIds]));
      setSessionRejectedWithConditions((prev) => {
        const newMap = new Map(prev);
        newMap.set(documentId, conditionIds);
        return newMap;
      });
    }
    setSessionRejected((prev) => new Set([...prev, documentId]));
  }, [allDocuments]);

  const markConditionStatusSet = useCallback((conditionId: string) => {
    setConditionsWithStatusSet((prev) => new Set([...prev, conditionId]));
  }, []);

  const selectDocument = useCallback((documentId: string) => {
    setSelectedDocumentId(documentId);
  }, []);

  async function updateDocumentStatus(documentId: string, newStatus: DocumentStatus) {
    const { error } = await supabase
      .from('condition_documents')
      .update({ status: newStatus })
      .eq('id', documentId);

    if (!error) {
      setAllDocuments((prev) =>
        prev.map((doc) =>
          doc.id === documentId ? { ...doc, status: newStatus } : doc
        )
      );
    }

    return !error;
  }

  const selectNextConditionDocument = useCallback((currentConditionId: string) => {
    const currentConditionIndex = conditionGroups.findIndex(
      (g) => g.condition.id === currentConditionId
    );

    for (let i = currentConditionIndex + 1; i < conditionGroups.length; i++) {
      const group = conditionGroups[i];
      const pendingDoc = group.documents.find(
        (doc) =>
          getDocumentReviewState(doc, userRole) === 'pending' &&
          !sessionAccepted.has(doc.id) &&
          !sessionRejected.has(doc.id)
      );
      if (pendingDoc) {
        setSelectedDocumentId(pendingDoc.id);
        return;
      }
    }

    const unassignedDocs = Object.values(unassignedByType).flat();
    const pendingUnassigned = unassignedDocs.find(
      (doc) =>
        getDocumentReviewState(doc, userRole) === 'pending' &&
        !sessionAccepted.has(doc.id) &&
        !sessionRejected.has(doc.id)
    );
    if (pendingUnassigned) {
      setSelectedDocumentId(pendingUnassigned.id);
      return;
    }

    setSelectedDocumentId(null);
  }, [conditionGroups, userRole, sessionAccepted, sessionRejected, unassignedByType]);

  async function updateConditionStatus(conditionId: string, newStatus: ConditionStatus, newStage?: Stage) {
    const updateData: Record<string, unknown> = {
      status: newStatus,
      status_date: new Date().toISOString(),
      status_set_by: 'User',
    };
    if (newStage) {
      updateData.stage = newStage;
    }

    const { error } = await supabase
      .from('conditions')
      .update(updateData)
      .eq('id', conditionId);

    if (!error) {
      markConditionStatusSet(conditionId);
      selectNextConditionDocument(conditionId);
    }

    return !error;
  }

  async function addConditionNote(conditionId: string, content: string) {
    const { data: newNote, error } = await supabase
      .from('condition_notes')
      .insert({
        condition_id: conditionId,
        loan_id: loanId,
        author_name: getAuthorNameForRole(userRole),
        author_role: userRole,
        content,
        note_type: 'condition',
        is_pinned: false,
      })
      .select('id')
      .maybeSingle();

    if (!error && newNote) {
      await supabase.from('note_read_status').insert({
        note_id: newNote.id,
        role: userRole,
      });
      fetchData();
    }

    return !error;
  }


  return {
    loading,
    refreshing,
    allDocuments,
    documentsToReview,
    unassignedDocuments,
    unassignedByType,
    conditionGroups,
    conditions,
    parties,
    selectedDocument,
    selectedDocumentId,
    currentDocumentIndex,
    totalDocsToReview,
    sessionAccepted,
    sessionRejected,
    userRole,
    selectDocument,
    markDocumentAccepted,
    markDocumentRejected,
    markConditionStatusSet,
    updateDocumentStatus,
    updateConditionStatus,
    addConditionNote,
    refetch: fetchData,
  };
}
