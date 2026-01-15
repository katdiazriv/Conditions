import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import type { Note, NoteWithCondition, NoteType, NotesFilter } from '../types/notes';
import { useRoleContext } from '../contexts/RoleContext';
import { getAuthorNameForRole } from '../types/roles';

interface UseNotesOptions {
  loanId: string | null;
  filter?: NotesFilter;
  searchQuery?: string;
  filterConditionId?: string | null;
}

function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}

export function useNotes({ loanId, filter = 'all', searchQuery = '', filterConditionId }: UseNotesOptions) {
  const [notes, setNotes] = useState<NoteWithCondition[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { selectedRole } = useRoleContext();

  const fetchNotes = useCallback(async () => {
    if (!loanId) {
      setNotes([]);
      return;
    }

    setLoading(true);

    try {
      const { data: notesData, error } = await supabase
        .from('condition_notes')
        .select('*')
        .eq('loan_id', loanId)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notes:', error);
        setNotes([]);
        setLoading(false);
        return;
      }

      const safeNotesData = notesData || [];
      const noteIds = safeNotesData.map((n: Note) => n.id);
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

      const conditionIds = safeNotesData
        .filter((n: Note) => n.condition_id)
        .map((n: Note) => n.condition_id);

      let conditionsMap: Record<string, { condition_id: string; title: string }> = {};

      if (conditionIds.length > 0) {
        const { data: conditionsData } = await supabase
          .from('conditions')
          .select('id, condition_id, title')
          .in('id', conditionIds);

        if (conditionsData) {
          conditionsMap = conditionsData.reduce((acc, c) => {
            acc[c.id] = { condition_id: c.condition_id, title: c.title };
            return acc;
          }, {} as Record<string, { condition_id: string; title: string }>);
        }
      }

      const notesWithConditions: NoteWithCondition[] = safeNotesData.map((note: Note) => ({
        ...note,
        is_read: readStatusSet.has(note.id),
        condition: note.condition_id ? conditionsMap[note.condition_id] || null : null,
      }));

      setNotes(notesWithConditions);
    } catch (err) {
      console.error('Unexpected error fetching notes:', err);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, [loanId, selectedRole]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const filteredNotes = useMemo(() => {
    let result = notes;

    if (filterConditionId) {
      result = result.filter(n => n.condition_id === filterConditionId);
    }

    if (filter === 'conditions') {
      result = result.filter(n => n.note_type === 'condition');
    } else if (filter === 'updates') {
      result = result.filter(n => n.note_type === 'update');
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(n => {
        const contentText = stripHtml(n.content).toLowerCase();
        const authorMatch = n.author_name.toLowerCase().includes(query);
        const contentMatch = contentText.includes(query);
        const conditionIdMatch = n.condition?.condition_id?.toLowerCase().includes(query);
        return authorMatch || contentMatch || conditionIdMatch;
      });
    }

    return result;
  }, [notes, filter, searchQuery, filterConditionId]);

  const unreadCount = useMemo(() => {
    return notes.filter(n => !n.is_read).length;
  }, [notes]);

  const unreadConditionCount = useMemo(() => {
    return notes.filter(n => !n.is_read && n.note_type === 'condition').length;
  }, [notes]);

  const unreadUpdateCount = useMemo(() => {
    return notes.filter(n => !n.is_read && n.note_type === 'update').length;
  }, [notes]);

  async function addNote(
    content: string,
    noteType: NoteType,
    conditionId?: string | null
  ): Promise<boolean> {
    if (!loanId) return false;

    setSaving(true);

    const authorName = getAuthorNameForRole(selectedRole);

    const { data: newNote, error } = await supabase
      .from('condition_notes')
      .insert({
        loan_id: loanId,
        condition_id: conditionId || null,
        author_name: authorName,
        author_role: selectedRole,
        content,
        note_type: noteType,
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
    await fetchNotes();
    return true;
  }

  async function togglePin(noteId: string): Promise<boolean> {
    const note = notes.find(n => n.id === noteId);
    if (!note) return false;

    setSaving(true);

    const { error } = await supabase
      .from('condition_notes')
      .update({ is_pinned: !note.is_pinned })
      .eq('id', noteId);

    setSaving(false);

    if (error) {
      console.error('Error toggling pin:', error);
      return false;
    }

    await fetchNotes();
    return true;
  }

  async function markRead(noteId: string): Promise<boolean> {
    setSaving(true);

    const { error } = await supabase
      .from('note_read_status')
      .upsert({
        note_id: noteId,
        role: selectedRole,
      }, { onConflict: 'note_id,role' });

    setSaving(false);

    if (error) {
      console.error('Error marking note as read:', error);
      return false;
    }

    await fetchNotes();
    return true;
  }

  async function markAllRead(): Promise<boolean> {
    if (!loanId) return false;

    setSaving(true);

    const unreadNoteIds = notes.filter(n => !n.is_read).map(n => n.id);

    if (unreadNoteIds.length > 0) {
      const insertData = unreadNoteIds.map(noteId => ({
        note_id: noteId,
        role: selectedRole,
      }));

      const { error } = await supabase
        .from('note_read_status')
        .upsert(insertData, { onConflict: 'note_id,role' });

      if (error) {
        console.error('Error marking all notes as read:', error);
        setSaving(false);
        return false;
      }
    }

    setSaving(false);
    await fetchNotes();
    return true;
  }

  async function deleteNote(noteId: string): Promise<boolean> {
    setSaving(true);

    const { error } = await supabase
      .from('condition_notes')
      .delete()
      .eq('id', noteId);

    setSaving(false);

    if (error) {
      console.error('Error deleting note:', error);
      return false;
    }

    await fetchNotes();
    return true;
  }

  return {
    notes: filteredNotes,
    allNotes: notes,
    loading,
    saving,
    unreadCount,
    unreadConditionCount,
    unreadUpdateCount,
    addNote,
    togglePin,
    markRead,
    markAllRead,
    deleteNote,
    refetch: fetchNotes,
  };
}
