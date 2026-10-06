import { Requirement, RequirementStatusType, RequirementValidationResult, TenderData, UploadedPdfFile, ValidationSummary } from '../types/tender';

/**
 * Validates dates using YYYY-MM-DD comparison.
 * Exact equality is explicitly VALID/OK as per competition rules.
 */
export function validateExpiryDate(
  expiryDateStr: string | undefined,
  deadlineStr: string
): 'missing' | 'expired' | 'valid' {
  if (!expiryDateStr || expiryDateStr.trim() === '') {
    return 'missing';
  }

  const expiry = expiryDateStr.trim().substring(0, 10);
  const deadline = deadlineStr.trim().substring(0, 10);

  if (expiry < deadline) {
    return 'expired';
  }

  // expiry >= deadline is valid
  return 'valid';
}

/**
 * Validates all requirements against uploaded files, matches, and expiry dates.
 */
export function validateAllRequirements(
  tender: TenderData,
  uploadedFiles: UploadedPdfFile[],
  matches: Record<string, string>, // reqId -> fileId
  expiryDates: Record<string, string> // reqId -> 'YYYY-MM-DD'
): {
  results: RequirementValidationResult[];
  summary: ValidationSummary;
} {
  const fileMap = new Map<string, UploadedPdfFile>();
  uploadedFiles.forEach(f => fileMap.set(f.id, f));

  const results: RequirementValidationResult[] = [];
  const blockingReasons: string[] = [];

  let okCount = 0;
  let missingCount = 0;
  let expiredCount = 0;
  let expiryNeededCount = 0;
  let notProvidedCount = 0;

  // Track matched file duplicate issues
  let duplicateIssuesCount = 0;
  const duplicateFilesMatched = new Set<string>();

  // Check overall uploaded duplicate count
  const duplicateFiles = uploadedFiles.filter(f => f.isDuplicate);
  if (duplicateFiles.length > 0) {
    // Group duplicates by hash
    const groups = new Map<string, string[]>();
    duplicateFiles.forEach(f => {
      const arr = groups.get(f.hash) || [];
      arr.push(f.name);
      groups.set(f.hash, arr);
    });

    groups.forEach((fileNames) => {
      duplicateIssuesCount++;
      blockingReasons.push(
        `Duplicate files detected: [${fileNames.join(', ')}] have identical content. Remove redundant copies.`
      );
    });
  }

  // Sort requirements by order
  const sortedReqs = [...tender.requirements].sort((a, b) => a.order - b.order);

  for (const req of sortedReqs) {
    const fileId = matches[req.id];
    const file = fileId ? fileMap.get(fileId) : undefined;
    const expiryDate = expiryDates[req.id];

    let status: RequirementStatusType = 'Missing';
    let isBlocking = false;
    let message = '';

    if (!file) {
      if (req.mandatory) {
        status = 'Missing';
        isBlocking = true;
        missingCount++;
        message = 'Mandatory document has no attached file.';
        blockingReasons.push(`Missing: "${req.title_en}" is mandatory but not provided.`);
      } else {
        status = 'Not provided';
        isBlocking = false;
        notProvidedCount++;
        message = 'Optional document not attached.';
      }
    } else {
      // File is attached! Check if file is damaged/unreadable
      if (file.isDamaged) {
        status = 'Missing';
        isBlocking = true;
        missingCount++;
        message = file.errorMessage || 'Attached PDF is unreadable or corrupted.';
        blockingReasons.push(`Unreadable file attached to "${req.title_en}": ${file.name}`);
      } else if (file.isDuplicate) {
        // Matched file is a duplicate
        duplicateFilesMatched.add(file.id);
        isBlocking = true;
        message = `Attached file "${file.name}" is an exact-content duplicate. Cannot match duplicate files.`;
        status = 'Missing';
      } else if (req.has_expiry) {
        const dateCheck = validateExpiryDate(expiryDate, tender.submission_deadline);
        if (dateCheck === 'missing') {
          status = 'Expiry date needed';
          isBlocking = true;
          expiryNeededCount++;
          message = 'Expiry date required for this document.';
          blockingReasons.push(
            `Expiry date needed for "${req.title_en}" (Deadline: ${tender.submission_deadline}).`
          );
        } else if (dateCheck === 'expired') {
          status = 'Expired';
          isBlocking = true;
          expiredCount++;
          message = `Expired! Expiry date (${expiryDate}) is before deadline (${tender.submission_deadline}).`;
          blockingReasons.push(
            `Document expired: "${req.title_en}" expires on ${expiryDate}, before tender deadline (${tender.submission_deadline}).`
          );
        } else {
          status = 'OK';
          isBlocking = false;
          okCount++;
          message = `Valid document (Expires ${expiryDate}).`;
        }
      } else {
        // Matched file and does not require expiry
        status = 'OK';
        isBlocking = false;
        okCount++;
        message = 'Document verified and ready.';
      }
    }

    results.push({
      requirement: req,
      status,
      isBlocking,
      matchedFileId: file?.id,
      matchedFileName: file?.name,
      expiryDate,
      message,
    });
  }

  const blockingIssuesCount = blockingReasons.length;
  const canGeneratePackage = blockingIssuesCount === 0;

  const summary: ValidationSummary = {
    okCount,
    missingCount,
    expiredCount,
    expiryNeededCount,
    notProvidedCount,
    duplicateIssuesCount,
    blockingIssuesCount,
    canGeneratePackage,
    blockingReasons,
  };

  return { results, summary };
}
