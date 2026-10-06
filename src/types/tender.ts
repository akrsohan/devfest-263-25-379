export type Language = 'en' | 'bn';

export interface Requirement {
  id: string;
  order: number;
  title_en: string;
  title_bn: string;
  mandatory: boolean;
  has_expiry: boolean;
}

export interface TenderData {
  tender_id: string;
  title: string;
  procuring_entity: string;
  bidder: string;
  submission_deadline: string; // ISO date 'YYYY-MM-DD'
  requirements: Requirement[];
}

export type RequirementStatusType =
  | 'OK'
  | 'Missing'
  | 'Expiry date needed'
  | 'Expired'
  | 'Not provided';

export interface RequirementValidationResult {
  requirement: Requirement;
  status: RequirementStatusType;
  isBlocking: boolean;
  matchedFileId?: string;
  matchedFileName?: string;
  expiryDate?: string;
  message?: string;
}

export interface UploadedPdfFile {
  id: string;
  name: string;
  size: number;
  arrayBuffer: ArrayBuffer;
  hash: string;
  pageCount: number;
  isDamaged: boolean;
  errorMessage?: string;
  matchedRequirementId?: string;
  isDuplicate: boolean;
  duplicateGroupIds: string[];
}

export interface ValidationSummary {
  okCount: number;
  missingCount: number;
  expiredCount: number;
  expiryNeededCount: number;
  notProvidedCount: number;
  duplicateIssuesCount: number;
  blockingIssuesCount: number;
  canGeneratePackage: boolean;
  blockingReasons: string[];
}

export interface PackageGenerationOptions {
  includeIndexPage: boolean;
  includeDigitalSeal: boolean;
  sealDataUrl?: string;
  signatoryName?: string;
  signatoryDesignation?: string;
}
