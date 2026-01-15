import { useState, useRef, useEffect } from 'react';
import { Pin, MoreVertical, Trash2 } from 'lucide-react';
import type { NoteWithCondition } from '../../types/notes';

interface NoteItemProps {
  note: NoteWithCondition;
  onTogglePin: (noteId: string) => void;
  onMarkRead: (noteId: string) => void;
  onDelete: (noteId: string) => void;
}

export function NoteItem({ note, onTogglePin, onMarkRead, onDelete }: NoteItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleClick = () => {
    if (!note.is_read) {
      onMarkRead(note.id);
    }
  };

  const formattedDate = new Date(note.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  const displayDate = formattedDate.replace(',', ', ');

  const isToday = new Date(note.created_at).toDateString() === new Date().toDateString();
  const dateDisplay = isToday
    ? `Today, ${new Date(note.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
    : displayDate;

  return (
    <div
      onClick={handleClick}
      className={`relative px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
        !note.is_read ? 'bg-blue-50/30' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1.5">
          {!note.is_read ? (
            <div className="w-2 h-2 rounded-full bg-blue-500" />
          ) : (
            <div className="w-2 h-2" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-xs text-gray-900">{note.author_name}</span>
            <span className="text-xs text-gray-400">{dateDisplay}</span>
          </div>

          {note.condition && (
            <div className="mb-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                {note.condition.condition_id}
              </span>
            </div>
          )}

          <div
            className="text-xs text-gray-700 prose prose-sm max-w-none [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_ul]:list-disc [&_ul]:pl-5 [&_a]:text-cmg-teal"
            dangerouslySetInnerHTML={{ __html: note.content }}
          />
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin(note.id);
            }}
            className={`p-1.5 rounded transition-colors ${
              note.is_pinned
                ? 'text-cmg-teal hover:bg-cmg-teal/10'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
            title={note.is_pinned ? 'Unpin note' : 'Pin note'}
          >
            <Pin className={`w-4 h-4 ${note.is_pinned ? 'fill-cmg-teal' : ''}`} />
          </button>

          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="p-1.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(note.id);
                    setMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
