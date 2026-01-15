import { useEffect, useRef } from 'react';
import { X, Upload } from 'lucide-react';
import { useDocumentUpload } from '../../hooks/useDocumentUpload';
import { DropZone } from './DropZone';
import { UploadFileRow } from './UploadFileRow';
import { Button } from '../Button';

interface UploadDocumentsModalProps {
  conditionId: string | null;
  loanId: string;
  initialFiles?: File[];
  onClose: () => void;
  onUploadComplete: () => void;
  onReviewDocs: (conditionId: string | null) => void;
  createdBy?: string;
}

export function UploadDocumentsModal({
  conditionId,
  loanId,
  initialFiles,
  onClose,
  onUploadComplete,
  onReviewDocs,
  createdBy,
}: UploadDocumentsModalProps) {
  const {
    uploadQueue,
    addFiles,
    removeFile,
    retryUpload,
    hasActiveUploads,
    completedCount,
  } = useDocumentUpload({ conditionId, loanId, createdBy });

  const hasProcessedInitialFiles = useRef(false);

  useEffect(() => {
    if (!hasProcessedInitialFiles.current && initialFiles && initialFiles.length > 0) {
      hasProcessedInitialFiles.current = true;
      addFiles(initialFiles);
    }
  }, [initialFiles, addFiles]);

  function handleClose() {
    if (completedCount > 0) {
      onUploadComplete();
    }
    onClose();
  }

  function handleReviewDocs() {
    if (completedCount > 0) {
      onUploadComplete();
    }
    onReviewDocs(conditionId);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <Upload className="w-5 h-5 text-cmg-teal" />
            <h2 className="text-lg font-bold text-gray-900">
              {conditionId ? 'Upload' : 'Bulk Upload'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex min-h-[400px]">
          <div className="flex-1 p-4">
            <DropZone onFilesSelected={addFiles} />
          </div>

          <div className="w-[300px] border-l border-gray-200 flex flex-col">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-700">
                Files ({uploadQueue.length})
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto px-4">
              {uploadQueue.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                  No files selected
                </div>
              ) : (
                uploadQueue.map((item) => (
                  <UploadFileRow
                    key={item.id}
                    item={item}
                    onDelete={removeFile}
                    onRetry={retryUpload}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <Button onClick={handleClose} variant="secondary">
            Close
          </Button>
          <Button
            onClick={handleReviewDocs}
            variant="primary"
            disabled={hasActiveUploads || completedCount === 0}
          >
            Review Docs
          </Button>
        </div>
      </div>
    </div>
  );
}
