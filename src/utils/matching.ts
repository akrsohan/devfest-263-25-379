import { Requirement, UploadedPdfFile } from '../types/tender';

const STOP_WORDS = new Set([
  'certificate',
  'certificates',
  'certification',
  'cert',
  'document',
  'documents',
  'doc',
  'copy',
  'copies',
  'form',
  'letter',
  'file',
  'pdf',
  'official',
  'and',
  'the',
  'for',
  'with',
  'from',
  'in',
  'of',
  'to',
  'a',
  'an',
  'latest',
  'valid',
  'recent',
  'attested',
  'scanned',
  'signed',
]);

/**
 * Normalizes text and strips generic stopwords, leading file sequence numbers,
 * file extensions, and extra characters.
 */
function cleanTokens(str: string): string[] {
  return str
    .toLowerCase()
    .replace(/\.pdf$/i, '')
    .replace(/\(\d+\)/g, ' ')
    .replace(/^\s*\d+[\s._-]+/, '') // remove arbitrary file prefixes like "01_", "02.", "03_"
    .replace(/[^a-z0-9\s]/gi, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !STOP_WORDS.has(w));
}

interface Topic {
  id: string;
  keywords: string[];
  negativeKeywords?: string[];
}

const TOPICS: Topic[] = [
  {
    id: 'tin_tax',
    keywords: ['tin', 'tax', 'income tax', 'tax clearance', 'it77', 'etin', 'tax return', 'challan'],
    negativeKeywords: ['vat', 'bin', 'bank', 'solvency', 'trade'],
  },
  {
    id: 'vat_bin',
    keywords: ['vat', 'bin', 'musak', 'mushak', 'mushok', '13 digit', 'value added tax'],
    negativeKeywords: ['tin', 'income tax', 'bank', 'solvency', 'trade'],
  },
  {
    id: 'bank_solvency',
    keywords: ['bank', 'solvency', 'credit facility', 'credit line', 'bank solvency', 'financial solvency', 'liquid asset'],
    negativeKeywords: ['tin', 'vat', 'trade license', 'incorporation', 'audit'],
  },
  {
    id: 'trade_license',
    keywords: ['trade license', 'trade licence', 'trade', 'poroshava', 'city corporation'],
    negativeKeywords: ['bank', 'vat', 'tin', 'audit'],
  },
  {
    id: 'incorporation',
    keywords: ['incorporation', 'incorporate', 'coi', 'memorandum', 'moa', 'aoa', 'rjsc', 'articles of association'],
    negativeKeywords: ['trade', 'vat', 'tin', 'bank'],
  },
  {
    id: 'audit_financial',
    keywords: ['audit', 'audited', 'financial statements', 'financial report', 'balance sheet', 'annual report'],
    negativeKeywords: ['solvency', 'bank solvency', 'trade'],
  },
  {
    id: 'experience',
    keywords: ['experience', 'work experience', 'completion', 'contract completion', 'credential', 'similar experience'],
    negativeKeywords: ['trade', 'tin', 'vat', 'bank'],
  },
  {
    id: 'maf',
    keywords: ['maf', 'manufacturer authorization', 'authorization letter', 'authorization form', 'oem authorization', 'partner authorization'],
    negativeKeywords: ['trade', 'tin', 'vat', 'bank'],
  },
  {
    id: 'iso',
    keywords: ['iso', '27001', '9001', 'quality management', 'quality certification'],
    negativeKeywords: ['trade', 'tin', 'vat', 'bank'],
  },
  {
    id: 'litigation',
    keywords: ['litigation', 'blacklisting', 'non blacklisting', 'declaration', 'affidavit'],
    negativeKeywords: ['trade', 'tin', 'vat', 'bank'],
  },
  {
    id: 'enlistment',
    keywords: ['enlistment', 'contractor enlistment', 'contractor license'],
    negativeKeywords: ['trade', 'tin', 'vat', 'bank'],
  },
  {
    id: 'security_bond',
    keywords: ['tender security', 'bid bond', 'bank guarantee', 'bid security'],
    negativeKeywords: ['trade', 'tin', 'vat'],
  },
];

/**
 * Calculates a match score between a filename and a requirement.
 * Strictly relies on semantic topics and non-stopword tokens.
 * Never matches on requirement order or file index alone.
 */
export function calculateMatchScore(filename: string, req: Requirement): number {
  const normFile = filename.toLowerCase().replace(/\.pdf$/i, '').replace(/[_-]/g, ' ').trim();
  const normReqEn = req.title_en.toLowerCase().replace(/[_-]/g, ' ').trim();
  const normReqBn = (req.title_bn || '').toLowerCase().replace(/[_-]/g, ' ').trim();

  const fileTokens = cleanTokens(normFile);
  const reqTokens = cleanTokens(normReqEn);

  // 1. Topic-based semantic matching
  for (const topic of TOPICS) {
    const fileHasTopic = topic.keywords.some(k => normFile.includes(k) || fileTokens.includes(k));
    const reqHasTopic = topic.keywords.some(k => normReqEn.includes(k) || reqTokens.includes(k));

    const fileHasNeg = topic.negativeKeywords
      ? topic.negativeKeywords.some(k => normFile.includes(k) || fileTokens.includes(k))
      : false;

    if (fileHasTopic && reqHasTopic && !fileHasNeg) {
      return 0.95;
    } else if ((fileHasTopic && !reqHasTopic) || (reqHasTopic && fileHasNeg)) {
      // Direct topic conflict (e.g. VAT file vs TIN requirement, or TIN file vs VAT requirement)
      return 0;
    }
  }

  // 2. Generic token overlap for custom/unseen requirements
  if (fileTokens.length > 0 && reqTokens.length > 0) {
    const shared = fileTokens.filter(t => reqTokens.includes(t));
    if (shared.length > 0) {
      return Math.min((shared.length / Math.max(reqTokens.length, 1)) * 0.85, 0.90);
    }
  }

  // 3. Fallback check for exact clean substring
  const strippedFile = normFile.replace(/^\s*\d+[\s._-]+/, '').trim();
  if (strippedFile.length > 3 && (normReqEn.includes(strippedFile) || strippedFile.includes(normReqEn))) {
    return 0.80;
  }

  // Also check Bangla title if present
  if (normReqBn && normFile.includes(normReqBn)) {
    return 0.85;
  }

  return 0;
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
 * Enforces strict 1-to-1 matching and excludes duplicates or damaged files.
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
      if (score >= 0.40) {
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
