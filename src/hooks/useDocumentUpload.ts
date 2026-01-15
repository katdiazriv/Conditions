import { useState, useCallback } from 'react';
import {
  validateFile,
  uploadFileToStorage,
  uploadThumbnailToStorage,
  generateThumbnailWithPageCount,
  createDocumentRecord,
  deleteDocumentWithFile,
  generateUniqueFilename,
  isImageFile,
  PDF_MIME_TYPE,
} from '../services/fileUploadService';
import { convertImageToPdf } from '../services/pdfConversionService';
import type { ConditionDocument } from '../types/conditions';

export type UploadStatus = 'pending' | 'uploading' | 'complete' | 'error';

export interface UploadItem {
  id: string;
  file: File;
  status: UploadStatus;
  progress: number;
  document?: ConditionDocument;
  error?: string;
}

interface UseDocumentUploadProps {
  conditionId: string | null;
  loanId: string;
  createdBy?: string;
}

export function useDocumentUpload({ conditionId, loanId, createdBy }: UseDocumentUploadProps) {
  const [uploadQueue, setUploadQueue] = useState<UploadItem[]>([]);

  const updateItem = useCallback((id: string, updates: Partial<UploadItem>) => {
    setUploadQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }, []);

  const processUpload = useCallback(
    async (item: UploadItem) => {
      const validation = validateFile(item.file);
      if (!validation.valid) {
        updateItem(item.id, { status: 'error', error: validation.error });
        return;
      }

      updateItem(item.id, { status: 'uploading', progress: 5 });

      let fileToUpload: File | Blob = item.file;
      let finalFilename = item.file.name;
      let finalMimeType = item.file.type;

      if (isImageFile(item.file)) {
        updateItem(item.id, { progress: 10 });
        try {
          const { pdfBlob, pdfFilename } = await convertImageToPdf(item.file);
          fileToUpload = pdfBlob;
          finalFilename = pdfFilename;
          finalMimeType = PDF_MIME_TYPE;
        } catch {
          updateItem(item.id, {
            status: 'error',
            error: 'Failed to convert image to PDF',
          });
          return;
        }
      }

      updateItem(item.id, { progress: 25 });

      const uniqueFilename = generateUniqueFilename(finalFilename);
      const folderName = conditionId ?? 'unassigned';
      const storagePath = `${loanId}/${folderName}/${uniqueFilename}`;

      const { url: fileUrl, error: uploadError } = await uploadFileToStorage(
        fileToUpload as File,
        storagePath
      );

      if (uploadError || !fileUrl) {
        updateItem(item.id, {
          status: 'error',
          error: uploadError || 'Failed to upload file',
        });
        return;
      }

      updateItem(item.id, { progress: 55 });

      let thumbnailUrl: string | null = null;
      let pageCount = 1;

      const pdfFile = new File([fileToUpload], finalFilename, { type: PDF_MIME_TYPE });
      const thumbnailResult = await generateThumbnailWithPageCount(pdfFile);

      if (thumbnailResult.thumbnail) {
        const thumbPath = `${loanId}/${folderName}/thumb_${uniqueFilename.replace(/\.[^/.]+$/, '.jpg')}`;
        const { url } = await uploadThumbnailToStorage(thumbnailResult.thumbnail, thumbPath);
        thumbnailUrl = url;
      }
      pageCount = thumbnailResult.pageCount;

      updateItem(item.id, { progress: 80 });

      const { document, error: createError } = await createDocumentRecord({
        conditionId,
        loanId,
        fileName: item.file.name,
        fileUrl,
        thumbnailUrl,
        fileSize: fileToUpload.size,
        mimeType: finalMimeType,
        originalFilename: item.file.name,
        pageCount,
        createdBy,
      });

      if (createError || !document) {
        updateItem(item.id, {
          status: 'error',
          error: createError || 'Failed to create document record',
        });
        return;
      }

      updateItem(item.id, {
        status: 'complete',
        progress: 100,
        document,
      });
    },
    [conditionId, loanId, createdBy, updateItem]
  );

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const newItems: UploadItem[] = fileArray.map((file) => ({
        id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        file,
        status: 'pending' as const,
        progress: 0,
      }));

      setUploadQueue((prev) => [...prev, ...newItems]);

      newItems.forEach((item) => {
        processUpload(item);
      });
    },
    [processUpload]
  );

  const removeFile = useCallback(
    async (id: string) => {
      const item = uploadQueue.find((i) => i.id === id);

      if (item?.document?.id) {
        await deleteDocumentWithFile(item.document.id);
      }

      setUploadQueue((prev) => prev.filter((i) => i.id !== id));
    },
    [uploadQueue]
  );

  const retryUpload = useCallback(
    (id: string) => {
      const item = uploadQueue.find((i) => i.id === id);
      if (item && item.status === 'error') {
        updateItem(id, { status: 'pending', progress: 0, error: undefined });
        processUpload({ ...item, status: 'pending', progress: 0 });
      }
    },
    [uploadQueue, updateItem, processUpload]
  );

  const clearCompleted = useCallback(() => {
    setUploadQueue((prev) => prev.filter((item) => item.status !== 'complete'));
  }, []);

  const hasActiveUploads = uploadQueue.some(
    (item) => item.status === 'pending' || item.status === 'uploading'
  );

  const completedCount = uploadQueue.filter((item) => item.status === 'complete').length;

  return {
    uploadQueue,
    addFiles,
    removeFile,
    retryUpload,
    clearCompleted,
    hasActiveUploads,
    completedCount,
  };
}
