import { X } from 'lucide-react';
import { IconButton } from '../IconButton';

interface NotesHeaderProps {
  unreadCount: number;
  onClose: () => void;
}

export function NotesHeader({ unreadCount, onClose }: NotesHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-bold text-gray-900">Conditions Portal Notes</h2>
        {unreadCount > 0 && (
          <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </div>
      <IconButton icon={<X className="w-5 h-5" />} onClick={onClose} />
    </div>
  );
}
