import { useEffect, useRef, useState } from 'react';
import { Loader2, AlertCircle, RotateCcw, Download } from 'lucide-react';
import { loadPdfFromUrl, type PDFDocument, type PDFPage } from '../../utils/pdfLoader';

interface PdfCanvasRendererProps {
  pdfUrl: string;
  pageNumber: number;
  scale: number;
  onPdfLoaded?: (pdf: PDFDocument) => void;
  onError?: (error: Error) => void;
}

export function PdfCanvasRenderer({
  pdfUrl,
  pageNumber,
  scale,
  onPdfLoaded,
  onError,
}: PdfCanvasRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const renderTaskRef = useRef<{ cancel?: () => void } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function renderPage() {
      if (!pdfUrl) return;

      setLoading(true);
      setError(null);

      try {
        const pdf = await loadPdfFromUrl(pdfUrl);

        if (cancelled) return;

        if (onPdfLoaded) {
          onPdfLoaded(pdf);
        }

        const validPageNumber = Math.min(Math.max(1, pageNumber), pdf.numPages);
        const page: PDFPage = await pdf.getPage(validPageNumber);

        if (cancelled) return;

        const viewport = page.getViewport({ scale: scale / 100 });
        const canvas = canvasRef.current;

        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) {
          throw new Error('Failed to get canvas context');
        }

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext = {
          canvasContext: context,
          viewport,
        };

        if (renderTaskRef.current?.cancel) {
          renderTaskRef.current.cancel();
        }

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask as unknown as { cancel?: () => void };

        await renderTask.promise;

        if (cancelled) return;

        setLoading(false);
      } catch (err) {
        if (cancelled) return;

        const errorMessage = err instanceof Error ? err.message : 'Failed to load PDF';
        setError(errorMessage);
        setLoading(false);

        if (onError && err instanceof Error) {
          onError(err);
        }
      }
    }

    renderPage();

    return () => {
      cancelled = true;
      if (renderTaskRef.current?.cancel) {
        renderTaskRef.current.cancel();
      }
    };
  }, [pdfUrl, pageNumber, scale, retryCount, onPdfLoaded, onError]);

  function handleRetry() {
    setRetryCount((prev) => prev + 1);
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center bg-white shadow-lg rounded-lg p-8 min-h-[400px]">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-gray-700 font-medium mb-2">Failed to load document</p>
        <p className="text-sm text-gray-500 mb-4 text-center max-w-xs">{error}</p>
        <div className="flex gap-3">
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 px-4 py-2 bg-cmg-teal text-white rounded-lg hover:bg-cmg-teal-dark transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Retry
          </button>
          <a
            href={pdfUrl}
            download
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-white shadow-lg">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
          <Loader2 className="w-8 h-8 text-cmg-teal animate-spin" />
        </div>
      )}
      <canvas
        ref={canvasRef}
        className={loading ? 'opacity-0' : 'opacity-100 transition-opacity duration-200'}
      />
    </div>
  );
}
