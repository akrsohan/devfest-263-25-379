import React from 'react';
import {
  Language,
  Requirement,
  RequirementValidationResult,
  TenderData,
  UploadedPdfFile,
} from '../types/tender';
import { I18N } from '../utils/i18n';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  HelpCircle,
  XCircle,
  FileText,
  Unlink,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface RequirementChecklistProps {
  tender: TenderData;
  language: Language;
  validationResults: RequirementValidationResult[];
  uploadedFiles: UploadedPdfFile[];
  matches: Record<string, string>; // reqId -> fileId
  expiryDates: Record<string, string>; // reqId -> 'YYYY-MM-DD'
  onMatchChange: (requirementId: string, fileId: string | null) => void;
  onExpiryDateChange: (requirementId: string, date: string) => void;
}

export const RequirementChecklist: React.FC<RequirementChecklistProps> = ({
  tender,
  language,
  validationResults,
  uploadedFiles,
  matches,
  expiryDates,
  onMatchChange,
  onExpiryDateChange,
}) => {
  const t = I18N[language];

  // Inverted map to prevent matching one file to multiple requirements
  const fileToReqMap = new Map<string, string>();
  Object.entries(matches).forEach(([rId, fId]) => {
    if (fId) fileToReqMap.set(fId, rId);
  });

  const fileMap = new Map<string, UploadedPdfFile>();
  uploadedFiles.forEach(f => fileMap.set(f.id, f));

  // Helper to get status badge rendering
  const renderStatusBadge = (res: RequirementValidationResult) => {
    switch (res.status) {
      case 'OK':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            {t.statusOk}
          </span>
        );
      case 'Missing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300 shadow-2xs">
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            {t.statusMissing}
          </span>
        );
      case 'Expiry date needed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            {t.statusExpiryNeeded}
          </span>
        );
      case 'Expired':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300 shadow-2xs">
            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
            {t.statusExpired}
          </span>
        );
      case 'Not provided':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            {t.statusNotProvided}
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden mb-6">
      {/* Header */}
      <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <span>{t.checklistTitle}</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
              {validationResults.length} Items Sorted by Order
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.checklistSubtitle}
          </p>
        </div>
      </div>

      {/* Requirements List */}
      <div className="divide-y divide-slate-100">
        {validationResults.map((result) => {
          const req = result.requirement;
          const matchedFile = result.matchedFileId ? fileMap.get(result.matchedFileId) : undefined;
          const expiryDate = expiryDates[req.id] || '';
          const primaryTitle = language === 'bn' ? req.title_bn : req.title_en;
          const secondaryTitle = language === 'bn' ? req.title_en : req.title_bn;

          return (
            <div
              key={req.id}
              className={`p-4 sm:p-5 transition-colors ${
                result.status === 'OK'
                  ? 'bg-white hover:bg-emerald-50/20'
                  : result.isBlocking
                  ? 'bg-red-50/20 hover:bg-red-50/30'
                  : 'bg-slate-50/40 hover:bg-slate-50'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Left: Document Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    {/* Order badge */}
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-white text-xs font-bold font-mono flex items-center justify-center shrink-0">
                      {req.order}
                    </span>

                    {/* Status Badge */}
                    {renderStatusBadge(result)}

                    {/* Mandatory / Optional badge */}
                    {req.mandatory ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
                        {t.mandatory}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        {t.optional}
                      </span>
                    )}

                    {/* Expiry badge */}
                    {req.has_expiry ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                        {t.expiryRequired}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-500">
                        {t.noExpiryNeeded}
                      </span>
                    )}
                  </div>

                  {/* Document Title (Primary & Secondary language) */}
                  <div className="mt-1">
                    <h4 className="text-sm font-bold text-slate-900 leading-snug">
                      {primaryTitle}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {secondaryTitle}
                    </p>
                  </div>

                  {/* Status explanation message */}
                  {result.message && (
                    <div className={`mt-2 text-xs flex items-center gap-1.5 ${
                      result.isBlocking ? 'text-red-700 font-medium' : 'text-slate-600'
                    }`}>
                      {result.isBlocking ? (
                        <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      )}
                      <span>{result.message}</span>
                    </div>
                  )}
                </div>

                {/* Right: Matching & Expiry Controls */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:w-[480px] shrink-0">
                  {/* File Matcher Dropdown */}
                  <div className="flex-1 min-w-[220px]">
                    <div className="flex items-center gap-1.5">
                      <select
                        value={matchedFile?.id || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          onMatchChange(req.id, val === '' ? null : val);
                        }}
                        className={`w-full text-xs py-2 px-3 border rounded-lg font-medium cursor-pointer transition-colors ${
                          matchedFile
                            ? 'bg-emerald-50/80 text-emerald-950 border-emerald-300 focus:border-emerald-500'
                            : 'bg-white text-slate-600 border-slate-300 focus:border-blue-500'
                        }`}
                      >
                        <option value="">-- {t.matchFilePrompt} --</option>
                        {uploadedFiles.map((file) => {
                          const isAssignedToOther = fileToReqMap.get(file.id) && fileToReqMap.get(file.id) !== req.id;
                          return (
                            <option
                              key={file.id}
                              value={file.id}
                              disabled={file.isDuplicate || file.isDamaged || Boolean(isAssignedToOther)}
                            >
                              {file.name} ({file.pageCount} pgs)
                              {file.isDuplicate ? ' [DUPLICATE]' : ''}
                              {file.isDamaged ? ' [UNREADABLE]' : ''}
                              {isAssignedToOther ? ' [Assigned]' : ''}
                            </option>
                          );
                        })}
                      </select>

                      {matchedFile && (
                        <button
                          type="button"
                          onClick={() => onMatchChange(req.id, null)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0"
                          title={t.unlinkFile}
                        >
                          <Unlink className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expiry Date Input (Shown when has_expiry = true AND file is matched) */}
                  {req.has_expiry && matchedFile && (
                    <div className="w-full sm:w-[210px] shrink-0">
                      <div className="flex items-center gap-1">
                        <div className="relative flex-1">
                          <input
                            type="date"
                            value={expiryDate}
                            onChange={(e) => onExpiryDateChange(req.id, e.target.value)}
                            title={`Document Expiry Date (Tender Deadline: ${tender.submission_deadline})`}
                            className={`w-full text-xs py-1.5 px-2 pl-7 border rounded-md font-mono transition-colors ${
                              !expiryDate
                                ? 'bg-amber-50 text-amber-900 border-amber-300 focus:border-amber-500'
                                : expiryDate < tender.submission_deadline
                                ? 'bg-red-50 text-red-900 border-red-300 focus:border-red-500'
                                : 'bg-emerald-50 text-emerald-900 border-emerald-300 focus:border-emerald-500'
                            }`}
                          />
                          <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5 pointer-events-none" />
                        </div>

                        {/* Quick preset date helper buttons for quick evaluation */}
                        <button
                          type="button"
                          onClick={() => onExpiryDateChange(req.id, tender.submission_deadline)}
                          className="p-1.5 text-[10px] bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-800 rounded border border-slate-200 cursor-pointer"
                          title="Set expiry date equal to deadline (Tests valid condition)"
                        >
                          =Deadline
                        </button>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                        <span>Min: {tender.submission_deadline}</span>
                        {expiryDate && (
                          <span className={expiryDate >= tender.submission_deadline ? 'text-emerald-600 font-semibold' : 'text-red-600 font-semibold'}>
                            {expiryDate >= tender.submission_deadline ? 'Valid' : 'Expired'}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
