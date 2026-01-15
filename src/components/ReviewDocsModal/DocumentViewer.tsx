import { useState, useCallback } from 'react';
import {
  Scissors,
  Combine,
  ChevronUp,
  ChevronDown,
  RotateCw,
  Trash2,
  Minus,
  Plus,
  MessageSquare,
  ArrowUpRight,
  X,
  FileText,
  Check,
  ArrowLeft,
} from 'lucide-react';
import type { DocumentForReview } from '../../hooks/useReviewDocsWizard';
import { PdfCanvasRenderer } from './PdfCanvasRenderer';
import { PdfPageThumbnails } from './PdfPageThumbnails';
import type { PDFDocument } from '../../utils/pdfLoader';

interface DocumentViewerProps {
  document: DocumentForReview | null;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageCountUpdate?: (count: number) => void;
  reviewState?: 'pending' | 'accepted' | 'rejected';
  onSplitClick?: () => void;
  isPreviewMode?: boolean;
  onBackClick?: () => void;
  previewPages?: number[];
}

export function DocumentViewer({
  document,
  currentPage,
  totalPages,
  onPageChange,
  onPageCountUpdate,
  reviewState = 'pending',
  onSplitClick,
  isPreviewMode = false,
  onBackClick,
  previewPages,
}: DocumentViewerProps) {
  const [zoom, setZoom] = useState(100);

  const actualPageNumber = isPreviewMode && previewPages
    ? previewPages[currentPage - 1]
    : currentPage;

  const handlePdfLoaded = useCallback((pdf: PDFDocument) => {
    if (onPageCountUpdate && pdf.numPages !== totalPages) {
      onPageCountUpdate(pdf.numPages);
    }
  }, [onPageCountUpdate, totalPages]);

  if (!document) return null;

  function handlePrevPage() {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  }

  function handleNextPage() {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  }

  function handleZoomOut() {
    setZoom((prev) => Math.max(25, prev - 25));
  }

  function handleZoomIn() {
    setZoom((prev) => Math.min(200, prev + 25));
  }

  const hasRealFile = !!document.file_url;

  function renderDocumentContent() {
    if (!hasRealFile) {
      return (
        <div className="flex flex-col items-center justify-center bg-white shadow-lg rounded-lg p-8 min-h-[400px]">
          <FileText className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">No document uploaded</p>
          <p className="text-sm text-gray-400 mt-1">Upload a document to preview it here</p>
        </div>
      );
    }

    return (
      <PdfCanvasRenderer
        pdfUrl={document!.file_url!}
        pageNumber={actualPageNumber}
        scale={zoom}
        onPdfLoaded={isPreviewMode ? undefined : handlePdfLoaded}
      />
    );
  }

  function renderThumbnails() {
    if (!hasRealFile) {
      return (
        <div className="flex-1 p-2 flex items-center justify-center">
          <p className="text-xs text-gray-400 text-center">No pages</p>
        </div>
      );
    }

    return (
      <PdfPageThumbnails
        pdfUrl={document!.file_url!}
        totalPages={totalPages}
        currentPage={currentPage}
        onPageSelect={onPageChange}
        pageNumbers={isPreviewMode ? previewPages : undefined}
        useSequentialLabels={isPreviewMode}
      />
    );
  }

  function renderStatusBanner() {
    if (reviewState === 'accepted') {
      return (
        <div className="bg-green-50 border-b border-green-200 px-4 py-2 flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
            <Check className="w-3 h-3 text-white" strokeWidth={3} />
          </div>
          <span className="text-sm font-medium text-green-700">Document Accepted</span>
        </div>
      );
    }
    if (reviewState === 'rejected') {
      return (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
            <X className="w-3 h-3 text-white" strokeWidth={3} />
          </div>
          <span className="text-sm font-medium text-red-700">Document Rejected</span>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="flex-1 flex">
      <div className="w-24 bg-gray-100 border-r border-gray-200 flex flex-col">
        <div className="px-3 py-2 border-b border-gray-200">
          <span className="text-xs font-medium text-gray-600">Pages</span>
        </div>
        {renderThumbnails()}
      </div>

      <div className="flex-1 flex flex-col">
        <div className="bg-gray-100 border-b border-gray-200 px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {isPreviewMode ? (
                <button
                  onClick={onBackClick}
                  className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-teal-600 hover:text-teal-700 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={onSplitClick}
                    disabled={!hasRealFile || !onSplitClick}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Scissors className="w-3.5 h-3.5" />
                    <span>Split</span>
                  </button>

                  <button className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors">
                    <Combine className="w-3.5 h-3.5" />
                    <span>Merge</span>
                  </button>
                </>
              )}

              <div className="flex items-center gap-1 border-l border-r border-gray-200 px-3 mx-2">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 transition-colors"
                >
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                </button>
                <span className="text-xs text-gray-600 min-w-[40px] text-center">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 transition-colors"
                >
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <button className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors">
                <RotateCw className="w-3.5 h-3.5" />
                <span>Rotate</span>
              </button>

              {!isPreviewMode && (
                <div className="border-l border-gray-200 pl-2 ml-2">
                  <button className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Page</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleZoomOut}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <Minus className="w-4 h-4 text-gray-500" />
              </button>
              <select
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="text-xs text-gray-600 border border-gray-200 rounded px-2 py-1 bg-white"
              >
                <option value={25}>25%</option>
                <option value={50}>50%</option>
                <option value={75}>75%</option>
                <option value={100}>100%</option>
                <option value={125}>125%</option>
                <option value={150}>150%</option>
                <option value={200}>200%</option>
              </select>
              <button
                onClick={handleZoomIn}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <Plus className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        {!isPreviewMode && (
          <div className="bg-gray-100 border-b border-gray-200 px-4 py-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium text-gray-500">General:</span>
                <button className="p-1.5 hover:bg-gray-200 rounded transition-colors">
                  <MessageSquare className="w-4 h-4 text-gray-600" />
                </button>
                <button className="p-1.5 hover:bg-gray-200 rounded transition-colors">
                  <ArrowUpRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium text-gray-500">Internal:</span>
                <button className="p-1.5 hover:bg-gray-200 rounded transition-colors">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                </button>
                <button className="p-1.5 hover:bg-gray-200 rounded transition-colors">
                  <ArrowUpRight className="w-4 h-4 text-blue-600" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium text-gray-500">Burned on Save:</span>
                <button className="p-1.5 hover:bg-gray-200 rounded transition-colors">
                  <MessageSquare className="w-4 h-4 text-orange-600" />
                </button>
                <button className="p-1.5 hover:bg-gray-200 rounded transition-colors">
                  <ArrowUpRight className="w-4 h-4 text-orange-600" />
                </button>
                <button className="p-1.5 hover:bg-gray-200 rounded transition-colors">
                  <div className="w-4 h-4 border-2 border-orange-600 rounded" />
                </button>
              </div>

              <button className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:bg-gray-200 rounded transition-colors ml-auto">
                <X className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        )}

        {renderStatusBanner()}

        <div className="flex-1 bg-gray-200 overflow-auto p-4 flex items-start justify-center">
          {renderDocumentContent()}
        </div>
      </div>
    </div>
  );
}
