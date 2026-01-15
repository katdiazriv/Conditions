import { Search } from 'lucide-react';
import { Button } from '../Button';
import type { NotesFilter } from '../../types/notes';

interface NotesTabsProps {
  activeFilter: NotesFilter;
  onFilterChange: (filter: NotesFilter) => void;
  onMarkAllRead: () => void;
  onSearchToggle: () => void;
  hasUnread: boolean;
  saving: boolean;
}

export function NotesTabs({
  activeFilter,
  onFilterChange,
  onMarkAllRead,
  onSearchToggle,
  hasUnread,
  saving,
}: NotesTabsProps) {
  const tabs: { key: NotesFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'conditions', label: 'Condition' },
    { key: 'updates', label: 'Updates' },
  ];

  return (
    <div className="flex items-center justify-between px-6 border-b border-gray-200">
      <div className="flex items-center gap-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onFilterChange(tab.key)}
            className={`text-sm font-bold py-3 border-b-2 transition-colors ${
              activeFilter === tab.key
                ? 'text-gray-900 border-cmg-teal'
                : 'text-gray-500 border-transparent hover:text-cmg-teal'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        {hasUnread && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onMarkAllRead}
            disabled={saving}
          >
            Mark All Read
          </Button>
        )}
        <button
          onClick={onSearchToggle}
          className="p-1.5 text-cmg-teal hover:text-cmg-teal-dark hover:bg-cmg-teal/10 rounded transition-colors"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
