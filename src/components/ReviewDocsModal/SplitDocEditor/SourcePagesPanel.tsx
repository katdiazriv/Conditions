import { useEffect, useRef, useState, useCallback } from 'react';
import { loadPdfFromUrl, type PDFDocument } from '../../../utils/pdfLoader';

interface SourcePagesPanelProps {
  pdfUrl: string;
  totalPages: number;
  assignedPages: Set<number>;
}

const THUMBNAIL_WIDTH = 80;
const THUMBNAIL_HEIGHT = 104;

export function SourcePagesPanel({
  pdfUrl,
  totalPages,
  assignedPages,
}: SourcePagesPanelProps) {
  const [thumbnails, setThumbnails] = useState<Map<number, string>>(new Map());
  const [loadingPages, setLoadingPages] = useState<Set<number>>(new Set());
  const [draggingPages, setDraggingPages] = useState<Set<number>>(new Set());
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [actualPageCount, setActualPageCount] = useState<number>(totalPages);
  const pdfRef = useRef<PDFDocument | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const thumbnailsRef = useRef(thumbnails);
  const loadingRef = useRef(loadingPages);
  const lastClickedPageRef = useRef<number | null>(null);

  thumbnailsRef.current = thumbnails;
  loadingRef.current = loadingPages;

  const generateThumbnail = useCallback(async (pageNum: number, pdf: PDFDocument) => {
    if (thumbnailsRef.current.has(pageNum) || loadingRef.current.has(pageNum)) {
      return;
    }

    setLoadingPages((prev) => new Set(prev).add(pageNum));

    try {
      const page = await pdf.getPage(pageNum);
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
      if (!ctx) return;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT);

      const offsetX = (THUMBNAIL_WIDTH - scaledViewport.width) / 2;
      const offsetY = (THUMBNAIL_HEIGHT - scaledViewport.height) / 2;
      ctx.translate(offsetX, offsetY);

      await page.render({
        canvasContext: ctx,
        viewport: scaledViewport,
      }).promise;

      const dataUrl = canvas.toDataURL('image/jpeg', 0.7);

      setThumbnails((prev) => new Map(prev).set(pageNum, dataUrl));
    } catch {
    } finally {
      setLoadingPages((prev) => {
        const next = new Set(prev);
        next.delete(pageNum);
        return next;
      });
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadPdf() {
      try {
        const pdf = await loadPdfFromUrl(pdfUrl);
        if (cancelled) return;
        pdfRef.current = pdf;
        setActualPageCount(pdf.numPages);

        const initialPages = Math.min(8, pdf.numPages);
        for (let i = 1; i <= initialPages; i++) {
          if (!assignedPages.has(i)) {
            generateThumbnail(i, pdf);
          }
        }
      } catch {
      }
    }

    loadPdf();

    return () => {
      cancelled = true;
    };
  }, [pdfUrl, assignedPages, generateThumbnail]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function handleScroll() {
      const pdf = pdfRef.current;
      if (!container || !pdf) return;

      const containerRect = container.getBoundingClientRect();
      const items = container.querySelectorAll('[data-page]');

      items.forEach((item) => {
        const pageNum = parseInt(item.getAttribute('data-page') || '0', 10);
        if (pageNum === 0 || assignedPages.has(pageNum)) return;

        const rect = item.getBoundingClientRect();
        const isVisible =
          rect.top < containerRect.bottom + 100 &&
          rect.bottom > containerRect.top - 100;

        if (isVisible && !thumbnailsRef.current.has(pageNum)) {
          generateThumbnail(pageNum, pdf);
        }
      });
    }

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [assignedPages, generateThumbnail]);

  useEffect(() => {
    setSelectedPages(new Set());
    lastClickedPageRef.current = null;
  }, [pdfUrl]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && selectedPages.size > 0) {
        setSelectedPages(new Set());
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedPages.size]);

  const handlePageClick = useCallback((e: React.MouseEvent, pageNum: number, unassignedPages: number[]) => {
    e.stopPropagation();

    if (e.shiftKey && lastClickedPageRef.current !== null) {
      const anchor = lastClickedPageRef.current;
      const start = Math.min(anchor, pageNum);
      const end = Math.max(anchor, pageNum);
      const rangePages = unassignedPages.filter(p => p >= start && p <= end);
      setSelectedPages(new Set(rangePages));
    } else if (e.metaKey || e.ctrlKey) {
      setSelectedPages(prev => {
        const next = new Set(prev);
        if (next.has(pageNum)) {
          next.delete(pageNum);
        } else {
          next.add(pageNum);
        }
        return next;
      });
      lastClickedPageRef.current = pageNum;
    } else {
      setSelectedPages(new Set([pageNum]));
      lastClickedPageRef.current = pageNum;
    }
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent, pageNum: number) => {
    let pagesToDrag: number[];

    if (selectedPages.has(pageNum)) {
      pagesToDrag = Array.from(selectedPages).sort((a, b) => a - b);
    } else {
      setSelectedPages(new Set([pageNum]));
      pagesToDrag = [pageNum];
    }

    e.dataTransfer.setData('text/page-number', String(pagesToDrag[0]));
    e.dataTransfer.setData('text/page-numbers', JSON.stringify(pagesToDrag));
    e.dataTransfer.effectAllowed = 'move';
    setDraggingPages(new Set(pagesToDrag));

    const dragImage = document.createElement('div');
    dragImage.className = 'bg-white border-2 border-cmg-teal rounded shadow-lg p-2 text-xs font-medium';
    if (pagesToDrag.length > 1) {
      dragImage.textContent = `${pagesToDrag.length} pages`;
    } else {
      dragImage.textContent = `Page ${pageNum}`;
    }
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 30, 15);

    requestAnimationFrame(() => {
      document.body.removeChild(dragImage);
    });
  }, [selectedPages]);

  const handleDragEnd = useCallback(() => {
    setDraggingPages(new Set());
  }, []);

  const unassignedPages: number[] = [];
  for (let i = 1; i <= actualPageCount; i++) {
    if (!assignedPages.has(i)) {
      unassignedPages.push(i);
    }
  }

  const selectedCount = selectedPages.size;

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="px-3 py-2 bg-white">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-600">
            Source Pages ({unassignedPages.length} remaining)
          </span>
          {selectedCount > 0 && (
            <span className="text-xs font-medium text-cmg-teal">
              {selectedCount} selected
            </span>
          )}
        </div>
        <p className="text-[10px] text-gray-400 mt-1">
          Shift+click for range, Ctrl+click for multiple. Drag to split.
        </p>
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-3"
        onClick={() => setSelectedPages(new Set())}
      >
        {unassignedPages.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-xs text-gray-400 text-center">
            All pages have been assigned to documents
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {unassignedPages.map((pageNum) => {
              const thumbnailUrl = thumbnails.get(pageNum);
              const isLoading = loadingPages.has(pageNum);
              const isDragging = draggingPages.has(pageNum);
              const isSelected = selectedPages.has(pageNum);

              return (
                <div
                  key={pageNum}
                  data-page={pageNum}
                  tabIndex={0}
                  draggable
                  onClick={(e) => handlePageClick(e, pageNum, unassignedPages)}
                  onDragStart={(e) => handleDragStart(e, pageNum)}
                  onDragEnd={handleDragEnd}
                  className={`
                    rounded overflow-hidden border-2 cursor-grab active:cursor-grabbing
                    transition-all outline-none focus:ring-2 focus:ring-cmg-teal/50 shadow-md
                    ${isDragging ? 'opacity-50 border-cmg-teal bg-cmg-teal/10' : ''}
                    ${isSelected && !isDragging ? 'border-cmg-teal bg-cmg-teal/10' : ''}
                    ${!isSelected && !isDragging ? 'border-transparent bg-white hover:border-cmg-teal/50' : ''}
                  `}
                >
                  <div
                    className="relative bg-gray-100"
                    style={{ width: THUMBNAIL_WIDTH, height: THUMBNAIL_HEIGHT }}
                  >
                    {thumbnailUrl ? (
                      <img
                        src={thumbnailUrl}
                        alt={`Page ${pageNum}`}
                        className="w-full h-full object-cover"
                        draggable={false}
                      />
                    ) : isLoading ? (
                      <div className="absolute inset-0 bg-gray-200 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs text-gray-400">{pageNum}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-white">
                        <span className="text-xs text-gray-400">{pageNum}</span>
                      </div>
                    )}
                    <div className={`absolute bottom-0 left-0 right-0 text-white text-[9px] text-center py-0.5 ${isSelected ? 'bg-cmg-teal' : 'bg-black/60'}`}>
                      {pageNum}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
