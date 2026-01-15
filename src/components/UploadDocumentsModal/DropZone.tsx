import { useState, useRef, useCallback } from 'react';
import { UploadCloud } from 'lucide-react';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE, formatFileSize } from '../../services/fileUploadService';
import { Button } from '../Button';

interface DropZoneProps {
  onFilesSelected: (files: FileList | File[]) => void;
}

export function DropZone({ onFilesSelected }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        onFilesSelected(files);
      }
    },
    [onFilesSelected]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        onFilesSelected(files);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [onFilesSelected]
  );

  const handleSelectClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const acceptTypes = ALLOWED_MIME_TYPES.join(',');

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`
        flex flex-col items-center justify-center
        border-2 border-dashed rounded-lg
        p-8 h-full min-h-[300px]
        transition-colors duration-200
        ${
          isDragOver
            ? 'border-cmg-teal bg-[#D5EFEF]'
            : 'border-cmg-teal bg-[#EAF6F7]'
        }
      `}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptTypes}
        onChange={handleFileInputChange}
        className="hidden"
      />

      <UploadCloud
        className={`w-16 h-16 mb-4 transition-colors ${
          isDragOver ? 'text-cmg-teal-dark' : 'text-cmg-teal'
        }`}
      />

      <p className="text-gray-700 font-medium text-lg mb-4">
        Drag & Drop to Upload
      </p>

      <Button
        onClick={handleSelectClick}
        variant="primary"
        className="rounded-full px-6"
      >
        Select Files
      </Button>

      <div className="text-center mt-4">
        <p className="text-gray-500 text-sm">
          Max File Size: {formatFileSize(MAX_FILE_SIZE)}
        </p>
        <p className="text-gray-400 text-xs mt-1">
          Supported formats: PDF, JPEG, PNG, GIF, WebP
        </p>
      </div>
    </div>
  );
}
