import { PDFDocument } from 'pdf-lib';
import { supabase } from '../lib/supabase';
import {
  uploadFileToStorage,
  uploadThumbnailToStorage,
  generateUniqueFilename,
  THUMBNAIL_WIDTH,
  THUMBNAIL_HEIGHT,
} from './fileUploadService';
import { loadPdfJs } from '../utils/pdfLoader';
import type { ConditionDocument } from '../types/conditions';

export interface SplitDocumentData {
  id: string;
  documentName: string;
  documentType: string | null;
  pages: number[];
  conditionIds: string[];
}

export interface ProcessSplitResult {
  success: boolean;
  createdDocuments: ConditionDocument[];
  errors: string[];
}

export async function fetchPdfAsArrayBuffer(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch PDF: ${response.statusText}`);
  }
  return response.arrayBuffer();
}

export async function extractPagesFromPdf(
  pdfBytes: ArrayBuffer,
  pageNumbers: number[]
): Promise<Uint8Array> {
  const sourcePdf = await PDFDocument.load(pdfBytes);
  const newPdf = await PDFDocument.create();

  const pageIndices = pageNumbers.map((p) => p - 1);
  const copiedPages = await newPdf.copyPages(sourcePdf, pageIndices);

  copiedPages.forEach((page) => {
    newPdf.addPage(page);
  });

  return newPdf.save();
}

async function generateThumbnailFromPdfBytes(pdfBytes: Uint8Array): Promise<Blob | null> {
  try {
    const pdfjsLib = await loadPdfJs();
    const pdf = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
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
    if (!ctx) return null;

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
        (blob) => resolve(blob),
        'image/jpeg',
        0.8
      );
    });
  } catch {
    return null;
  }
}

async function uploadSplitDocument(
  pdfBytes: Uint8Array,
  filename: string,
  loanId: string
): Promise<{ fileUrl: string | null; thumbnailUrl: string | null; error?: string }> {
  const uniqueFilename = generateUniqueFilename(filename);
  const storagePath = `${loanId}/${uniqueFilename}`;

  const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
  const pdfFile = new File([pdfBlob], uniqueFilename, { type: 'application/pdf' });

  const { url: fileUrl, error: uploadError } = await uploadFileToStorage(pdfFile, storagePath);

  if (uploadError || !fileUrl) {
    return { fileUrl: null, thumbnailUrl: null, error: uploadError };
  }

  const thumbnailBlob = await generateThumbnailFromPdfBytes(pdfBytes);
  let thumbnailUrl: string | null = null;

  if (thumbnailBlob) {
    const thumbPath = `${loanId}/${uniqueFilename.replace('.pdf', '_thumb.jpg')}`;
    const { url } = await uploadThumbnailToStorage(thumbnailBlob, thumbPath);
    thumbnailUrl = url;
  }

  return { fileUrl, thumbnailUrl };
}

async function createSplitDocumentRecord(
  params: {
    loanId: string;
    parentDocumentId: string;
    documentName: string;
    documentType: string | null;
    fileUrl: string;
    thumbnailUrl: string | null;
    fileSize: number;
    pageCount: number;
    sourcePages: number[];
    conditionIds: string[];
  }
): Promise<{ document: ConditionDocument | null; error?: string }> {
  const { data, error } = await supabase
    .from('condition_documents')
    .insert({
      loan_id: params.loanId,
      parent_document_id: params.parentDocumentId,
      document_name: params.documentName,
      document_type: params.documentType,
      description: null,
      expiration_date: null,
      status: 'Need to Review',
      file_url: params.fileUrl,
      thumbnail_url: params.thumbnailUrl,
      file_size: params.fileSize,
      mime_type: 'application/pdf',
      original_filename: `${params.documentName}.pdf`,
      page_count: params.pageCount,
      source_pages: JSON.stringify(params.sourcePages),
    })
    .select()
    .single();

  if (error) {
    return { document: null, error: error.message };
  }

  if (data && params.conditionIds.length > 0) {
    const associations = params.conditionIds.map((conditionId) => ({
      document_id: data.id,
      condition_id: conditionId,
    }));

    await supabase.from('document_condition_associations').insert(associations);
  }

  return { document: data };
}

export async function processSplitDocuments(
  sourceDocument: { id: string; file_url: string; loan_id: string; document_name: string; document_type: string | null },
  splits: SplitDocumentData[],
  keepOriginalDocument: boolean
): Promise<ProcessSplitResult> {
  const result: ProcessSplitResult = {
    success: true,
    createdDocuments: [],
    errors: [],
  };

  if (!sourceDocument.file_url) {
    return { success: false, createdDocuments: [], errors: ['Source document has no file'] };
  }

  let sourcePdfBytes: ArrayBuffer;
  try {
    sourcePdfBytes = await fetchPdfAsArrayBuffer(sourceDocument.file_url);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch source PDF';
    return { success: false, createdDocuments: [], errors: [message] };
  }

  const allAssignedPages = new Set<number>();
  splits.forEach((split) => {
    split.pages.forEach((page) => allAssignedPages.add(page));
  });

  const sourcePdf = await PDFDocument.load(sourcePdfBytes);
  const totalPages = sourcePdf.getPageCount();

  const orphanedPages: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (!allAssignedPages.has(i)) {
      orphanedPages.push(i);
    }
  }

  const allSplits = [...splits];

  if (orphanedPages.length > 0) {
    allSplits.push({
      id: `orphaned-${Date.now()}`,
      documentName: `${sourceDocument.document_name} - orphaned pages`,
      documentType: sourceDocument.document_type,
      pages: orphanedPages,
      conditionIds: [],
    });
  }

  for (const split of allSplits) {
    if (split.pages.length === 0) continue;

    try {
      const splitPdfBytes = await extractPagesFromPdf(sourcePdfBytes, split.pages);

      const { fileUrl, thumbnailUrl, error: uploadError } = await uploadSplitDocument(
        splitPdfBytes,
        `${split.documentName}.pdf`,
        sourceDocument.loan_id
      );

      if (uploadError || !fileUrl) {
        result.errors.push(`Failed to upload split document "${split.documentName}": ${uploadError}`);
        result.success = false;
        continue;
      }

      const { document, error: createError } = await createSplitDocumentRecord({
        loanId: sourceDocument.loan_id,
        parentDocumentId: sourceDocument.id,
        documentName: split.documentName,
        documentType: split.documentType,
        fileUrl,
        thumbnailUrl,
        fileSize: splitPdfBytes.length,
        pageCount: split.pages.length,
        sourcePages: split.pages,
        conditionIds: split.conditionIds,
      });

      if (createError || !document) {
        result.errors.push(`Failed to create record for "${split.documentName}": ${createError}`);
        result.success = false;
        continue;
      }

      result.createdDocuments.push(document);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      result.errors.push(`Error processing split "${split.documentName}": ${message}`);
      result.success = false;
    }
  }

  if (result.createdDocuments.length > 0) {
    if (keepOriginalDocument) {
      await supabase
        .from('condition_documents')
        .update({ status: 'Inactive' })
        .eq('id', sourceDocument.id);

      await supabase
        .from('document_condition_associations')
        .delete()
        .eq('document_id', sourceDocument.id);
    } else {
      const { data: doc } = await supabase
        .from('condition_documents')
        .select('file_url, thumbnail_url')
        .eq('id', sourceDocument.id)
        .maybeSingle();

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
        .eq('document_id', sourceDocument.id);

      await supabase
        .from('condition_documents')
        .delete()
        .eq('id', sourceDocument.id);
    }
  }

  return result;
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

export function formatPagesDisplay(pages: number[]): string {
  if (pages.length === 0) return '';

  const sorted = [...pages].sort((a, b) => a - b);
  const ranges: string[] = [];

  let rangeStart = sorted[0];
  let rangeEnd = sorted[0];

  for (let i = 1; i <= sorted.length; i++) {
    const current = sorted[i];

    if (current === rangeEnd + 1) {
      rangeEnd = current;
    } else {
      if (rangeStart === rangeEnd) {
        ranges.push(String(rangeStart));
      } else {
        ranges.push(`${rangeStart}-${rangeEnd}`);
      }
      rangeStart = current;
      rangeEnd = current;
    }
  }

  return ranges.join(', ');
}
