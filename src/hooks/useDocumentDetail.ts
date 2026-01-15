import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useRoleContext } from '../contexts/RoleContext';
import { getAuthorNameForRole } from '../types/roles';
import { deleteDocumentWithFile } from '../services/fileUploadService';
import type {
  ConditionDocument,
  DocumentNote,
  DocumentStatus,
  DocumentConditionAssociation,
  ConditionStatus,
} from '../types/conditions';

interface UseDocumentDetailProps {
  documentId: string | null;
}

interface DocumentUpdateData {
  document_name?: string;
  document_type?: string | null;
  description?: string | null;
  expiration_date?: string | null;
  document_for_party_id?: string | null;
  modified_by?: string | null;
  modified_on?: string | null;
}

export function useDocumentDetail({ documentId }: UseDocumentDetailProps) {
  const { selectedRole } = useRoleContext();
  const [document, setDocument] = useState<ConditionDocument | null>(null);
  const [notes, setNotes] = useState<DocumentNote[]>([]);
  const [associations, setAssociations] = useState<DocumentConditionAssociation[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchDocument = useCallback(async () => {
    if (!documentId) {
      setDocument(null);
      setNotes([]);
      setAssociations([]);
      return;
    }

    setLoading(true);

    const { data: docData } = await supabase
      .from('condition_documents')
      .select('*')
      .eq('id', documentId)
      .maybeSingle();

    const { data: notesData } = await supabase
      .from('document_notes')
      .select('*')
      .eq('document_id', documentId)
      .order('created_at', { ascending: false });

    const { data: associationsData } = await supabase
      .from('document_condition_associations')
      .select('*')
      .eq('document_id', documentId);

    setDocument(docData);
    setNotes(notesData || []);
    setAssociations(associationsData || []);
    setLoading(false);
  }, [documentId]);

  useEffect(() => {
    fetchDocument();
  }, [fetchDocument]);

  async function updateDocument(data: DocumentUpdateData) {
    if (!documentId) return false;

    setSaving(true);
    const { error } = await supabase
      .from('condition_documents')
      .update(data)
      .eq('id', documentId);

    setSaving(false);

    if (!error) {
      setDocument((prev) => (prev ? { ...prev, ...data } : null));
    }

    return !error;
  }

  async function updateDocumentStatus(newStatus: DocumentStatus) {
    if (!documentId) return false;

    setSaving(true);
    const { error } = await supabase
      .from('condition_documents')
      .update({ status: newStatus })
      .eq('id', documentId);

    setSaving(false);

    if (!error) {
      setDocument((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    return !error;
  }

  async function deleteDocument() {
    if (!documentId) return false;

    setSaving(true);
    const { success } = await deleteDocumentWithFile(documentId);
    setSaving(false);
    return success;
  }

  async function addNote(content: string) {
    if (!documentId) return false;

    const { data, error } = await supabase
      .from('document_notes')
      .insert({
        document_id: documentId,
        author_name: getAuthorNameForRole(selectedRole),
        author_role: selectedRole,
        content,
      })
      .select()
      .maybeSingle();

    if (!error && data) {
      setNotes((prev) => [data, ...prev]);
    }

    return !error;
  }

  interface AssociationToSave {
    conditionId: string;
    pendingStatus: ConditionStatus | null;
  }

  async function saveAssociations(associationsToSave: AssociationToSave[]) {
    if (!documentId) return false;

    setSaving(true);

    const currentConditionIds = associations.map((a) => a.condition_id);
    const newConditionIds = associationsToSave.map((a) => a.conditionId);

    const toAdd = associationsToSave.filter(
      (a) => !currentConditionIds.includes(a.conditionId)
    );
    const toRemove = currentConditionIds.filter(
      (id) => !newConditionIds.includes(id)
    );

    let success = true;

    if (toRemove.length > 0) {
      const { error } = await supabase
        .from('document_condition_associations')
        .delete()
        .eq('document_id', documentId)
        .in('condition_id', toRemove);

      if (error) success = false;
    }

    if (toAdd.length > 0) {
      const { error } = await supabase
        .from('document_condition_associations')
        .insert(
          toAdd.map((a) => ({
            document_id: documentId,
            condition_id: a.conditionId,
          }))
        );

      if (error) success = false;
    }

    for (const assoc of associationsToSave) {
      if (assoc.pendingStatus) {
        const { error } = await supabase
          .from('conditions')
          .update({
            status: assoc.pendingStatus,
            status_date: new Date().toISOString(),
            status_set_by: 'User',
          })
          .eq('id', assoc.conditionId);

        if (error) success = false;
      }
    }

    setSaving(false);

    if (success) {
      await fetchDocument();
    }

    return success;
  }

  return {
    document,
    notes,
    associations,
    loading,
    saving,
    updateDocument,
    updateDocumentStatus,
    deleteDocument,
    addNote,
    saveAssociations,
    refetch: fetchDocument,
  };
}
