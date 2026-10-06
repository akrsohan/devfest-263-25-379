import { Requirement, UploadedPdfFile } from '../types/tender';

/**
 * Normalizes text for matching by removing non-alphanumeric chars,
 * leading sequence numbers, file extensions, and extra spaces.
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/\.pdf$/i, '')
    .replace(/^\s*\d+[\s._-]+/, '') // remove leading "01_", "2.", etc.
    .replace(/[_-]/g, ' ')
    .replace(/[^a-z0-9\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculates a match score between a filename and a requirement.
 */
export function calculateMatchScore(filename: string, req: Requirement): number {
  const normFile = normalizeText(filename);
  const normTitleEn = normalizeText(req.title_en);
  const wordsFile = normFile.split(' ').filter(w => w.length > 1);
  const wordsReq = normTitleEn.split(' ').filter(w => w.length > 2);

  // Exact phrase substring match
  if (normFile.includes(normTitleEn) || normTitleEn.includes(normFile)) {
    return 0.95;
  }

  // Check common tender keywords & acronyms
  const keywordMappings: Record<string, string[]> = {
    trade: ['trade', 'license', 'licence', 'poroashava', 'city'],
    tin: ['tin', 'tax', 'return', 'income', 'it77'],
    tax: ['tax', 'clearance', 'tin', 'challan'],
    vat: ['vat', 'bin', 'musak', 'mushak', '13 digit'],
    bin: ['bin', 'vat', 'registration', 'musak'],
    incorporation: ['incorporation', 'inc', 'coi', 'memorandum', 'moa', 'aoa', 'rjsc'],
    audit: ['audit', 'audited', 'financial', 'balance', 'report', 'statements'],
    bank: ['bank', 'solvency', 'credit', 'facility', 'liquid', 'assets'],
    solvency: ['solvency', 'bank', 'certificate', 'statement'],
    experience: ['experience', 'work', 'completion', 'contract', 'credential', 'similar'],
    maf: ['maf', 'authorization', 'manufacturer', 'partner', 'oem'],
    iso: ['iso', '27001', '9001', 'quality', 'compliance', 'cert'],
    litigation: ['litigation', 'blacklisting', 'non-blacklisting', 'court', 'declaration', 'affidavit'],
    enlistment: ['enlistment', 'contractor', 'license', 'pwd', 'rhd'],
    security: ['security', 'bond', 'guarantee', 'bid', 'bg'],
  };

  let score = 0;

  // 1. Check order number match: e.g. "01_trade_license" and req.order === 1
  const leadingNumMatch = filename.match(/^0*(\d+)/);
  if (leadingNumMatch && parseInt(leadingNumMatch[1], 10) === req.order) {
    score += 0.35;
  }

  // 2. Token overlap
  let matchedTokens = 0;
  for (const w of wordsFile) {
    if (wordsReq.includes(w)) {
      matchedTokens++;
      score += 0.25;
    }
  }

  // 3. Keyword / acronym semantics
  for (const [key, aliases] of Object.entries(keywordMappings)) {
    const fileHasAlias = aliases.some(a => normFile.includes(a));
    const reqHasAlias = aliases.some(a => normTitleEn.includes(a));
    if (fileHasAlias && reqHasAlias) {
      score += 0.45;
      break;
    }
  }

  return Math.min(score, 1);
}

export interface MatchSuggestion {
  fileId: string;
  fileName: string;
  requirementId: string;
  requirementOrder: number;
  requirementTitle: string;
  confidence: number;
}

/**
 * Produces best match suggestions for unmatched files and requirements.
 */
export function getAutoMatchSuggestions(
  files: UploadedPdfFile[],
  requirements: Requirement[],
  existingMatches: Record<string, string> // reqId -> fileId
): MatchSuggestion[] {
  const suggestions: MatchSuggestion[] = [];
  const assignedFileIds = new Set(Object.values(existingMatches));
  const assignedReqIds = new Set(Object.keys(existingMatches));

  const availableFiles = files.filter(f => !assignedFileIds.has(f.id) && !f.isDuplicate && !f.isDamaged);
  const availableReqs = requirements.filter(r => !assignedReqIds.has(r.id));

  // Compute all pairwise scores
  const candidates: Array<{
    file: UploadedPdfFile;
    req: Requirement;
    score: number;
  }> = [];

  for (const file of availableFiles) {
    for (const req of availableReqs) {
      const score = calculateMatchScore(file.name, req);
      if (score >= 0.3) {
        candidates.push({ file, req, score });
      }
    }
  }

  // Sort descending by score
  candidates.sort((a, b) => b.score - a.score);

  const matchedFileSet = new Set<string>();
  const matchedReqSet = new Set<string>();

  for (const cand of candidates) {
    if (!matchedFileSet.has(cand.file.id) && !matchedReqSet.has(cand.req.id)) {
      matchedFileSet.add(cand.file.id);
      matchedReqSet.add(cand.req.id);
      suggestions.push({
        fileId: cand.file.id,
        fileName: cand.file.name,
        requirementId: cand.req.id,
        requirementOrder: cand.req.order,
        requirementTitle: cand.req.title_en,
        confidence: Math.round(cand.score * 100),
      });
    }
  }

  return suggestions;
}
