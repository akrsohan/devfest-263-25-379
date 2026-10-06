import { RequirementValidationResult, TenderData, UploadedPdfFile } from '../types/tender';

/**
 * Exports the tender checklist as a structured CSV file with UTF-8 BOM
 * for clean opening in Microsoft Excel and Google Sheets.
 */
export function exportChecklistToCSV(
  tender: TenderData,
  results: RequirementValidationResult[],
  uploadedFiles: UploadedPdfFile[]
): void {
  const fileMap = new Map<string, UploadedPdfFile>();
  uploadedFiles.forEach(f => fileMap.set(f.id, f));

  const headers = [
    'Order',
    'Requirement (English)',
    'Requirement (Bangla)',
    'Type',
    'Expiry Required',
    'Attached File',
    'Pages',
    'File Expiry Date',
    'Tender Deadline',
    'Audit Status',
    'Notes',
  ];

  const rows = results.map((r) => {
    const file = r.matchedFileId ? fileMap.get(r.matchedFileId) : undefined;
    return [
      String(r.requirement.order),
      `"${(r.requirement.title_en || '').replace(/"/g, '""')}"`,
      `"${(r.requirement.title_bn || '').replace(/"/g, '""')}"`,
      r.requirement.mandatory ? 'Mandatory' : 'Optional',
      r.requirement.has_expiry ? 'Yes' : 'No',
      `"${(file ? file.name : 'None').replace(/"/g, '""')}"`,
      file ? String(file.pageCount) : '0',
      r.expiryDate || 'N/A',
      tender.submission_deadline,
      r.status,
      `"${(r.message || '').replace(/"/g, '""')}"`,
    ];
  });

  const metadataRows = [
    `"Tender ID / Ref","${(tender.tender_id || '').replace(/"/g, '""')}"`,
    `"Tender Title","${(tender.title || '').replace(/"/g, '""')}"`,
    `"Procuring Entity","${(tender.procuring_entity || '').replace(/"/g, '""')}"`,
    `"Bidder","${(tender.bidder || '').replace(/"/g, '""')}"`,
    `"Submission Deadline","${tender.submission_deadline}"`,
    `"Export Timestamp","${new Date().toISOString()}"`,
    '', // empty separator line
  ];

  const csvContent =
    '\uFEFF' + // UTF-8 BOM
    metadataRows.join('\n') +
    headers.join(',') +
    '\n' +
    rows.map(row => row.join(',')).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${tender.tender_id.replace(/[^a-zA-Z0-9_-]/g, '_')}_Checklist.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
