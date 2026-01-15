import { useState } from 'react';
import { NoteEditor } from '../NoteEditor';
import { Button } from '../Button';
import type { NotesModalEntryPoint, NoteType } from '../../types/notes';

interface CreateNoteSectionProps {
  entryPoint: NotesModalEntryPoint;
  conditionId?: string | null;
  onAddNote: (content: string, noteType: NoteType, conditionId?: string | null) => Promise<boolean>;
  saving: boolean;
}

export function CreateNoteSection({
  entryPoint,
  conditionId,
  onAddNote,
  saving,
}: CreateNoteSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState('');

  const noteType: NoteType = entryPoint === 'condition' ? 'condition' : 'update';

  const placeholder =
    entryPoint === 'condition' && conditionId
      ? `Add a note for condition ${conditionId}...`
      : 'Add a loan update...';

  const handleSubmit = async () => {
    if (!content.trim() || content === '<p></p>') return;

    const success = await onAddNote(
      content,
      noteType,
      entryPoint === 'condition' ? conditionId : null
    );

    if (success) {
      setContent('');
      setIsExpanded(false);
    }
  };

  const hasContent = content.trim() && content !== '<p></p>';

  if (!isExpanded) {
    return (
      <div className="px-6 py-4">
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full h-9 px-4 text-left text-xs text-gray-400 bg-white border border-gray-300 rounded-lg hover:border-cmg-teal focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-cmg-teal transition-colors"
        >
          Create New Note
        </button>
      </div>
    );
  }

  return (
    <div className="px-6 py-4">
      <NoteEditor
        value={content}
        onChange={setContent}
        placeholder={placeholder}
        onSubmit={handleSubmit}
        autoFocus
      />
      <div className="flex justify-end gap-2 mt-3">
        <Button
          variant="secondary"
          size="md"
          onClick={() => {
            setContent('');
            setIsExpanded(false);
          }}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          size="md"
          onClick={handleSubmit}
          disabled={!hasContent || saving}
        >
          {saving ? 'Saving...' : 'Add Note'}
        </Button>
      </div>
    </div>
  );
}
