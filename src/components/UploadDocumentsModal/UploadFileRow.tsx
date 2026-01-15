import { Eye, Trash2, RefreshCw } from 'lucide-react';
import type { UploadItem } from '../../hooks/useDocumentUpload';
import { formatFileSize } from '../../services/fileUploadService';

interface UploadFileRowProps {
  item: UploadItem;
  onDelete: (id: string) => void;
  onRetry: (id: string) => void;
}

export function UploadFileRow({ item, onDelete, onRetry }: UploadFileRowProps) {
  const isUploading = item.status === 'pending' || item.status === 'uploading';
  const isComplete = item.status === 'complete';
  const isError = item.status === 'error';

  return (
    <div className="py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-medium truncate ${
              isError ? 'text-red-600' : 'text-gray-900'
            }`}
            title={item.file.name}
          >
            {item.file.name}
          </p>

          {isUploading && (
            <div className="mt-2">
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-gray-300 to-cmg-teal rounded-full transition-all duration-300"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>
          )}

          {isComplete && item.document && (
            <p className="text-xs text-gray-500 mt-1">
              {formatFileSize(item.file.size)}
            </p>
          )}

          {isError && (
            <p className="text-xs text-red-500 mt-1">{item.error}</p>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {isComplete && (
            <>
              <button
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded transition-colors"
                title="Preview (placeholder)"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="p-1.5 text-red-400 hover:text-red-600 rounded transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}

          {isError && (
            <>
              <button
                onClick={() => onRetry(item.id)}
                className="p-1.5 text-cmg-teal hover:text-cmg-teal-dark rounded transition-colors"
                title="Retry"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="p-1.5 text-red-400 hover:text-red-600 rounded transition-colors"
                title="Remove"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
