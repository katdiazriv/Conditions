import { useState } from 'react';
import { ExpansionPanel } from '../ExpansionPanel';
import { TextArea } from '../TextArea';

export interface LocalNote {
  temp_id: string;
  author_name: string;
  author_role: string;
  content: string;
  created_at: string;
}

interface LocalNotesSectionProps {
  notes: LocalNote[];
  onAddNote: (content: string) => void;
}

function formatNoteTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  if (isToday) {
    return `Today, ${timeStr}`;
  }

  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
}

export function LocalNotesSection({ notes, onAddNote }: LocalNotesSectionProps) {
  const [noteContent, setNoteContent] = useState('');

  function handleAddNote() {
    if (!noteContent.trim()) return;
    onAddNote(noteContent.trim());
    setNoteContent('');
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddNote();
    }
  }

  const latestNote = notes[0];

  return (
    <ExpansionPanel title="Condition Notes">
      <TextArea
        value={noteContent}
        onChange={(e) => setNoteContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type notes about the condition..."
        rows={2}
        resize="none"
        className="mb-3"
      />

      {latestNote && (
        <div className="mt-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-900">
              {latestNote.author_name}
            </span>
            <span className="text-xs text-gray-500">
              {formatNoteTime(latestNote.created_at)}
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-1 line-clamp-3">
            {latestNote.content}
          </p>

          {notes.length > 1 && (
            <button className="text-xs font-medium text-cmg-teal hover:text-cmg-teal-dark mt-2 transition-colors">
              See All Notes ({notes.length})
            </button>
          )}
        </div>
      )}
    </ExpansionPanel>
  );
}
