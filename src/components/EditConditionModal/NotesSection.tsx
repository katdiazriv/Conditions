import { useState } from 'react';
import { NoteEditor } from '../NoteEditor';
import { Button } from '../Button';
import { Badge } from '../Badge';
import { ExpansionPanel } from '../ExpansionPanel';
import { ConditionNoteItem } from '../ConditionNoteItem';
import type { ConditionNote } from '../../types/conditions';

interface NotesSectionProps {
  notes: ConditionNote[];
  onAddNote: (content: string) => Promise<boolean>;
}

export function NotesSection({ notes, onAddNote }: NotesSectionProps) {
  const [isEditorExpanded, setIsEditorExpanded] = useState(false);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAllNotes, setShowAllNotes] = useState(false);

  async function handleAddNote() {
    if (!content.trim() || content === '<p></p>' || isSubmitting) return;

    setIsSubmitting(true);
    const success = await onAddNote(content);
    setIsSubmitting(false);

    if (success) {
      setContent('');
      setIsEditorExpanded(false);
    }
  }

  const hasContent = content.trim() && content !== '<p></p>';
  const latestNote = notes[0];
  const displayedNotes = showAllNotes ? notes : latestNote ? [latestNote] : [];

  return (
    <ExpansionPanel
      title="Condition Notes"
      noBorder
      rightContent={<Badge variant="light">{notes.length}</Badge>}
    >
      {!isEditorExpanded ? (
        <button
          onClick={() => setIsEditorExpanded(true)}
          className="w-full h-9 px-4 text-left text-xs text-gray-400 bg-white border border-gray-300 rounded-lg hover:border-cmg-teal focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-cmg-teal transition-colors"
        >
          Type notes about the condition...
        </button>
      ) : (
        <div className="mb-3">
          <NoteEditor
            value={content}
            onChange={setContent}
            placeholder="Type notes about the condition..."
            onSubmit={handleAddNote}
            autoFocus
          />
          <div className="flex justify-end gap-2 mt-3">
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                setContent('');
                setIsEditorExpanded(false);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleAddNote}
              disabled={!hasContent || isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Add Note'}
            </Button>
          </div>
        </div>
      )}

      {displayedNotes.length > 0 && (
        <div className="mt-5">
          {displayedNotes.map((note) => (
            <ConditionNoteItem key={note.id} note={note} />
          ))}

          {notes.length > 1 && (
            <button
              onClick={() => setShowAllNotes(!showAllNotes)}
              className="text-xs font-medium text-cmg-teal hover:text-cmg-teal-dark transition-colors"
            >
              {showAllNotes ? 'Show Less' : `See All Notes (${notes.length})`}
            </button>
          )}
        </div>
      )}
    </ExpansionPanel>
  );
}
