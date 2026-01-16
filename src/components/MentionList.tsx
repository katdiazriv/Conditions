import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import type { LoanTeamMember } from '../types/conditions';

export interface MentionListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

interface MentionListProps {
  items: LoanTeamMember[];
  command: (props: { id: string; label: string }) => void;
}

export const MentionList = forwardRef<MentionListRef, MentionListProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
      setSelectedIndex(0);
    }, [items]);

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        if (event.key === 'ArrowUp') {
          setSelectedIndex((prev) => (prev + items.length - 1) % items.length);
          return true;
        }

        if (event.key === 'ArrowDown') {
          setSelectedIndex((prev) => (prev + 1) % items.length);
          return true;
        }

        if (event.key === 'Enter') {
          const item = items[selectedIndex];
          if (item) {
            command({ id: item.id, label: item.name });
          }
          return true;
        }

        return false;
      },
    }));

    if (items.length === 0) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs text-gray-500">
          No team members found
        </div>
      );
    }

    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden max-h-48 overflow-y-auto">
        {items.map((item, index) => (
          <button
            key={item.id}
            onClick={() => command({ id: item.id, label: item.name })}
            className={`w-full text-left px-3 py-2 flex flex-col gap-0.5 ${
              index === selectedIndex
                ? 'bg-cmg-teal/10 text-cmg-teal'
                : 'hover:bg-gray-50'
            }`}
          >
            <span className="text-xs font-medium">{item.name}</span>
            <span className="text-[10px] text-gray-500">{item.role}</span>
          </button>
        ))}
      </div>
    );
  }
);

MentionList.displayName = 'MentionList';
