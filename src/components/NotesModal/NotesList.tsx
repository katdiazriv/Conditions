import { FileText } from 'lucide-react';
import { NoteItem } from './NoteItem';
import type { NoteWithCondition } from '../../types/notes';

interface NotesListProps {
  notes: NoteWithCondition[];
  loading: boolean;
  onTogglePin: (noteId: string) => void;
  onMarkRead: (noteId: string) => void;
  onDelete: (noteId: string) => void;
  isConditionFiltered?: boolean;
}

export function NotesList({ notes, loading, onTogglePin, onMarkRead, onDelete, isConditionFiltered }: NotesListProps) {
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-400">Loading notes...</div>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-12">
        <FileText className="w-12 h-12 mb-3 opacity-50" />
        <p className="text-sm">{isConditionFiltered ? 'No notes for this condition' : 'No notes yet'}</p>
        <p className="text-xs mt-1">{isConditionFiltered ? 'Add a note above or clear the filter' : 'Add a note above to get started'}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {notes.map((note) => (
        <NoteItem
          key={note.id}
          note={note}
          onTogglePin={onTogglePin}
          onMarkRead={onMarkRead}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
