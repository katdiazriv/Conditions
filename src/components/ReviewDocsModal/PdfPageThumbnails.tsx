import { useEffect, useRef, useState } from 'react';
import { loadPdfFromUrl, type PDFDocument } from '../../utils/pdfLoader';

interface PdfPageThumbnailsProps {
  pdfUrl: string;
  totalPages: number;
  currentPage: number;
  onPageSelect: (page: number) => void;
  pageNumbers?: number[];
  useSequentialLabels?: boolean;
}

const THUMBNAIL_WIDTH = 72;
const THUMBNAIL_HEIGHT = 96;

const thumbnailCache = new Map<string, Map<number, string>>();

function ThumbnailSkeleton({ pageNum }: { pageNum: number }) {
  return (
    <div className="absolute inset-0 bg-gray-200 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs text-gray-400">{pageNum}</span>
      </div>
    </div>
  );
}

export function PdfPageThumbnails({
  pdfUrl,
  totalPages,
  currentPage,
  onPageSelect,
  pageNumbers,
  useSequentialLabels = false,
}: PdfPageThumbnailsProps) {
  const pagesToRender = pageNumbers ?? Array.from({ length: totalPages }, (_, i) => i + 1);
  const [thumbnails, setThumbnails] = useState<Map<number, string>>(() => {
    return thumbnailCache.get(pdfUrl) ?? new Map();
  });
  const [loadingPages, setLoadingPages] = useState<Set<number>>(new Set());
  const pdfRef = useRef<PDFDocument | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentUrlRef = useRef(pdfUrl);
  const thumbnailsRef = useRef(thumbnails);
  const loadingPagesRef = useRef(loadingPages);

  thumbnailsRef.current = thumbnails;
  loadingPagesRef.current = loadingPages;

  useEffect(() => {
    if (currentUrlRef.current !== pdfUrl) {
      currentUrlRef.current = pdfUrl;
      pdfRef.current = null;

      const cached = thumbnailCache.get(pdfUrl);
      if (cached) {
        setThumbnails(new Map(cached));
      } else {
        setThumbnails(new Map());
      }
      setLoadingPages(new Set());
    }
  }, [pdfUrl]);

  async function generateThumbnail(pageNum: number, pdf: PDFDocument, url: string) {
    if (thumbnailsRef.current.has(pageNum) || loadingPagesRef.current.has(pageNum)) {
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

      const context = canvas.getContext('2d');
      if (!context) return;

      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT);

      const offsetX = (THUMBNAIL_WIDTH - scaledViewport.width) / 2;
      const offsetY = (THUMBNAIL_HEIGHT - scaledViewport.height) / 2;

      context.translate(offsetX, offsetY);

      await page.render({
        canvasContext: context,
        viewport: scaledViewport,
      }).promise;

      if (currentUrlRef.current !== url) return;

      const dataUrl = canvas.toDataURL('image/jpeg', 0.7);

      setThumbnails((prev) => {
        const next = new Map(prev).set(pageNum, dataUrl);
        thumbnailCache.set(url, next);
        return next;
      });
    } catch {
    } finally {
      if (currentUrlRef.current === url) {
        setLoadingPages((prev) => {
          const next = new Set(prev);
          next.delete(pageNum);
          return next;
        });
      }
    }
  }

  useEffect(() => {
    let cancelled = false;
    const url = pdfUrl;

    async function loadPdf() {
      if (!url) return;

      try {
        const pdf = await loadPdfFromUrl(url);
        if (cancelled || currentUrlRef.current !== url) return;
        pdfRef.current = pdf;

        const pages = pageNumbers ?? Array.from({ length: totalPages }, (_, i) => i + 1);
        const initialPages = pages.slice(0, 5);
        for (const pageNum of initialPages) {
          generateThumbnail(pageNum, pdf, url);
        }
      } catch {
      }
    }

    loadPdf();

    return () => {
      cancelled = true;
    };
  }, [pdfUrl, totalPages, pageNumbers]);

  useEffect(() => {
    const pdf = pdfRef.current;
    const actualPage = useSequentialLabels && pageNumbers
      ? pageNumbers[currentPage - 1]
      : currentPage;
    if (pdf && actualPage && !thumbnailsRef.current.has(actualPage)) {
      generateThumbnail(actualPage, pdf, pdfUrl);
    }
  }, [currentPage, pdfUrl, useSequentialLabels, pageNumbers]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function handleScroll() {
      const pdf = pdfRef.current;
      if (!container || !pdf) return;

      const containerRect = container.getBoundingClientRect();
      const buttons = container.querySelectorAll('[data-page]');

      buttons.forEach((button) => {
        const pageNum = parseInt(button.getAttribute('data-page') || '0', 10);
        if (pageNum === 0) return;

        const rect = button.getBoundingClientRect();
        const isVisible =
          rect.top < containerRect.bottom + 100 &&
          rect.bottom > containerRect.top - 100;

        if (isVisible && !thumbnailsRef.current.has(pageNum)) {
          generateThumbnail(pageNum, pdf, pdfUrl);
        }
      });
    }

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [pdfUrl]);

  return (
    <div
      ref={containerRef}
      className="flex-1 p-2 overflow-y-auto"
    >
      {pagesToRender.map((actualPageNum, idx) => {
        const displayNum = useSequentialLabels ? idx + 1 : actualPageNum;
        const thumbnailUrl = thumbnails.get(actualPageNum);
        const isLoading = loadingPages.has(actualPageNum);
        const isSelected = useSequentialLabels ? currentPage === idx + 1 : currentPage === actualPageNum;

        return (
          <button
            key={`${actualPageNum}-${idx}`}
            data-page={actualPageNum}
            onClick={() => onPageSelect(useSequentialLabels ? idx + 1 : actualPageNum)}
            className={`
              w-full mb-2 rounded overflow-hidden border-2 transition-all shadow-md
              ${isSelected ? 'border-cmg-teal' : 'border-transparent hover:border-gray-300'}
            `}
          >
            <div className="relative bg-gray-100" style={{ aspectRatio: '3/4' }}>
              {thumbnailUrl ? (
                <img
                  src={thumbnailUrl}
                  alt={`Page ${displayNum}`}
                  className="w-full h-full object-cover"
                />
              ) : isLoading ? (
                <ThumbnailSkeleton pageNum={displayNum} />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-white">
                  <span className="text-xs text-gray-400">{displayNum}</span>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] text-center py-0.5">
                {displayNum}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
