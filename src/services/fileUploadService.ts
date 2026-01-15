import { supabase } from '../lib/supabase';
import { loadPdfJs } from '../utils/pdfLoader';
import type { ConditionDocument } from '../types/conditions';

export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const THUMBNAIL_WIDTH = 100;
export const THUMBNAIL_HEIGHT = 130;

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
];

export const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const PDF_MIME_TYPE = 'application/pdf';

export function isImageFile(file: File): boolean {
  return IMAGE_MIME_TYPES.includes(file.type);
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateFile(file: File): FileValidationResult {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds ${formatFileSize(MAX_FILE_SIZE)} limit`,
    };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'File type not supported. Please upload PDF or image files (JPEG, PNG, GIF, WebP).',
    };
  }

  return { valid: true };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export async function uploadFileToStorage(
  file: File,
  path: string
): Promise<{ url: string | null; error?: string }> {
  const { data, error } = await supabase.storage
    .from('condition-documents')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    return { url: null, error: error.message };
  }

  const { data: urlData } = supabase.storage
    .from('condition-documents')
    .getPublicUrl(data.path);

  return { url: urlData.publicUrl };
}

export async function uploadThumbnailToStorage(
  blob: Blob,
  path: string
): Promise<{ url: string | null; error?: string }> {
  const { data, error } = await supabase.storage
    .from('document-thumbnails')
    .upload(path, blob, {
      cacheControl: '3600',
      upsert: false,
      contentType: 'image/jpeg',
    });

  if (error) {
    return { url: null, error: error.message };
  }

  const { data: urlData } = supabase.storage
    .from('document-thumbnails')
    .getPublicUrl(data.path);

  return { url: urlData.publicUrl };
}

export async function generateImageThumbnail(file: File): Promise<Blob | null> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const canvas = document.createElement('canvas');
      canvas.width = THUMBNAIL_WIDTH;
      canvas.height = THUMBNAIL_HEIGHT;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(null);
        return;
      }

      const imgRatio = img.width / img.height;
      const thumbRatio = THUMBNAIL_WIDTH / THUMBNAIL_HEIGHT;

      let sourceX = 0;
      let sourceY = 0;
      let sourceWidth = img.width;
      let sourceHeight = img.height;

      if (imgRatio > thumbRatio) {
        sourceWidth = img.height * thumbRatio;
        sourceX = (img.width - sourceWidth) / 2;
      } else {
        sourceHeight = img.width / thumbRatio;
        sourceY = (img.height - sourceHeight) / 2;
      }

      ctx.drawImage(
        img,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        THUMBNAIL_WIDTH,
        THUMBNAIL_HEIGHT
      );

      canvas.toBlob(
        (blob) => resolve(blob),
        'image/jpeg',
        0.8
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };

    img.src = url;
  });
}

export interface PdfThumbnailResult {
  thumbnail: Blob | null;
  pageCount: number;
}

export async function generatePdfThumbnail(file: File): Promise<PdfThumbnailResult> {
  try {
    const pdfjsLib = await loadPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pageCount = pdf.numPages;
    const page = await pdf.getPage(1);

    const viewport = page.getViewport({ scale: 1 });
    const scale = Math.min(
      THUMBNAIL_WIDTH / viewport.width,
      THUMBNAIL_HEIGHT / viewport.height
    );
    const scaledViewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = THUMBNAIL_WIDTH;
    canvas.height = THUMBNAIL_HEIGHT;

    const ctx = canvas.getContext('2d');
    if (!ctx) return { thumbnail: null, pageCount };

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT);

    const offsetX = (THUMBNAIL_WIDTH - scaledViewport.width) / 2;
    const offsetY = (THUMBNAIL_HEIGHT - scaledViewport.height) / 2;

    ctx.translate(offsetX, offsetY);

    await page.render({
      canvasContext: ctx,
      viewport: scaledViewport,
    }).promise;

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => resolve({ thumbnail: blob, pageCount }),
        'image/jpeg',
        0.8
      );
    });
  } catch {
    return { thumbnail: null, pageCount: 1 };
  }
}

export interface ThumbnailResult {
  thumbnail: Blob | null;
  pageCount: number;
}

export async function generateThumbnailWithPageCount(file: File): Promise<ThumbnailResult> {
  if (IMAGE_MIME_TYPES.includes(file.type)) {
    const thumbnail = await generateImageThumbnail(file);
    return { thumbnail, pageCount: 1 };
  }

  if (file.type === PDF_MIME_TYPE) {
    return generatePdfThumbnail(file);
  }

  return { thumbnail: null, pageCount: 1 };
}

export interface CreateDocumentParams {
  conditionId: string | null;
  loanId: string;
  fileName: string;
  fileUrl: string;
  thumbnailUrl: string | null;
  fileSize: number;
  mimeType: string;
  originalFilename: string;
  pageCount: number;
  createdBy?: string;
}

export async function createDocumentRecord(
  params: CreateDocumentParams
): Promise<{ document: ConditionDocument | null; error?: string }> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('condition_documents')
    .insert({
      loan_id: params.loanId,
      document_name: params.fileName,
      document_type: null,
      description: null,
      expiration_date: null,
      status: 'Need to Review',
      file_url: params.fileUrl,
      thumbnail_url: params.thumbnailUrl,
      file_size: params.fileSize,
      mime_type: params.mimeType,
      original_filename: params.originalFilename,
      page_count: params.pageCount,
      created_by: params.createdBy || null,
      created_on: now,
    })
    .select()
    .single();

  if (error) {
    return { document: null, error: error.message };
  }

  if (params.conditionId && data) {
    await supabase.from('document_condition_associations').insert({
      document_id: data.id,
      condition_id: params.conditionId,
    });
  }

  return { document: data };
}

export async function deleteDocumentWithFile(
  documentId: string
): Promise<{ success: boolean; error?: string }> {
  const { data: doc, error: fetchError } = await supabase
    .from('condition_documents')
    .select('file_url, thumbnail_url')
    .eq('id', documentId)
    .maybeSingle();

  if (fetchError) {
    return { success: false, error: fetchError.message };
  }

  if (doc?.file_url) {
    const filePath = extractPathFromUrl(doc.file_url, 'condition-documents');
    if (filePath) {
      await supabase.storage.from('condition-documents').remove([filePath]);
    }
  }

  if (doc?.thumbnail_url) {
    const thumbPath = extractPathFromUrl(doc.thumbnail_url, 'document-thumbnails');
    if (thumbPath) {
      await supabase.storage.from('document-thumbnails').remove([thumbPath]);
    }
  }

  await supabase
    .from('document_condition_associations')
    .delete()
    .eq('document_id', documentId);

  const { error: deleteError } = await supabase
    .from('condition_documents')
    .delete()
    .eq('id', documentId);

  if (deleteError) {
    return { success: false, error: deleteError.message };
  }

  return { success: true };
}

function extractPathFromUrl(url: string, bucket: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split(`/storage/v1/object/public/${bucket}/`);
    return pathParts.length > 1 ? decodeURIComponent(pathParts[1]) : null;
  } catch {
    return null;
  }
}

export function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop() || '';
  const baseName = originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '_');
  return `${baseName}_${timestamp}_${random}.${extension}`;
}
