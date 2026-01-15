import { useState, useCallback, useRef, useEffect } from 'react';
import { Upload } from 'lucide-react';
import { loadPdfFromUrl } from '../../../utils/pdfLoader';

interface PageDropZoneProps {
  pages: number[];
  pdfUrl: string;
  onDrop: (pageNum: number) => void;
  onRemovePage: (pageNum: number) => void;
  onReorder: (newPages: number[]) => void;
}

const MINI_THUMB_SIZE = 56;

export function PageDropZone({
  pages,
  pdfUrl,
  onDrop,
  onRemovePage,
  onReorder,
}: PageDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [thumbnails, setThumbnails] = useState<Map<number, string>>(new Map());
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pages.length === 0) return;

    async function loadThumbnails() {
      try {
        const pdf = await loadPdfFromUrl(pdfUrl);

        for (const pageNum of pages) {
          if (thumbnails.has(pageNum)) continue;

          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1 });
          const scale = Math.min(
            MINI_THUMB_SIZE / viewport.width,
            MINI_THUMB_SIZE / viewport.height
          );
          const scaledViewport = page.getViewport({ scale });

          const canvas = document.createElement('canvas');
          canvas.width = MINI_THUMB_SIZE;
          canvas.height = MINI_THUMB_SIZE;

          const ctx = canvas.getContext('2d');
          if (!ctx) continue;

          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, MINI_THUMB_SIZE, MINI_THUMB_SIZE);

          const offsetX = (MINI_THUMB_SIZE - scaledViewport.width) / 2;
          const offsetY = (MINI_THUMB_SIZE - scaledViewport.height) / 2;
          ctx.translate(offsetX, offsetY);

          await page.render({
            canvasContext: ctx,
            viewport: scaledViewport,
          }).promise;

          const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
          setThumbnails((prev) => new Map(prev).set(pageNum, dataUrl));
        }
      } catch {
      }
    }

    loadThumbnails();
  }, [pages, pdfUrl, thumbnails]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
      setDropIndex(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setDropIndex(null);

    const pageNumsJson = e.dataTransfer.getData('text/page-numbers');
    const pageNum = e.dataTransfer.getData('text/page-number');
    const sourceSplitId = e.dataTransfer.getData('text/split-id');

    if (sourceSplitId && draggedIndex !== null && pageNum) {
      const newPages = [...pages];
      const insertAt = dropIndex !== null ? dropIndex : newPages.length;
      newPages.splice(draggedIndex, 1);
      newPages.splice(insertAt > draggedIndex ? insertAt - 1 : insertAt, 0, parseInt(pageNum, 10));
      onReorder(newPages);
    } else if (pageNumsJson) {
      try {
        const pageNums: number[] = JSON.parse(pageNumsJson);
        pageNums.forEach(num => onDrop(num));
      } catch {
        if (pageNum) {
          onDrop(parseInt(pageNum, 10));
        }
      }
    } else if (pageNum) {
      onDrop(parseInt(pageNum, 10));
    }

    setDraggedIndex(null);
  }, [onDrop, onReorder, pages, draggedIndex, dropIndex]);

  const handleThumbDragStart = useCallback((e: React.DragEvent, pageNum: number, index: number) => {
    e.dataTransfer.setData('text/page-number', String(pageNum));
    e.dataTransfer.setData('text/split-id', 'reorder');
    e.dataTransfer.effectAllowed = 'move';
    setDraggedIndex(index);
  }, []);

  const handleThumbDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDropIndex(index);
  }, []);

  const handleThumbDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDropIndex(null);
  }, []);

  const handleThumbDoubleClick = useCallback((pageNum: number) => {
    onRemovePage(pageNum);
  }, [onRemovePage]);

  if (pages.length === 0) {
    return (
      <div
        ref={containerRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${isDragOver ? 'border-cmg-teal bg-cmg-teal/5' : 'border-gray-300 bg-gray-50'}
        `}
      >
        <Upload className={`w-8 h-8 mx-auto mb-2 ${isDragOver ? 'text-cmg-teal' : 'text-gray-400'}`} />
        <p className={`text-xs ${isDragOver ? 'text-cmg-teal' : 'text-gray-500'}`}>
          Select pages from the lefthand side then drag and drop here
        </p>
        <p className="text-[10px] text-gray-400 mt-1">Max File Limit 70 MB</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        border-2 rounded-lg p-3 transition-colors min-h-[120px]
        ${isDragOver ? 'border-cmg-teal border-dashed bg-cmg-teal/5' : 'border-gray-200 bg-gray-50'}
      `}
    >
      <div className="flex flex-wrap gap-2">
        {pages.map((pageNum, index) => (
          <div
            key={pageNum}
            draggable
            onDragStart={(e) => handleThumbDragStart(e, pageNum, index)}
            onDragOver={(e) => handleThumbDragOver(e, index)}
            onDragEnd={handleThumbDragEnd}
            onDoubleClick={() => handleThumbDoubleClick(pageNum)}
            className={`
              relative cursor-move rounded overflow-hidden border transition-all
              ${draggedIndex === index ? 'opacity-50' : ''}
              ${dropIndex === index ? 'border-cmg-teal border-2' : 'border-gray-300'}
              hover:border-cmg-teal
            `}
            style={{ width: MINI_THUMB_SIZE, height: MINI_THUMB_SIZE + 16 }}
            title="Double-click to remove"
          >
            <div
              className="bg-white flex items-center justify-center"
              style={{ width: MINI_THUMB_SIZE, height: MINI_THUMB_SIZE }}
            >
              {thumbnails.has(pageNum) ? (
                <img
                  src={thumbnails.get(pageNum)}
                  alt={`Page ${pageNum}`}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              ) : (
                <span className="text-xs text-gray-400">{pageNum}</span>
              )}
            </div>
            <div className="bg-gray-700 text-white text-[9px] text-center py-0.5">
              {pageNum}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
