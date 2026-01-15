import { useState, useEffect, useCallback } from 'react';
import { NotesHeader } from './NotesHeader';
import { NotesTabs } from './NotesTabs';
import { NotesFilters } from './NotesFilters';
import { NotesList } from './NotesList';
import { CreateNoteSection } from './CreateNoteSection';
import { ConditionFilterBar } from './ConditionFilterBar';
import { useNotes } from '../../hooks/useNotes';
import { useLoanContext } from '../../contexts/LoanContext';
import { supabase } from '../../lib/supabase';
import type { NotesFilter, NotesModalEntryPoint } from '../../types/notes';

interface NotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  entryPoint: NotesModalEntryPoint;
  conditionId?: string | null;
}

export function NotesModal({ isOpen, onClose, entryPoint, conditionId }: NotesModalProps) {
  const { selectedLoanId } = useLoanContext();
  const [filter, setFilter] = useState<NotesFilter>('all');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [conditionFilter, setConditionFilter] = useState<string | null>(null);
  const [conditionDisplayId, setConditionDisplayId] = useState<string | null>(null);

  const {
    notes,
    loading,
    saving,
    unreadCount,
    addNote,
    togglePin,
    markRead,
    markAllRead,
    deleteNote,
  } = useNotes({ loanId: selectedLoanId, filter, searchQuery, filterConditionId: conditionFilter });

  const fetchConditionDisplayId = useCallback(async (id: string) => {
    const { data } = await supabase
      .from('conditions')
      .select('condition_id')
      .eq('id', id)
      .maybeSingle();

    if (data?.condition_id) {
      setConditionDisplayId(data.condition_id);
    } else {
      setConditionFilter(null);
      setConditionDisplayId(null);
    }
  }, []);

  useEffect(() => {
    if (isOpen && conditionId) {
      setConditionFilter(conditionId);
      fetchConditionDisplayId(conditionId);
    }
  }, [isOpen, conditionId, fetchConditionDisplayId]);

  const clearConditionFilter = useCallback(() => {
    setConditionFilter(null);
    setConditionDisplayId(null);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (isSearchOpen) {
          setIsSearchOpen(false);
          setSearchQuery('');
        } else {
          onClose();
        }
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isSearchOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setIsSearchOpen(false);
      setSearchQuery('');
      setFilter('all');
      setConditionFilter(null);
      setConditionDisplayId(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/30 transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white shadow-xl flex flex-col animate-slide-in-right">
        <NotesHeader
          unreadCount={unreadCount}
          onClose={onClose}
        />

        <CreateNoteSection
          entryPoint={entryPoint}
          conditionId={conditionId}
          onAddNote={addNote}
          saving={saving}
        />

        <NotesTabs
          activeFilter={filter}
          onFilterChange={setFilter}
          onMarkAllRead={markAllRead}
          onSearchToggle={() => setIsSearchOpen(!isSearchOpen)}
          hasUnread={unreadCount > 0}
          saving={saving}
        />

        {conditionDisplayId && (
          <ConditionFilterBar
            conditionDisplayId={conditionDisplayId}
            onClear={clearConditionFilter}
          />
        )}

        <NotesFilters
          isOpen={isSearchOpen}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClose={() => setIsSearchOpen(false)}
        />

        <NotesList
          notes={notes}
          loading={loading}
          onTogglePin={togglePin}
          onMarkRead={markRead}
          onDelete={deleteNote}
          isConditionFiltered={!!conditionFilter}
        />
      </div>
    </div>
  );
}
