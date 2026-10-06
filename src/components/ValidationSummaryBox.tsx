import React, { useState } from 'react';
import { Language, ValidationSummary } from '../types/tender';
import { I18N } from '../utils/i18n';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Copy,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  FileCheck,
} from 'lucide-react';

interface ValidationSummaryBoxProps {
  language: Language;
  summary: ValidationSummary;
  onCheckEverything: () => void;
  onGeneratePackageClick: () => void;
  isGenerating: boolean;
}

export const ValidationSummaryBox: React.FC<ValidationSummaryBoxProps> = ({
  language,
  summary,
  onCheckEverything,
  onGeneratePackageClick,
  isGenerating,
}) => {
  const t = I18N[language];
  const [justChecked, setJustChecked] = useState(false);

  const handleManualCheck = () => {
    onCheckEverything();
    setJustChecked(true);
    setTimeout(() => setJustChecked(false), 1200);
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden mb-6">
      {/* Header bar with Check Everything button */}
      <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-lg ${
            summary.canGeneratePackage ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
          }`}>
            {summary.canGeneratePackage ? (
              <ShieldCheck className="w-5 h-5" />
            ) : (
              <ShieldAlert className="w-5 h-5" />
            )}
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Package Compliance & Audit Status
            </h3>
            <p className="text-xs text-slate-500">
              Continuously validated against tender submission deadline & duplicate rules
            </p>
          </div>
        </div>

        {/* Prominent Check Everything Button */}
        <button
          onClick={handleManualCheck}
          className="w-full sm:w-auto px-4 py-2.5 min-h-[40px] text-xs sm:text-sm font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-4 h-4 text-blue-400 ${justChecked ? 'animate-spin' : ''}`} />
          <span>{t.checkEverything}</span>
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="p-3.5 sm:p-5 lg:p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 mb-5 sm:mb-6">
          {/* OK documents */}
          <div className="p-2.5 sm:p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-lg sm:text-xl md:text-2xl font-bold font-mono text-emerald-900 leading-tight">
                {summary.okCount}
              </div>
              <div className="text-[11px] sm:text-xs font-semibold text-emerald-700 truncate">
                OK
              </div>
            </div>
          </div>

          {/* Missing documents */}
          <div className="p-2.5 sm:p-3.5 rounded-xl bg-red-50/70 border border-red-200/80 flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="p-1.5 sm:p-2 rounded-lg bg-red-100 text-red-700 shrink-0">
              <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-lg sm:text-xl md:text-2xl font-bold font-mono text-red-900 leading-tight">
                {summary.missingCount}
              </div>
              <div className="text-[11px] sm:text-xs font-semibold text-red-700 truncate">
                Missing
              </div>
            </div>
          </div>

          {/* Expiry date needed */}
          <div className="p-2.5 sm:p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="p-1.5 sm:p-2 rounded-lg bg-amber-100 text-amber-700 shrink-0">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-lg sm:text-xl md:text-2xl font-bold font-mono text-amber-900 leading-tight">
                {summary.expiryNeededCount}
              </div>
              <div className="text-[11px] sm:text-xs font-semibold text-amber-800 truncate">
                Date Needed
              </div>
            </div>
          </div>

          {/* Expired documents */}
          <div className="p-2.5 sm:p-3.5 rounded-xl bg-rose-50/70 border border-rose-200/80 flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="p-1.5 sm:p-2 rounded-lg bg-rose-100 text-rose-700 shrink-0">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-lg sm:text-xl md:text-2xl font-bold font-mono text-rose-900 leading-tight">
                {summary.expiredCount}
              </div>
              <div className="text-[11px] sm:text-xs font-semibold text-rose-800 truncate">
                Expired
              </div>
            </div>
          </div>

          {/* Duplicate Issues */}
          <div className="col-span-2 sm:col-span-1 md:col-span-1 p-2.5 sm:p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 sm:gap-3 min-w-0">
            <div className={`p-1.5 sm:p-2 rounded-lg shrink-0 ${
              summary.duplicateIssuesCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'
            }`}>
              <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className={`text-lg sm:text-xl md:text-2xl font-bold font-mono leading-tight ${
                summary.duplicateIssuesCount > 0 ? 'text-amber-900' : 'text-slate-800'
              }`}>
                {summary.duplicateIssuesCount}
              </div>
              <div className="text-[11px] sm:text-xs font-semibold text-slate-600 truncate">
                Duplicate Issues
              </div>
            </div>
          </div>
        </div>

        {/* Status Callout Banner */}
        {summary.canGeneratePackage ? (
          <div className="p-3.5 sm:p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5 sm:gap-4">
            <div className="flex items-start gap-2.5 sm:gap-3 min-w-0 flex-1">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <h4 className="text-xs sm:text-sm font-bold text-emerald-900">
                  {t.packageReady}
                </h4>
                <p className="text-[11px] sm:text-xs text-emerald-700 mt-0.5 break-words">
                  {t.allClearNotice} Cover page, dynamic index, and Page X of Y footers will be formatted automatically.
                </p>
              </div>
            </div>

            {/* Primary Generate Package Action Button */}
            <button
              onClick={onGeneratePackageClick}
              disabled={isGenerating}
              className="w-full sm:w-auto px-5 sm:px-6 py-3 min-h-[44px] text-xs sm:text-sm font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>{t.generatingPackage}</span>
                </>
              ) : (
                <>
                  <FileCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>{t.generatePackage}</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="p-3.5 sm:p-4 rounded-xl bg-red-50/80 border border-red-200">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3.5 sm:gap-4">
              <div className="flex items-start gap-2.5 sm:gap-3 min-w-0 flex-1">
                <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs sm:text-sm font-bold text-red-900 break-words">
                    Package generation is blocked ({summary.blockingIssuesCount} blocking {summary.blockingIssuesCount === 1 ? 'issue' : 'issues'} remain)
                  </h4>
                  <p className="text-[11px] sm:text-xs text-red-700 mt-1 break-words">
                    All mandatory documents must be matched, valid, and free of duplicates before final package compilation.
                  </p>

                  {/* List of blocking reasons */}
                  <ul className="mt-2.5 space-y-1 text-[11px] sm:text-xs text-red-800 list-disc list-inside">
                    {summary.blockingReasons.map((reason, idx) => (
                      <li key={idx} className="font-medium break-words">
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Disabled Generate Button */}
              <div className="w-full sm:w-auto shrink-0 flex flex-col items-stretch sm:items-end">
                <button
                  disabled
                  className="w-full sm:w-auto px-4 sm:px-5 py-2.5 min-h-[40px] text-xs sm:text-sm font-semibold rounded-lg bg-slate-300 text-slate-500 cursor-not-allowed flex items-center justify-center gap-2"
                  title="Resolve blocking issues above to enable package generation"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>{t.generatePackage}</span>
                </button>
                <span className="text-[10px] sm:text-[11px] text-slate-500 mt-1.5 font-medium text-center sm:text-right">
                  {summary.blockingIssuesCount} blocking issues remaining
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
