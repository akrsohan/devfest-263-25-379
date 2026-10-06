import React from 'react';
import { Language, Requirement, UploadedPdfFile } from '../types/tender';
import { I18N } from '../utils/i18n';
import {
  FileText,
  Trash2,
  AlertTriangle,
  Copy,
  Link,
  Unlink,
  CheckCircle,
  Hash,
  ShieldAlert,
} from 'lucide-react';

interface UploadedFilesListProps {
  language: Language;
  files: UploadedPdfFile[];
  requirements: Requirement[];
  matches: Record<string, string>; // reqId -> fileId
  onRemoveFile: (fileId: string) => void;
  onMatchChange: (requirementId: string, fileId: string | null) => void;
  onAutoMatch: () => void;
  autoMatchAvailableCount: number;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export const UploadedFilesList: React.FC<UploadedFilesListProps> = ({
  language,
  files,
  requirements,
  matches,
  onRemoveFile,
  onMatchChange,
  onAutoMatch,
  autoMatchAvailableCount,
}) => {
  const t = I18N[language];

  // Invert matches map: fileId -> reqId
  const fileToReqMap = new Map<string, string>();
  Object.entries(matches).forEach(([reqId, fileId]) => {
    if (fileId) fileToReqMap.set(fileId, reqId);
  });

  const reqMap = new Map<string, Requirement>();
  requirements.forEach(r => reqMap.set(r.id, r));

  if (files.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden mb-6">
      {/* Header bar */}
      <div className="px-4 sm:px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <div>
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>{t.uploadedFilesTitle}</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-700">
              {files.length}
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.uploadedFilesSubtitle}
          </p>
        </div>

        {/* Auto Match Action Button */}
        {autoMatchAvailableCount > 0 && (
          <button
            onClick={onAutoMatch}
            className="w-full sm:w-auto px-3.5 py-2 min-h-[38px] text-xs font-semibold rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            title="Auto-match unassigned files based on filename similarity"
          >
            <Link className="w-3.5 h-3.5" />
            <span>{t.autoMatchBtn} ({autoMatchAvailableCount})</span>
          </button>
        )}
      </div>

      {/* Mobile Card Layout (< 768px) */}
      <div className="block md:hidden divide-y divide-slate-100">
        {files.map((file) => {
          const matchedReqId = fileToReqMap.get(file.id);
          const matchedReq = matchedReqId ? reqMap.get(matchedReqId) : undefined;

          return (
            <div
              key={file.id}
              className={`p-3.5 sm:p-4 space-y-2.5 transition-colors ${
                file.isDuplicate ? 'bg-amber-50/40' : file.isDamaged ? 'bg-red-50/40' : 'bg-white'
              }`}
            >
              {/* Row 1: Filename + Remove Button */}
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  <div className={`p-1.5 rounded shrink-0 mt-0.5 ${
                    file.isDamaged
                      ? 'bg-red-100 text-red-600'
                      : file.isDuplicate
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-blue-50 text-blue-600'
                  }`}>
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-slate-900 break-words text-xs leading-snug">
                      {file.name}
                    </h4>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveFile(file.id)}
                  className="p-2 min-h-[40px] min-w-[40px] text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0 flex items-center justify-center"
                  title="Remove file from upload list"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Row 2: Metadata Pills */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                {file.isDamaged ? (
                  <span className="px-2 py-0.5 rounded-full font-semibold bg-red-100 text-red-700">
                    Unreadable
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-700 font-mono">
                    {file.pageCount} {t.pagesUnit}
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                  {formatBytes(file.size)}
                </span>
                <span
                  className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-mono text-[10px]"
                  title={`SHA-256: ${file.hash}`}
                >
                  HASH: {file.hash.substring(0, 8)}...{file.hash.substring(file.hash.length - 4)}
                </span>
              </div>

              {/* Warnings */}
              {file.isDuplicate && (
                <div className="flex items-center gap-1.5 text-[11px] text-amber-800 font-medium bg-amber-100/70 p-2 rounded-lg border border-amber-200">
                  <Copy className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{t.duplicateDetected}: Duplicate file cannot be matched.</span>
                </div>
              )}
              {file.isDamaged && (
                <div className="flex items-center gap-1.5 text-[11px] text-red-800 font-medium bg-red-100/70 p-2 rounded-lg border border-red-200">
                  <ShieldAlert className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span>{file.errorMessage || t.unreadablePdf}</span>
                </div>
              )}

              {/* Row 3: Matching Dropdown */}
              {!file.isDamaged && !file.isDuplicate && (
                <div className="pt-1">
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Matched Requirement:
                  </label>
                  <div className="flex items-center gap-1.5">
                    <select
                      value={matchedReqId || ''}
                      onChange={(e) => {
                        const newReqId = e.target.value;
                        if (newReqId === '') {
                          if (matchedReqId) onMatchChange(matchedReqId, null);
                        } else {
                          onMatchChange(newReqId, file.id);
                        }
                      }}
                      className={`w-full text-xs py-2 px-2.5 min-h-[42px] border rounded-lg font-medium cursor-pointer ${
                        matchedReq
                          ? 'bg-emerald-50 text-emerald-950 border-emerald-300'
                          : 'bg-white text-slate-700 border-slate-300'
                      }`}
                    >
                      <option value="">-- {t.matchFilePrompt} --</option>
                      {requirements.map((req) => {
                        const isCurrent = matchedReqId === req.id;
                        const isAssignedToOther = matches[req.id] && matches[req.id] !== file.id;
                        const title = language === 'bn' ? req.title_bn : req.title_en;
                        return (
                          <option
                            key={req.id}
                            value={req.id}
                            disabled={Boolean(isAssignedToOther)}
                          >
                            #{req.order}: {title} {isAssignedToOther ? '(Assigned)' : ''}
                          </option>
                        );
                      })}
                    </select>
                    {matchedReqId && (
                      <button
                        type="button"
                        onClick={() => onMatchChange(matchedReqId, null)}
                        className="p-2 min-h-[42px] min-w-[42px] text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0 flex items-center justify-center border border-slate-200"
                        title={t.unlinkFile}
                      >
                        <Unlink className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop Table View (>= 768px) */}
      <div className="hidden md:block w-full max-w-full overflow-x-auto">
        <table className="min-w-full text-left text-xs">
          <thead className="bg-slate-50/60 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
            <tr>
              <th className="py-2.5 px-4">Filename</th>
              <th className="py-2.5 px-3">Pages</th>
              <th className="py-2.5 px-3">Size</th>
              <th className="py-2.5 px-3">SHA-256 Hash</th>
              <th className="py-2.5 px-3">Matched Requirement</th>
              <th className="py-2.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {files.map((file) => {
              const matchedReqId = fileToReqMap.get(file.id);
              const matchedReq = matchedReqId ? reqMap.get(matchedReqId) : undefined;

              return (
                <tr
                  key={file.id}
                  className={`hover:bg-slate-50/70 transition-colors ${
                    file.isDuplicate ? 'bg-amber-50/40' : file.isDamaged ? 'bg-red-50/40' : ''
                  }`}
                >
                  {/* Filename & status badges */}
                  <td className="py-3 px-4 min-w-[200px]">
                    <div className="flex items-start gap-2.5">
                      <div className={`p-1.5 rounded shrink-0 mt-0.5 ${
                        file.isDamaged
                          ? 'bg-red-100 text-red-600'
                          : file.isDuplicate
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-50 text-blue-600'
                      }`}>
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-800 break-words text-xs" title={file.name}>
                          {file.name}
                        </div>

                        {/* Duplicate Warning */}
                        {file.isDuplicate && (
                          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-amber-800 font-medium bg-amber-100/70 px-2 py-0.5 rounded border border-amber-200">
                            <Copy className="w-3 h-3 text-amber-600 shrink-0" />
                            <span>
                              {t.duplicateDetected}: Identical file contents. Cannot be matched.
                            </span>
                          </div>
                        )}

                        {/* Corrupted / Password-protected Warning */}
                        {file.isDamaged && (
                          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-red-800 font-medium bg-red-100/70 px-2 py-0.5 rounded border border-red-200">
                            <ShieldAlert className="w-3 h-3 text-red-600 shrink-0" />
                            <span>{file.errorMessage || t.unreadablePdf}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Page count */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    {file.isDamaged ? (
                      <span className="text-red-500 font-semibold text-[11px]">Unreadable</span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 font-mono">
                        {file.pageCount} {t.pagesUnit}
                      </span>
                    )}
                  </td>

                  {/* Size */}
                  <td className="py-3 px-3 whitespace-nowrap text-slate-500 font-mono">
                    {formatBytes(file.size)}
                  </td>

                  {/* SHA-256 fingerprint */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span
                      className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded"
                      title={`SHA-256: ${file.hash}`}
                    >
                      {file.hash.substring(0, 8)}...{file.hash.substring(file.hash.length - 6)}
                    </span>
                  </td>

                  {/* Matched Requirement Selector */}
                  <td className="py-3 px-3 min-w-[200px]">
                    {file.isDamaged ? (
                      <span className="text-slate-400 italic text-[11px]">Cannot match damaged file</span>
                    ) : file.isDuplicate ? (
                      <span className="text-amber-700 italic text-[11px] font-medium">
                        Duplicate file blocked from matching
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <select
                          value={matchedReqId || ''}
                          onChange={(e) => {
                            const newReqId = e.target.value;
                            if (newReqId === '') {
                              if (matchedReqId) {
                                onMatchChange(matchedReqId, null);
                              }
                            } else {
                              onMatchChange(newReqId, file.id);
                            }
                          }}
                          className={`w-full text-xs py-1.5 px-2 border rounded-md font-medium cursor-pointer ${
                            matchedReq
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                              : 'bg-white text-slate-600 border-slate-300'
                          }`}
                        >
                          <option value="">{t.matchFilePrompt}</option>
                          {requirements.map((req) => {
                            const isCurrent = matchedReqId === req.id;
                            const isAssignedToOther = matches[req.id] && matches[req.id] !== file.id;
                            const title = language === 'bn' ? req.title_bn : req.title_en;

                            return (
                              <option
                                key={req.id}
                                value={req.id}
                                disabled={Boolean(isAssignedToOther)}
                              >
                                #{req.order}: {title} {isAssignedToOther ? '(Assigned to another file)' : ''}
                              </option>
                            );
                          })}
                        </select>

                        {matchedReqId && (
                          <button
                            type="button"
                            onClick={() => onMatchChange(matchedReqId, null)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                            title={t.unlinkFile}
                          >
                            <Unlink className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Actions (Remove file) */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onRemoveFile(file.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                      title="Remove file from upload list"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
