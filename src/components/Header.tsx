import React from 'react';
import { Language } from '../types/tender';
import { I18N } from '../utils/i18n';
import {
  FileText,
  Globe,
  Save,
  FolderOpen,
  RotateCcw,
  Download,
  UploadCloud,
  FileCheck2,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onSaveSession: () => void;
  onLoadSession: () => void;
  hasSavedSession: boolean;
  onResetAll: () => void;
  onExportCsv: () => void;
  onUploadRequirementsClick: () => void;
  onLoadDemoPack: () => void;
  onSwitchTender: () => void;
  activeTenderId: string;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  onSaveSession,
  onLoadSession,
  hasSavedSession,
  onResetAll,
  onExportCsv,
  onUploadRequirementsClick,
  onLoadDemoPack,
  onSwitchTender,
  activeTenderId,
}) => {
  const t = I18N[language];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-2.5 sm:py-3 gap-2.5 sm:gap-3">
          {/* Brand & Title */}
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-inner shrink-0">
              <FileCheck2 className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                <h1 className="text-sm sm:text-base md:text-xl font-bold tracking-tight text-white leading-tight">
                  {t.appName}
                </h1>
                <span className="px-1.5 py-0.5 text-[10px] sm:text-xs font-semibold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 whitespace-nowrap">
                  Client-Side Only
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 hidden sm:block truncate">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Right Toolbar */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full md:w-auto justify-start md:justify-end">
            {/* Quick Demo Pack Loader */}
            <button
              onClick={onLoadDemoPack}
              className="px-2.5 sm:px-3 py-1.5 min-h-[36px] text-xs font-medium bg-emerald-600/90 hover:bg-emerald-600 text-white rounded-md flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              title="Instantly generate and attach valid sample PDF files for quick evaluation"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
              <span className="whitespace-nowrap">{t.loadDemoPackBtn}</span>
            </button>

            {/* Switch Tender Sample */}
            <button
              onClick={onSwitchTender}
              className="px-2 sm:px-2.5 py-1.5 min-h-[36px] text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Toggle between sample tender specifications"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="hidden xl:inline">{t.loadAlternateTenderBtn}</span>
              <span className="xl:hidden whitespace-nowrap">Tender ({activeTenderId})</span>
            </button>

            {/* Custom Requirements Upload */}
            <button
              onClick={onUploadRequirementsClick}
              className="px-2 sm:px-2.5 py-1.5 min-h-[36px] text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Upload your own requirements.json file"
            >
              <UploadCloud className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="whitespace-nowrap">JSON</span>
            </button>

            {/* Save / Restore Session */}
            <div className="flex items-center bg-slate-800/80 rounded-md border border-slate-700 p-0.5 min-h-[36px]">
              <button
                onClick={onSaveSession}
                className="px-2 py-1 min-h-[32px] text-xs text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors flex items-center gap-1 cursor-pointer"
                title={t.saveProjectBtn}
              >
                <Save className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="hidden lg:inline whitespace-nowrap">{t.saveProjectBtn}</span>
              </button>
              {hasSavedSession && (
                <button
                  onClick={onLoadSession}
                  className="px-2 py-1 min-h-[32px] text-xs text-emerald-400 hover:text-emerald-300 hover:bg-slate-700 rounded transition-colors flex items-center gap-1 cursor-pointer"
                  title={t.reopenProjectBtn}
                >
                  <FolderOpen className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden lg:inline whitespace-nowrap">{t.reopenProjectBtn}</span>
                </button>
              )}
            </div>

            {/* Export CSV */}
            <button
              onClick={onExportCsv}
              className="px-2 sm:px-2.5 py-1.5 min-h-[36px] text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              title={t.exportCsvBtn}
            >
              <Download className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="whitespace-nowrap">CSV</span>
            </button>

            {/* Language Switch: EN <-> BN */}
            <div className="flex items-center bg-slate-800 rounded-md border border-slate-700 p-0.5 min-h-[36px]">
              <button
                onClick={() => onLanguageChange('en')}
                className={`px-2 py-1 min-h-[32px] text-xs font-semibold rounded transition-colors cursor-pointer ${
                  language === 'en'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => onLanguageChange('bn')}
                className={`px-2 py-1 min-h-[32px] text-xs font-semibold rounded transition-colors cursor-pointer ${
                  language === 'bn'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                বাংলা
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
