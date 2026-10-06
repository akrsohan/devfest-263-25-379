import React, { useState } from 'react';
import {
  Language,
  PackageGenerationOptions,
  Requirement,
  TenderData,
  UploadedPdfFile,
} from '../types/tender';
import { I18N } from '../utils/i18n';
import {
  FileText,
  Download,
  CheckCircle2,
  X,
  FileCheck,
  ShieldCheck,
  BookOpen,
  Stamp,
  Layers,
  Sparkles,
} from 'lucide-react';

interface GeneratePackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  tender: TenderData;
  language: Language;
  matchedList: Array<{
    requirement: Requirement;
    file: UploadedPdfFile;
    expiryDate?: string;
  }>;
  onGenerate: (options: PackageGenerationOptions) => Promise<void>;
  isGenerating: boolean;
  generatedBlobUrl?: string;
  generatedFilename?: string;
  generatedTotalPages?: number;
}

export const GeneratePackageModal: React.FC<GeneratePackageModalProps> = ({
  isOpen,
  onClose,
  tender,
  language,
  matchedList,
  onGenerate,
  isGenerating,
  generatedBlobUrl,
  generatedFilename,
  generatedTotalPages,
}) => {
  const t = I18N[language];
  const [includeIndex, setIncludeIndex] = useState(true);
  const [includeSeal, setIncludeSeal] = useState(true);
  const [signatoryName, setSignatoryName] = useState(tender.bidder || 'Authorized Signatory');

  if (!isOpen) return null;

  // Calculate estimated total pages
  const coverCount = 1;
  const indexCount = includeIndex ? 1 : 0;
  const docsPagesCount = matchedList.reduce((acc, m) => acc + m.file.pageCount, 0);
  const estimatedTotal = coverCount + indexCount + docsPagesCount;

  // Calculate page starts for preview table
  let currentStart = coverCount + indexCount + 1;
  const previewItems = matchedList
    .sort((a, b) => a.requirement.order - b.requirement.order)
    .map((m) => {
      const start = currentStart;
      currentStart += m.file.pageCount;
      return {
        ...m,
        startPage: start,
      };
    });

  const handleStartGeneration = async () => {
    await onGenerate({
      includeIndexPage: includeIndex,
      includeDigitalSeal: includeSeal,
      signatoryName,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Header */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0">
              <FileCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-base font-bold text-white break-words leading-tight">
                Compile & Download Final Tender Package
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                Target Output: <span className="font-mono text-emerald-400">{tender.tender_id}_Package.pdf</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-md transition-colors cursor-pointer shrink-0 min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-5 flex-1 overflow-y-auto text-xs sm:text-sm">
          {/* Generation Success Banner if already generated */}
          {generatedBlobUrl && (
            <div className="p-3.5 sm:p-4 rounded-xl bg-emerald-50 border border-emerald-300 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-emerald-950 text-xs sm:text-sm">
                    PDF Package Ready! ({generatedTotalPages} Total Pages)
                  </div>
                  <div className="text-[11px] sm:text-xs text-emerald-700 break-all">
                    Filename: <span className="font-mono font-medium">{generatedFilename}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                <a
                  href={generatedBlobUrl}
                  download={generatedFilename}
                  className="flex-1 sm:flex-none px-4 py-2.5 min-h-[40px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer text-center"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </a>
                <a
                  href={generatedBlobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none px-3.5 py-2.5 min-h-[40px] bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg font-medium text-xs flex items-center justify-center gap-1 cursor-pointer text-center"
                >
                  <span>Preview</span>
                </a>
              </div>
            </div>
          )}

          {/* Package Composition Settings */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Package Assembly Configuration</span>
            </h4>

            {/* Bonus 1 Toggle: Table of Contents */}
            <label className="flex items-start gap-3 p-2.5 rounded-lg bg-white border border-slate-200 cursor-pointer hover:bg-slate-50/70">
              <input
                type="checkbox"
                checked={includeIndex}
                onChange={(e) => setIncludeIndex(e.target.checked)}
                className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <div className="flex-1">
                <div className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  <span>Include Page 2 Table of Contents / Index (Bonus Feature)</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Generates an executive index sheet with exact starting page numbers for each document.
                </div>
              </div>
            </label>

            {/* Bonus 6 Toggle: Digital Verification Stamp */}
            <label className="flex items-start gap-3 p-2.5 rounded-lg bg-white border border-slate-200 cursor-pointer hover:bg-slate-50/70">
              <input
                type="checkbox"
                checked={includeSeal}
                onChange={(e) => setIncludeSeal(e.target.checked)}
                className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <div className="flex-1">
                <div className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                  <Stamp className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Include Official Bidder Compliance Stamp on Cover</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Embeds verified bid dossier certification seal and signatory details.
                </div>
              </div>
            </label>

            {/* Signatory Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Authorized Signatory / Bidder Representative Name
              </label>
              <input
                type="text"
                value={signatoryName}
                onChange={(e) => setSignatoryName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                placeholder="e.g., Managing Director / Apex Solutions"
              />
            </div>
          </div>

          {/* Included Documents List Preview */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-100/70 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Included Documents ({matchedList.length} total)</span>
              <span className="font-mono text-blue-600">
                Estimated ~{estimatedTotal} Pages Total
              </span>
            </div>

            <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 text-xs">
              <div className="px-4 py-2 bg-blue-50/40 flex items-center justify-between font-medium text-slate-700">
                <span>Page 1: Executive Cover Page</span>
                <span className="text-slate-500">1 Page</span>
              </div>
              {includeIndex && (
                <div className="px-4 py-2 bg-blue-50/20 flex items-center justify-between font-medium text-slate-700">
                  <span>Page 2: Table of Contents / Index</span>
                  <span className="text-slate-500">1 Page</span>
                </div>
              )}
              {previewItems.map((item) => (
                <div
                  key={item.requirement.id}
                  className="px-4 py-2 flex items-center justify-between hover:bg-slate-50"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <span className="font-bold text-slate-800">
                      #{item.requirement.order}. {item.requirement.title_en}
                    </span>
                    <span className="text-slate-400 block text-[11px] truncate">
                      {item.file.name}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-blue-700 font-mono">
                      Starts on Pg {item.startPage}
                    </span>
                    <span className="block text-[11px] text-slate-400 font-mono">
                      ({item.file.pageCount} pgs)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Page Notice */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-800">Universal Page Footer Rule:</span> Every single page
              (Cover, Index, and original documents) will include the non-destructive footer{' '}
              <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px] text-slate-800 font-mono">
                {tender.tender_id} | Page X of {estimatedTotal}
              </code>
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="bg-slate-50 px-4 sm:px-6 py-3.5 sm:py-4 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 min-h-[40px] text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer text-center"
          >
            Close
          </button>
          <button
            onClick={handleStartGeneration}
            disabled={isGenerating}
            className="w-full sm:w-auto px-5 py-2.5 min-h-[40px] text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white rounded-lg flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer text-center"
          >
            {isGenerating ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                <span>Assembling PDF Package...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 shrink-0" />
                <span>Compile & Download Final Package</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
