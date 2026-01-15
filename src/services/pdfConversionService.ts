import { jsPDF } from 'jspdf';

export interface ConversionResult {
  pdfBlob: Blob;
  pdfFilename: string;
}

export async function convertImageToPdf(file: File): Promise<ConversionResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      try {
        const imgWidth = img.width;
        const imgHeight = img.height;

        const LETTER_WIDTH_PT = 612;
        const LETTER_HEIGHT_PT = 792;
        const MARGIN_PT = 36;

        const availableWidth = LETTER_WIDTH_PT - 2 * MARGIN_PT;
        const availableHeight = LETTER_HEIGHT_PT - 2 * MARGIN_PT;

        const imgRatio = imgWidth / imgHeight;
        const pageRatio = availableWidth / availableHeight;

        let finalWidth: number;
        let finalHeight: number;

        if (imgRatio > pageRatio) {
          finalWidth = availableWidth;
          finalHeight = availableWidth / imgRatio;
        } else {
          finalHeight = availableHeight;
          finalWidth = availableHeight * imgRatio;
        }

        const offsetX = MARGIN_PT + (availableWidth - finalWidth) / 2;
        const offsetY = MARGIN_PT + (availableHeight - finalHeight) / 2;

        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'pt',
          format: 'letter',
        });

        const canvas = document.createElement('canvas');
        canvas.width = imgWidth;
        canvas.height = imgHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to create canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0);

        const mimeType = file.type === 'image/png' ? 'PNG' : 'JPEG';
        const imgData = canvas.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.92);

        pdf.addImage(imgData, mimeType, offsetX, offsetY, finalWidth, finalHeight);

        const pdfBlob = pdf.output('blob');
        const originalBaseName = file.name.replace(/\.[^/.]+$/, '');
        const pdfFilename = `${originalBaseName}.pdf`;

        resolve({ pdfBlob, pdfFilename });
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for conversion'));
    };

    img.src = url;
  });
}
