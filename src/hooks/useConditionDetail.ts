import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useRoleContext } from '../contexts/RoleContext';
import { getAuthorNameForRole } from '../types/roles';
import type {
  Condition,
  DocRequest,
  ConditionNote,
  ConditionStatus,
  SourceType,
  ConditionClass,
  Stage,
} from '../types/conditions';

interface ConditionDetail extends Condition {
  doc_requests: DocRequest[];
  notes: ConditionNote[];
}

interface UpdateConditionData {
  title?: string;
  description?: string;
  status?: ConditionStatus;
  stage?: Stage;
  condition_class?: ConditionClass;
  source_type?: SourceType;
  follow_up_flag?: boolean;
  expiration_date?: string | null;
  follow_up_date?: string | null;
}

interface NewDocRequest {
  document_type: string;
  fulfillment_party: string;
  description_for_borrower: string;
}

export function useConditionDetail(conditionId: string | null) {
  const { selectedRole } = useRoleContext();
  const [condition, setCondition] = useState<ConditionDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchCondition = useCallback(async () => {
    if (!conditionId) {
      setCondition(null);
      return;
    }

    setLoading(true);

    const { data: conditionData, error: conditionError } = await supabase
      .from('conditions')
      .select('*')
      .eq('id', conditionId)
      .maybeSingle();

    if (conditionError || !conditionData) {
      console.error('Error fetching condition:', conditionError);
      setLoading(false);
      return;
    }

    const { data: docRequests } = await supabase
      .from('doc_requests')
      .select('*')
      .eq('condition_id', conditionId)
      .order('created_at', { ascending: true });

    const { data: notes } = await supabase
      .from('condition_notes')
      .select('*')
      .eq('condition_id', conditionId)
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

    setCondition({
      ...conditionData,
      doc_requests: docRequests || [],
      notes: notesWithReadStatus,
    });
    setLoading(false);
  }, [conditionId, selectedRole]);

  useEffect(() => {
    fetchCondition();
  }, [fetchCondition]);

  async function updateCondition(data: UpdateConditionData): Promise<boolean> {
    if (!conditionId || !condition) return false;

    setSaving(true);

    const updateData: Record<string, unknown> = { ...data };

    if (data.status && data.status !== condition.status) {
      updateData.status_date = new Date().toISOString();
      updateData.status_set_by = 'User';

      const statusDateField = getStatusDateField(data.status);
      if (statusDateField) {
        updateData[statusDateField] = new Date().toISOString();
      }
    }

    const { error } = await supabase
      .from('conditions')
      .update(updateData)
      .eq('id', conditionId);

    setSaving(false);

    if (error) {
      console.error('Error updating condition:', error);
      return false;
    }

    await fetchCondition();
    return true;
  }

  async function addDocRequest(docRequest: NewDocRequest): Promise<boolean> {
    if (!conditionId) return false;

    setSaving(true);

    const { error } = await supabase.from('doc_requests').insert({
      condition_id: conditionId,
      document_type: docRequest.document_type,
      fulfillment_party: docRequest.fulfillment_party,
      description_for_borrower: docRequest.description_for_borrower,
      status: 'New',
    });

    setSaving(false);

    if (error) {
      console.error('Error adding doc request:', error);
      return false;
    }

    await fetchCondition();
    return true;
  }

  async function updateDocRequest(
    docRequestId: string,
    data: Partial<DocRequest>
  ): Promise<boolean> {
    setSaving(true);

    const { error } = await supabase
      .from('doc_requests')
      .update(data)
      .eq('id', docRequestId);

    setSaving(false);

    if (error) {
      console.error('Error updating doc request:', error);
      return false;
    }

    await fetchCondition();
    return true;
  }

  async function deleteDocRequest(docRequestId: string): Promise<boolean> {
    setSaving(true);

    const { error } = await supabase
      .from('doc_requests')
      .delete()
      .eq('id', docRequestId);

    setSaving(false);

    if (error) {
      console.error('Error deleting doc request:', error);
      return false;
    }

    await fetchCondition();
    return true;
  }

  async function addNote(content: string): Promise<boolean> {
    if (!conditionId || !condition) return false;

    setSaving(true);

    const { data: newNote, error } = await supabase
      .from('condition_notes')
      .insert({
        condition_id: conditionId,
        loan_id: condition.loan_id,
        author_name: getAuthorNameForRole(selectedRole),
        author_role: selectedRole,
        content,
        note_type: 'condition',
        is_pinned: false,
      })
      .select('id')
      .maybeSingle();

    if (error || !newNote) {
      console.error('Error adding note:', error);
      setSaving(false);
      return false;
    }

    await supabase.from('note_read_status').insert({
      note_id: newNote.id,
      role: selectedRole,
    });

    setSaving(false);
    await fetchCondition();
    return true;
  }

  return {
    condition,
    loading,
    saving,
    updateCondition,
    addDocRequest,
    updateDocRequest,
    deleteDocRequest,
    addNote,
    refetch: fetchCondition,
  };
}

function getStatusDateField(status: ConditionStatus): string | null {
  const mapping: Record<ConditionStatus, string> = {
    'New': 'new_date',
    'Need Brw Request': 'need_brw_request_date',
    'Requested': 'requested_date',
    'Processor to Review': 'processor_to_review_date',
    'Ready for UW': 'ready_for_uw_date',
    'Cleared': 'cleared_date',
    'Not Cleared': 'not_cleared_date',
  };
  return mapping[status] || null;
}
