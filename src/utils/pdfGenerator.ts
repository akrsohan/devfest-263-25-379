import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

/**
 * Creates a real, valid PDF file in memory with specified pages and title.
 * Used for instant interactive testing, demo pack loading, and unit validation.
 */
export async function createMockPdf(
  title: string,
  pageCount: number = 1,
  details: string = 'Official Document for Tender Submission'
): Promise<ArrayBuffer> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  for (let i = 1; i <= pageCount; i++) {
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const { width, height } = page.getSize();

    // Top decorative bar
    page.drawRectangle({
      x: 40,
      y: height - 50,
      width: width - 80,
      height: 3,
      color: rgb(0.12, 0.28, 0.52),
    });

    // Header Title
    page.drawText(title, {
      x: 50,
      y: height - 90,
      size: 18,
      font: boldFont,
      color: rgb(0.1, 0.15, 0.25),
    });

    page.drawText(`Page ${i} of ${pageCount}`, {
      x: width - 120,
      y: height - 90,
      size: 11,
      font: font,
      color: rgb(0.4, 0.45, 0.5),
    });

    // Content box
    page.drawRectangle({
      x: 50,
      y: height - 260,
      width: width - 100,
      height: 140,
      color: rgb(0.96, 0.97, 0.99),
      borderColor: rgb(0.82, 0.86, 0.9),
      borderWidth: 1,
    });

    page.drawText(`Document Subject: ${title}`, {
      x: 70,
      y: height - 150,
      size: 13,
      font: boldFont,
      color: rgb(0.15, 0.2, 0.3),
    });

    page.drawText(`Classification: ${details}`, {
      x: 70,
      y: height - 180,
      size: 11,
      font: font,
      color: rgb(0.3, 0.35, 0.4),
    });

    page.drawText(`Verification Seal / Authenticated Copy - Section ${i}`, {
      x: 70,
      y: height - 210,
      size: 10,
      font: font,
      color: rgb(0.4, 0.45, 0.5),
    });

    // Body placeholder lines
    for (let line = 0; line < 12; line++) {
      page.drawRectangle({
        x: 50,
        y: height - 310 - (line * 24),
        width: line % 3 === 0 ? width - 180 : width - 100,
        height: 8,
        color: rgb(0.9, 0.92, 0.95),
      });
    }

    // Bottom official watermark note
    page.drawText('CONFIDENTIAL TENDER SUBMISSION DOCUMENT - VALIDATED FOR BID EVALUATION', {
      x: 70,
      y: 70,
      size: 8,
      font: font,
      color: rgb(0.6, 0.65, 0.7),
    });
  }

  const pdfBytes = await pdfDoc.save();
  return pdfBytes.buffer as ArrayBuffer;
}
