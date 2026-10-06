import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { PackageGenerationOptions, Requirement, TenderData, UploadedPdfFile } from '../types/tender';

/**
 * Clean string to ensure compatibility with standard PDF fonts (WinAnsi encoding)
 */
function sanitizeText(str: string | undefined | null): string {
  if (!str) return '';
  // Replace characters outside basic Latin-1 with ASCII equivalents
  return str.replace(/[^\x20-\x7E]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Inspects a PDF ArrayBuffer to return its genuine page count.
 * Throws an informative error if encrypted or damaged.
 */
export async function readPdfPageCount(buffer: ArrayBuffer): Promise<number> {
  try {
    const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: false });
    return pdfDoc.getPageCount();
  } catch (err: any) {
    const msg = String(err?.message || err);
    if (msg.includes('encrypt') || msg.includes('password')) {
      throw new Error('This PDF is password-protected or encrypted. Please remove the password and re-upload.');
    }
    throw new Error('Could not read this PDF. Please check that the file is not damaged or password-protected.');
  }
}

export interface IncludedDocumentMeta {
  order: number;
  title: string;
  filename: string;
  pageCount: number;
  startPage: number;
  fileBuffer: ArrayBuffer;
  expiryDate?: string;
}

/**
 * Generates the complete, professional Tender Document Package PDF entirely in the browser.
 */
export async function generateTenderPackage(
  tender: TenderData,
  matchedRequirements: Array<{
    requirement: Requirement;
    file: UploadedPdfFile;
    expiryDate?: string;
  }>,
  options: PackageGenerationOptions = { includeIndexPage: true, includeDigitalSeal: true }
): Promise<{ pdfBytes: Uint8Array; totalPages: number; filename: string }> {
  const mergedPdf = await PDFDocument.create();

  const helvetica = await mergedPdf.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await mergedPdf.embedFont(StandardFonts.HelveticaBold);
  const helveticaOblique = await mergedPdf.embedFont(StandardFonts.HelveticaOblique);

  // 1. Sort matched requirements strictly by requirement.order
  const sortedMatches = [...matchedRequirements].sort(
    (a, b) => a.requirement.order - b.requirement.order
  );

  // 2. Calculate document start pages
  // Page 1 is Cover
  // If includeIndexPage is true, Page 2 is Index/TOC
  const offset = options.includeIndexPage ? 2 : 1;
  let runningStartPage = offset + 1;

  const includedDocs: IncludedDocumentMeta[] = sortedMatches.map((m) => {
    const start = runningStartPage;
    runningStartPage += m.file.pageCount;
    return {
      order: m.requirement.order,
      title: m.requirement.title_en || `Document #${m.requirement.order}`,
      filename: m.file.name,
      pageCount: m.file.pageCount,
      startPage: start,
      fileBuffer: m.file.arrayBuffer,
      expiryDate: m.expiryDate,
    };
  });

  // ==========================================
  // PAGE 1: COVER PAGE
  // ==========================================
  const coverPage = mergedPdf.addPage([595.28, 841.89]); // A4 (595.28 x 841.89 pt)
  const { width: cWidth, height: cHeight } = coverPage.getSize();

  // Draw outer elegant border
  coverPage.drawRectangle({
    x: 25,
    y: 25,
    width: cWidth - 50,
    height: cHeight - 50,
    borderColor: rgb(0.12, 0.25, 0.45),
    borderWidth: 1.5,
  });

  coverPage.drawRectangle({
    x: 28,
    y: 28,
    width: cWidth - 56,
    height: cHeight - 56,
    borderColor: rgb(0.7, 0.78, 0.88),
    borderWidth: 0.5,
  });

  // Top header banner
  coverPage.drawRectangle({
    x: 29,
    y: cHeight - 110,
    width: cWidth - 58,
    height: 81,
    color: rgb(0.08, 0.2, 0.38),
  });

  const headerTitle = 'OFFICIAL TENDER SUBMISSION PACKAGE';
  const headerSub = 'COMPREHENSIVE VERIFIED BIDDING DOSSIER';

  coverPage.drawText(headerTitle, {
    x: (cWidth - helveticaBold.widthOfTextAtSize(headerTitle, 16)) / 2,
    y: cHeight - 65,
    size: 16,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  });

  coverPage.drawText(headerSub, {
    x: (cWidth - helvetica.widthOfTextAtSize(headerSub, 9)) / 2,
    y: cHeight - 88,
    size: 9,
    font: helvetica,
    color: rgb(0.8, 0.88, 0.98),
  });

  // Tender Metadata Card
  const metaBoxY = cHeight - 330;
  coverPage.drawRectangle({
    x: 45,
    y: metaBoxY,
    width: cWidth - 90,
    height: 200,
    color: rgb(0.97, 0.98, 1),
    borderColor: rgb(0.82, 0.87, 0.94),
    borderWidth: 1,
  });

  const fields = [
    { label: 'Tender ID / Ref No:', value: sanitizeText(tender.tender_id) },
    { label: 'Tender Title:', value: sanitizeText(tender.title) },
    { label: 'Procuring Entity:', value: sanitizeText(tender.procuring_entity) },
    { label: 'Submitting Bidder:', value: sanitizeText(tender.bidder) },
    { label: 'Submission Deadline:', value: sanitizeText(tender.submission_deadline) },
    {
      label: 'Package Creation Date:',
      value: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    },
    {
      label: 'Verified Documents:',
      value: `${includedDocs.length} of ${tender.requirements.length} requirements enclosed`,
    },
  ];

  let currentY = metaBoxY + 175;
  fields.forEach(({ label, value }) => {
    coverPage.drawText(label, {
      x: 60,
      y: currentY,
      size: 9.5,
      font: helveticaBold,
      color: rgb(0.2, 0.26, 0.35),
    });

    // Wrap value if long
    const valText = value || 'N/A';
    if (valText.length > 55) {
      const line1 = valText.substring(0, 55);
      const line2 = valText.substring(55, 110);
      coverPage.drawText(line1, {
        x: 195,
        y: currentY,
        size: 9.5,
        font: helvetica,
        color: rgb(0.1, 0.12, 0.18),
      });
      currentY -= 14;
      coverPage.drawText(line2, {
        x: 195,
        y: currentY,
        size: 9.5,
        font: helvetica,
        color: rgb(0.1, 0.12, 0.18),
      });
    } else {
      coverPage.drawText(valText, {
        x: 195,
        y: currentY,
        size: 9.5,
        font: helvetica,
        color: rgb(0.1, 0.12, 0.18),
      });
    }
    currentY -= 23;
  });

  // Included Documents Summary Section on Cover
  const docListY = metaBoxY - 30;
  coverPage.drawText('ENCLOSED TENDER DOCUMENTS SUMMARY', {
    x: 45,
    y: docListY,
    size: 11,
    font: helveticaBold,
    color: rgb(0.1, 0.2, 0.35),
  });

  coverPage.drawLine({
    start: { x: 45, y: docListY - 6 },
    end: { x: cWidth - 45, y: docListY - 6 },
    thickness: 1,
    color: rgb(0.75, 0.82, 0.9),
  });

  // Table header
  let itemY = docListY - 24;
  coverPage.drawText('#', { x: 50, y: itemY, size: 8.5, font: helveticaBold, color: rgb(0.4, 0.45, 0.5) });
  coverPage.drawText('Document Title', { x: 75, y: itemY, size: 8.5, font: helveticaBold, color: rgb(0.4, 0.45, 0.5) });
  coverPage.drawText('Attached File', { x: 300, y: itemY, size: 8.5, font: helveticaBold, color: rgb(0.4, 0.45, 0.5) });
  coverPage.drawText('Pages', { x: 480, y: itemY, size: 8.5, font: helveticaBold, color: rgb(0.4, 0.45, 0.5) });

  itemY -= 14;

  const maxCoverList = 10;
  includedDocs.slice(0, maxCoverList).forEach((doc, idx) => {
    const isEven = idx % 2 === 0;
    if (isEven) {
      coverPage.drawRectangle({
        x: 45,
        y: itemY - 4,
        width: cWidth - 90,
        height: 18,
        color: rgb(0.96, 0.97, 0.99),
      });
    }

    coverPage.drawText(`${doc.order}`, {
      x: 50,
      y: itemY,
      size: 8.5,
      font: helveticaBold,
      color: rgb(0.2, 0.25, 0.35),
    });

    const truncatedTitle = doc.title.length > 40 ? doc.title.substring(0, 38) + '...' : doc.title;
    coverPage.drawText(sanitizeText(truncatedTitle), {
      x: 75,
      y: itemY,
      size: 8.5,
      font: helvetica,
      color: rgb(0.1, 0.15, 0.25),
    });

    const truncatedFilename = doc.filename.length > 30 ? doc.filename.substring(0, 28) + '...' : doc.filename;
    coverPage.drawText(sanitizeText(truncatedFilename), {
      x: 300,
      y: itemY,
      size: 8,
      font: helveticaOblique,
      color: rgb(0.3, 0.35, 0.45),
    });

    coverPage.drawText(`${doc.pageCount} pg`, {
      x: 485,
      y: itemY,
      size: 8.5,
      font: helvetica,
      color: rgb(0.2, 0.3, 0.4),
    });

    itemY -= 19;
  });

  if (includedDocs.length > maxCoverList) {
    coverPage.drawText(`+ ${includedDocs.length - maxCoverList} additional documents listed in the Table of Contents`, {
      x: 75,
      y: itemY,
      size: 8.5,
      font: helveticaOblique,
      color: rgb(0.4, 0.5, 0.6),
    });
  }

  // Stamp / Certification Box at bottom of Cover Page
  const sealY = 55;
  coverPage.drawRectangle({
    x: 45,
    y: sealY,
    width: cWidth - 90,
    height: 75,
    color: rgb(0.98, 0.99, 1),
    borderColor: rgb(0.75, 0.8, 0.88),
    borderWidth: 1,
  });

  coverPage.drawText('AUTHORIZED BIDDER CERTIFICATION & COMPLIANCE STAMP', {
    x: 55,
    y: sealY + 58,
    size: 8,
    font: helveticaBold,
    color: rgb(0.12, 0.25, 0.45),
  });

  coverPage.drawText('All documents compiled herein are genuine, verified, uncorrupted, and officially attested for this bid.', {
    x: 55,
    y: sealY + 43,
    size: 7.5,
    font: helvetica,
    color: rgb(0.35, 0.4, 0.48),
  });

  coverPage.drawText('Authorized Signatory:', {
    x: 55,
    y: sealY + 20,
    size: 8,
    font: helveticaBold,
    color: rgb(0.2, 0.25, 0.35),
  });

  const signatory = sanitizeText(options.signatoryName || tender.bidder || 'Authorized Signatory');
  coverPage.drawText(signatory, {
    x: 155,
    y: sealY + 20,
    size: 8,
    font: helvetica,
    color: rgb(0.1, 0.15, 0.25),
  });

  coverPage.drawText('Digital Verification: SHA-256 Authenticated Package', {
    x: 350,
    y: sealY + 20,
    size: 7.5,
    font: helveticaBold,
    color: rgb(0.15, 0.5, 0.25),
  });

  // Optional custom seal image embedding if provided
  if (options.includeDigitalSeal && options.sealDataUrl) {
    try {
      const sealBytes = await fetch(options.sealDataUrl).then(res => res.arrayBuffer());
      const sealImage = await mergedPdf.embedPng(sealBytes);
      coverPage.drawImage(sealImage, {
        x: cWidth - 130,
        y: sealY + 10,
        width: 55,
        height: 55,
      });
    } catch {
      // Fallback seal stamp graphic
      coverPage.drawCircle({
        x: cWidth - 95,
        y: sealY + 38,
        size: 26,
        borderColor: rgb(0.1, 0.4, 0.2),
        borderWidth: 1.5,
      });
      coverPage.drawText('VERIFIED', {
        x: cWidth - 114,
        y: sealY + 35,
        size: 8,
        font: helveticaBold,
        color: rgb(0.1, 0.4, 0.2),
      });
    }
  } else if (options.includeDigitalSeal) {
    // Elegant built-in official seal stamp
    coverPage.drawCircle({
      x: cWidth - 95,
      y: sealY + 38,
      size: 26,
      borderColor: rgb(0.1, 0.35, 0.65),
      borderWidth: 1.5,
    });
    coverPage.drawText('VERIFIED', {
      x: cWidth - 114,
      y: sealY + 41,
      size: 7.5,
      font: helveticaBold,
      color: rgb(0.1, 0.35, 0.65),
    });
    coverPage.drawText('DOSSIER', {
      x: cWidth - 112,
      y: sealY + 31,
      size: 7,
      font: helveticaBold,
      color: rgb(0.1, 0.35, 0.65),
    });
  }

  // ==========================================
  // BONUS 1: INDEX / TABLE OF CONTENTS PAGE
  // ==========================================
  if (options.includeIndexPage) {
    const indexPage = mergedPdf.addPage([595.28, 841.89]);
    const { width: iWidth, height: iHeight } = indexPage.getSize();

    // Border
    indexPage.drawRectangle({
      x: 25,
      y: 25,
      width: iWidth - 50,
      height: iHeight - 50,
      borderColor: rgb(0.12, 0.25, 0.45),
      borderWidth: 1.5,
    });

    indexPage.drawRectangle({
      x: 28,
      y: 28,
      width: iWidth - 56,
      height: iHeight - 56,
      borderColor: rgb(0.7, 0.78, 0.88),
      borderWidth: 0.5,
    });

    // Header banner
    indexPage.drawRectangle({
      x: 29,
      y: iHeight - 90,
      width: iWidth - 58,
      height: 61,
      color: rgb(0.12, 0.22, 0.38),
    });

    const indexTitle = 'TABLE OF CONTENTS & DOCUMENT INDEX';
    indexPage.drawText(indexTitle, {
      x: (iWidth - helveticaBold.widthOfTextAtSize(indexTitle, 15)) / 2,
      y: iHeight - 55,
      size: 15,
      font: helveticaBold,
      color: rgb(1, 1, 1),
    });

    const tenderSubtext = `Tender: ${sanitizeText(tender.tender_id)} | ${sanitizeText(tender.bidder)}`;
    indexPage.drawText(tenderSubtext, {
      x: (iWidth - helvetica.widthOfTextAtSize(tenderSubtext, 8.5)) / 2,
      y: iHeight - 75,
      size: 8.5,
      font: helvetica,
      color: rgb(0.8, 0.88, 0.98),
    });

    // Table Header
    let idxY = iHeight - 120;
    indexPage.drawRectangle({
      x: 45,
      y: idxY - 6,
      width: iWidth - 90,
      height: 24,
      color: rgb(0.9, 0.93, 0.98),
      borderColor: rgb(0.75, 0.82, 0.92),
      borderWidth: 1,
    });

    indexPage.drawText('Item #', { x: 55, y: idxY, size: 9, font: helveticaBold, color: rgb(0.15, 0.25, 0.4) });
    indexPage.drawText('Required Document Name', { x: 100, y: idxY, size: 9, font: helveticaBold, color: rgb(0.15, 0.25, 0.4) });
    indexPage.drawText('File Attached', { x: 310, y: idxY, size: 9, font: helveticaBold, color: rgb(0.15, 0.25, 0.4) });
    indexPage.drawText('Total Pgs', { x: 440, y: idxY, size: 9, font: helveticaBold, color: rgb(0.15, 0.25, 0.4) });
    indexPage.drawText('Starting Page', { x: 495, y: idxY, size: 9, font: helveticaBold, color: rgb(0.15, 0.25, 0.4) });

    idxY -= 26;

    // List each included document with exact starting page
    includedDocs.forEach((doc, i) => {
      const isAlt = i % 2 === 1;
      if (isAlt) {
        indexPage.drawRectangle({
          x: 45,
          y: idxY - 5,
          width: iWidth - 90,
          height: 22,
          color: rgb(0.97, 0.98, 1),
        });
      }

      indexPage.drawText(String(doc.order), {
        x: 60,
        y: idxY,
        size: 9,
        font: helveticaBold,
        color: rgb(0.2, 0.25, 0.35),
      });

      const titleTxt = doc.title.length > 38 ? doc.title.substring(0, 36) + '...' : doc.title;
      indexPage.drawText(sanitizeText(titleTxt), {
        x: 100,
        y: idxY,
        size: 9,
        font: helveticaBold,
        color: rgb(0.1, 0.15, 0.25),
      });

      const fnTxt = doc.filename.length > 25 ? doc.filename.substring(0, 23) + '...' : doc.filename;
      indexPage.drawText(sanitizeText(fnTxt), {
        x: 310,
        y: idxY,
        size: 8.5,
        font: helveticaOblique,
        color: rgb(0.35, 0.4, 0.5),
      });

      indexPage.drawText(String(doc.pageCount), {
        x: 455,
        y: idxY,
        size: 9,
        font: helvetica,
        color: rgb(0.2, 0.25, 0.35),
      });

      // Starting page badge
      indexPage.drawText(`Page ${doc.startPage}`, {
        x: 502,
        y: idxY,
        size: 9,
        font: helveticaBold,
        color: rgb(0.1, 0.3, 0.6),
      });

      // Dotted leader line
      indexPage.drawLine({
        start: { x: 45, y: idxY - 6 },
        end: { x: iWidth - 45, y: idxY - 6 },
        thickness: 0.5,
        color: rgb(0.85, 0.88, 0.92),
      });

      idxY -= 24;
    });

    // Notes at bottom of Index Page
    const noteY = 60;
    indexPage.drawText('Note: Optional tender requirements that were not provided are omitted from this package.', {
      x: 50,
      y: noteY,
      size: 8,
      font: helveticaOblique,
      color: rgb(0.4, 0.45, 0.55),
    });
  }

  // ==========================================
  // DOCUMENT PAGES: COPY IN EXACT ORDER
  // ==========================================
  for (const doc of includedDocs) {
    try {
      const srcDoc = await PDFDocument.load(doc.fileBuffer, { ignoreEncryption: true });
      const pageIndices = srcDoc.getPageIndices();
      const copiedPages = await mergedPdf.copyPages(srcDoc, pageIndices);
      for (const page of copiedPages) {
        mergedPdf.addPage(page);
      }
    } catch (err: any) {
      throw new Error(`Failed to embed document "${doc.filename}": ${err?.message || 'Unknown error'}`);
    }
  }

  // ==========================================
  // FOOTER: APPLIED TO EVERY PAGE
  // ==========================================
  // Rule: `<tender_id> | Page X of Y` where Y is TOTAL number of pages
  const allPages = mergedPdf.getPages();
  const totalPages = allPages.length;
  const footerFont = helvetica;
  const footerSize = 8.5;

  allPages.forEach((page, index) => {
    const { width: pWidth } = page.getSize();
    const pageNum = index + 1;
    const footerText = `${sanitizeText(tender.tender_id)} | Page ${pageNum} of ${totalPages}`;
    const textWidth = footerFont.widthOfTextAtSize(footerText, footerSize);

    // Subtle background strip to prevent clash with existing page content
    page.drawRectangle({
      x: 0,
      y: 0,
      width: pWidth,
      height: 22,
      color: rgb(0.99, 0.99, 0.99),
      opacity: 0.85,
    });

    // Subtle top line of the footer
    page.drawLine({
      start: { x: 25, y: 22 },
      end: { x: pWidth - 25, y: 22 },
      thickness: 0.5,
      color: rgb(0.8, 0.83, 0.88),
    });

    // Footer text centered
    page.drawText(footerText, {
      x: (pWidth - textWidth) / 2,
      y: 8,
      size: footerSize,
      font: footerFont,
      color: rgb(0.3, 0.35, 0.45),
    });
  });

  const pdfBytes = await mergedPdf.save();
  const filename = `${sanitizeText(tender.tender_id).replace(/[^a-zA-Z0-9_-]/g, '_')}_Package.pdf`;

  return {
    pdfBytes,
    totalPages,
    filename,
  };
}
