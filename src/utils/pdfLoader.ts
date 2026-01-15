const PDF_JS_VERSION = '3.11.174';
const PDF_JS_CDN_BASE = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDF_JS_VERSION}`;

interface PDFJSLib {
  getDocument: (params: { data: ArrayBuffer } | { url: string }) => { promise: Promise<PDFDocument> };
  GlobalWorkerOptions: { workerSrc: string };
}

export interface PDFDocument {
  numPages: number;
  getPage: (pageNum: number) => Promise<PDFPage>;
}

export interface PDFPage {
  getViewport: (params: { scale: number }) => PDFViewport;
  render: (params: { canvasContext: CanvasRenderingContext2D; viewport: PDFViewport }) => { promise: Promise<void> };
}

export interface PDFViewport {
  width: number;
  height: number;
}

let pdfjsLibInstance: PDFJSLib | null = null;
let loadingPromise: Promise<PDFJSLib> | null = null;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${src}"]`);
    if (existingScript) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

export async function loadPdfJs(): Promise<PDFJSLib> {
  if (pdfjsLibInstance) {
    return pdfjsLibInstance;
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = (async () => {
    await loadScript(`${PDF_JS_CDN_BASE}/pdf.min.js`);

    const pdfjs = (window as unknown as { pdfjsLib: PDFJSLib }).pdfjsLib;
    if (!pdfjs) {
      throw new Error('PDF.js failed to initialize');
    }

    pdfjs.GlobalWorkerOptions.workerSrc = `${PDF_JS_CDN_BASE}/pdf.worker.min.js`;
    pdfjsLibInstance = pdfjs;

    return pdfjs;
  })();

  return loadingPromise;
}

const pdfCache = new Map<string, PDFDocument>();
const loadingPdfs = new Map<string, Promise<PDFDocument>>();

export async function loadPdfFromUrl(url: string): Promise<PDFDocument> {
  const cached = pdfCache.get(url);
  if (cached) {
    return cached;
  }

  const loading = loadingPdfs.get(url);
  if (loading) {
    return loading;
  }

  const loadPromise = (async () => {
    const pdfjsLib = await loadPdfJs();
    const pdf = await pdfjsLib.getDocument({ url }).promise;
    pdfCache.set(url, pdf);
    loadingPdfs.delete(url);
    return pdf;
  })();

  loadingPdfs.set(url, loadPromise);
  return loadPromise;
}

export function clearPdfCache(): void {
  pdfCache.clear();
  loadingPdfs.clear();
}
