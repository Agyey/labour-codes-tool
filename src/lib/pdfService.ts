import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Generates a high-fidelity PDF from a DOM element.
 * @param elementId The ID of the element to capture.
 * @param fileName The name of the resulting PDF file.
 * @returns A promise that resolves to a Blob URL of the generated PDF.
 */
export async function generatePDF(elementId: string, fileName: string): Promise<string> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with ID ${elementId} not found.`);
  }

  // Create a canvas from the element
  // We use scale: 2 for higher resolution
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff', // Force white background for ink-friendly PDFs
  });

  const imgData = canvas.toDataURL('image/png');
  
  // PDF dimensions (A4)
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  pdf.setProperties({
    title: fileName,
  });

  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  // Handle multi-page if necessary (basic implementation)
  let heightLeft = pdfHeight;
  let position = 0;

  pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
  heightLeft -= pdf.internal.pageSize.getHeight();

  while (heightLeft >= 0) {
    position = heightLeft - pdfHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
    heightLeft -= pdf.internal.pageSize.getHeight();
  }

  const blob = pdf.output('blob');
  return URL.createObjectURL(blob);
}
