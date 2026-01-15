import type { ConditionNote } from '../types/conditions';

interface ConditionNoteItemProps {
  note: ConditionNote;
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

  const dateStr = date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });

  return `${dateStr}, ${timeStr}`;
}

export function ConditionNoteItem({ note }: ConditionNoteItemProps) {
  return (
    <div className="mb-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-normal text-gray-900">{note.author_name}</span>
        <span className="text-xs text-gray-500">{formatNoteTime(note.created_at)}</span>
      </div>
      <div
        className="text-xs text-gray-700 prose prose-sm max-w-none [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-cmg-teal [&_a]:hover:text-cmg-teal-dark"
        dangerouslySetInnerHTML={{ __html: note.content }}
      />
    </div>
  );
}
