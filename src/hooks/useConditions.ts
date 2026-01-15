import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import type {
  ConditionWithRelations,
  ViewFilter,
  PageFilter,
  Stage,
  DocumentConditionAssociation,
} from '../types/conditions';
import { getAuthorNameForRole, type UserRole } from '../types/roles';
import { sortConditions } from '../utils/conditionSorting';

export function useConditions(loanId: string, userRole: UserRole = 'Processor III') {
  const [conditions, setConditions] = useState<ConditionWithRelations[]>([]);
  const [allLoanDocuments, setAllLoanDocuments] = useState<Array<{ id: string; status: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [viewFilter, setViewFilter] = useState<ViewFilter>('Active');
  const [pageFilter, setPageFilter] = useState<PageFilter>('none');
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedSections, setCollapsedSections] = useState<Set<Stage>>(new Set());

  useEffect(() => {
    if (loanId) {
      fetchConditions();
    }
  }, [loanId]);

  async function fetchConditions() {
    setLoading(true);

    try {
      const { data: conditionsData, error: conditionsError } = await supabase
        .from('conditions')
        .select('*')
        .eq('loan_id', loanId)
        .order('category', { ascending: true });

      if (conditionsError) {
        console.error('Error fetching conditions:', conditionsError);
        setConditions([]);
        setLoading(false);
        return;
      }

      const { data: docRequests } = await supabase
        .from('doc_requests')
        .select('*');

      const { data: notes } = await supabase
        .from('condition_notes')
        .select('*')
        .eq('loan_id', loanId)
        .order('created_at', { ascending: false });

      const safeNotes = notes || [];
      const noteIds = safeNotes.map((n) => n.id);
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

      const { data: documents } = await supabase
        .from('condition_documents')
        .select('*')
        .eq('loan_id', loanId)
        .neq('status', 'Inactive');

      const { data: associations } = await supabase
        .from('document_condition_associations')
        .select('*');

      const safeDocuments = documents || [];
      const safeDocRequests = docRequests || [];
      const safeAssociations = associations || [];
      const safeConditionsData = conditionsData || [];

      setAllLoanDocuments(
        safeDocuments.map((d) => ({
          id: d.id,
          status: d.status,
        }))
      );

      const notesWithReadStatus = safeNotes.map((note) => ({
        ...note,
        is_read: readStatusSet.has(note.id),
      }));

      const conditionsWithRelations: ConditionWithRelations[] = safeConditionsData.map(
        (condition) => {
          const conditionDocIds = safeAssociations
            .filter((a: DocumentConditionAssociation) => a.condition_id === condition.id)
            .map((a: DocumentConditionAssociation) => a.document_id);
          return {
            ...condition,
            doc_requests: safeDocRequests.filter((dr) => dr.condition_id === condition.id),
            notes: notesWithReadStatus.filter((n) => n.condition_id === condition.id),
            documents: safeDocuments.filter((d) => conditionDocIds.includes(d.id)),
          };
        }
      );

      setConditions(conditionsWithRelations);
    } catch (err) {
      console.error('Unexpected error fetching conditions:', err);
      setConditions([]);
    } finally {
      setLoading(false);
    }
  }

  const filteredConditions = useMemo(() => {
    let result = [...conditions];

    if (viewFilter === 'Active') {
      if (userRole === 'Underwriter') {
        result = result.filter((c) => c.status !== 'Cleared');
      } else {
        result = result.filter(
          (c) => c.status !== 'Cleared' && c.status !== 'Ready for UW'
        );
      }
    } else if (viewFilter === 'Cleared') {
      result = result.filter((c) => c.status === 'Cleared');
    } else if (viewFilter === 'Ready for UW') {
      result = result.filter((c) => c.status === 'Ready for UW');
    }

    if (pageFilter === 'need_to_request') {
      result = result.filter(
        (c) =>
          c.status === 'New' ||
          c.status === 'Need Brw Request' ||
          c.status === 'Not Cleared'
      );
    } else if (pageFilter === 'requested') {
      result = result.filter((c) => c.status === 'Requested');
    } else if (pageFilter === 'send_brw_reminder') {
      result = result.filter((c) =>
        c.doc_requests.some((dr) => dr.status === 'Pending')
      );
    } else if (pageFilter === 'review_docs') {
      result = result.filter((c) =>
        c.documents.some((d) =>
          userRole === 'Underwriter'
            ? d.status === 'Reviewed'
            : d.status === 'Need to Review'
        )
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.condition_id.toLowerCase().includes(query) ||
          c.title.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query)
      );
    }

    return sortConditions(result, userRole, viewFilter, pageFilter);
  }, [conditions, viewFilter, pageFilter, searchQuery, userRole]);

  const counts = useMemo(() => {
    let activeConditions: ConditionWithRelations[];
    if (userRole === 'Underwriter') {
      activeConditions = conditions.filter((c) => c.status !== 'Cleared');
    } else {
      activeConditions = conditions.filter(
        (c) => c.status !== 'Cleared' && c.status !== 'Ready for UW'
      );
    }

    const allDocRequests = conditions
      .flatMap((c) => c.doc_requests)
      .filter((dr) => dr.status !== 'Complete');

    const targetStatus = userRole === 'Underwriter' ? 'Reviewed' : 'Need to Review';
    const reviewDocsCount = allLoanDocuments.filter((d) => d.status === targetStatus).length;

    return {
      active: activeConditions.length,
      needToRequest: conditions.filter(
        (c) =>
          c.status === 'New' ||
          c.status === 'Need Brw Request' ||
          c.status === 'Not Cleared'
      ).length,
      requested: conditions.filter((c) => c.status === 'Requested').length,
      newDocRequests: allDocRequests.filter((dr) => dr.status === 'New').length,
      sendBrwReminder: allDocRequests.filter((dr) => dr.status === 'Pending').length,
      reviewDocs: reviewDocsCount,
    };
  }, [conditions, allLoanDocuments, userRole]);

  const groupedByStage = useMemo(() => {
    const stageOrder: Stage[] = [
      'Suspend',
      'Prior to Docs',
      'Prior to Funding',
      'Prior to Purchase',
      'Post Funding',
      'Trailing Docs',
    ];

    const groups: Record<Stage, ConditionWithRelations[]> = {
      'Suspend': [],
      'Prior to Docs': [],
      'Prior to Funding': [],
      'Prior to Purchase': [],
      'Post Funding': [],
      'Trailing Docs': [],
    };

    filteredConditions.forEach((condition) => {
      if (groups[condition.stage]) {
        groups[condition.stage].push(condition);
      }
    });

    return stageOrder
      .filter((stage) => groups[stage].length > 0)
      .map((stage) => ({
        stage,
        conditions: groups[stage],
      }));
  }, [filteredConditions]);

  function toggleSection(stage: Stage) {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(stage)) {
        next.delete(stage);
      } else {
        next.add(stage);
      }
      return next;
    });
  }

  function collapseAll() {
    const allStages: Stage[] = [
      'Suspend',
      'Prior to Docs',
      'Prior to Funding',
      'Prior to Purchase',
      'Post Funding',
      'Trailing Docs',
    ];
    setCollapsedSections(new Set(allStages));
  }

  function expandAll() {
    setCollapsedSections(new Set());
  }

  async function updateConditionStatus(conditionId: string, newStatus: string) {
    const { error } = await supabase
      .from('conditions')
      .update({
        status: newStatus,
        status_date: new Date().toISOString(),
        status_set_by: 'User',
      })
      .eq('id', conditionId);

    if (!error) {
      fetchConditions();
    }
  }

  async function addNote(conditionId: string, content: string) {
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
      fetchConditions();
    }
  }

  async function markNoteAsRead(noteId: string) {
    const { error } = await supabase
      .from('note_read_status')
      .upsert({
        note_id: noteId,
        role: userRole,
      }, { onConflict: 'note_id,role' });

    if (!error) {
      fetchConditions();
    }
  }

  async function bulkUpdateStage(conditionIds: string[], newStage: Stage) {
    const { error } = await supabase
      .from('conditions')
      .update({ stage: newStage })
      .in('id', conditionIds);

    if (!error) {
      fetchConditions();
    }
    return !error;
  }

  async function bulkUpdateStatus(conditionIds: string[], newStatus: string) {
    const { error } = await supabase
      .from('conditions')
      .update({
        status: newStatus,
        status_date: new Date().toISOString(),
        status_set_by: 'User',
      })
      .in('id', conditionIds);

    if (!error) {
      fetchConditions();
    }
    return !error;
  }

  async function bulkToggleFlag(conditionIds: string[], flagValue: boolean) {
    const { error } = await supabase
      .from('conditions')
      .update({ follow_up_flag: flagValue })
      .in('id', conditionIds);

    if (!error) {
      fetchConditions();
    }
    return !error;
  }

  async function bulkDeleteConditions(conditionIds: string[]) {
    const { error } = await supabase
      .from('conditions')
      .delete()
      .in('id', conditionIds);

    if (!error) {
      fetchConditions();
    }
    return !error;
  }

  async function updateConditionDetails(
    conditionId: string,
    title: string,
    description: string
  ): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
      .from('conditions')
      .update({ title, description })
      .eq('id', conditionId);

    if (error) {
      return { success: false, error: error.message };
    }

    fetchConditions();
    return { success: true };
  }

  return {
    conditions: filteredConditions,
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
    markNoteAsRead,
    bulkUpdateStage,
    bulkUpdateStatus,
    bulkToggleFlag,
    bulkDeleteConditions,
    updateConditionDetails,
    refetch: fetchConditions,
  };
}
