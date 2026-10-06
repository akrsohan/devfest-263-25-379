import React, { useEffect, useMemo, useState } from 'react';
import {
  Language,
  PackageGenerationOptions,
  Requirement,
  TenderData,
  UploadedPdfFile,
} from './types/tender';
import { ALTERNATE_TENDER_DATA, DEFAULT_TENDER_DATA } from './utils/sampleData';
import { I18N } from './utils/i18n';
import { calculateFileHash } from './utils/hash';
import { readPdfPageCount, generateTenderPackage } from './utils/pdfPackageBuilder';
import { validateAllRequirements } from './utils/validation';
import { getAutoMatchSuggestions } from './utils/matching';
import { exportChecklistToCSV } from './utils/csvExport';
import { createMockPdf } from './utils/pdfGenerator';

import { Header } from './components/Header';
import { TenderSummary } from './components/TenderSummary';
import { UploadZone } from './components/UploadZone';
import { UploadedFilesList } from './components/UploadedFilesList';
import { RequirementChecklist } from './components/RequirementChecklist';
import { ValidationSummaryBox } from './components/ValidationSummaryBox';
import { GeneratePackageModal } from './components/GeneratePackageModal';
import { UploadRequirementsModal } from './components/UploadRequirementsModal';

const STORAGE_KEY = 'tender_builder_state_v1';

export default function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [tender, setTender] = useState<TenderData>(DEFAULT_TENDER_DATA);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedPdfFile[]>([]);
  const [matches, setMatches] = useState<Record<string, string>>({}); // reqId -> fileId
  const [expiryDates, setExpiryDates] = useState<Record<string, string>>({}); // reqId -> 'YYYY-MM-DD'

  // Modals & Generation State
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [isReqModalOpen, setIsReqModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPdfBlobUrl, setGeneratedPdfBlobUrl] = useState<string | undefined>(undefined);
  const [generatedFilename, setGeneratedFilename] = useState<string | undefined>(undefined);
  const [generatedTotalPages, setGeneratedTotalPages] = useState<number | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const t = I18N[language];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Re-audit duplicates whenever uploadedFiles changes
  const auditedFiles = useMemo(() => {
    const hashCounts = new Map<string, string[]>();
    uploadedFiles.forEach(f => {
      const arr = hashCounts.get(f.hash) || [];
      arr.push(f.id);
      hashCounts.set(f.hash, arr);
    });

    return uploadedFiles.map(f => {
      const group = hashCounts.get(f.hash) || [];
      const isDup = group.length > 1;
      return {
        ...f,
        isDuplicate: isDup,
        duplicateGroupIds: isDup ? group.filter(id => id !== f.id) : [],
      };
    });
  }, [uploadedFiles]);

  // Clean matches if files were removed or became duplicate
  useEffect(() => {
    const validFileIds = new Set(auditedFiles.filter(f => !f.isDamaged && !f.isDuplicate).map(f => f.id));
    let changed = false;
    const newMatches = { ...matches };

    for (const [rId, fId] of Object.entries(newMatches)) {
      if (!validFileIds.has(fId)) {
        delete newMatches[rId];
        changed = true;
      }
    }

    if (changed) {
      setMatches(newMatches);
    }
  }, [auditedFiles]);

  // Real-time reactive validation
  const { results: validationResults, summary: validationSummary } = useMemo(() => {
    return validateAllRequirements(tender, auditedFiles, matches, expiryDates);
  }, [tender, auditedFiles, matches, expiryDates]);

  // Calculate readiness count
  const mandatoryCount = useMemo(() => {
    return tender.requirements.filter(r => r.mandatory).length;
  }, [tender]);

  // Auto-match suggestions count (Bonus 3)
  const autoMatchSuggestions = useMemo(() => {
    return getAutoMatchSuggestions(auditedFiles, tender.requirements, matches);
  }, [auditedFiles, tender.requirements, matches]);

  // Handlers for file management
  const handleAddFiles = (newFiles: UploadedPdfFile[]) => {
    setUploadedFiles(prev => {
      const combined = [...prev, ...newFiles];

      // Auto-assign high-confidence semantic matches for new unassigned files
      const newMatches = { ...matches };
      const assignedReqs = new Set(Object.keys(newMatches));
      const assignedFiles = new Set(Object.values(newMatches));

      const suggestions = getAutoMatchSuggestions(combined, tender.requirements, newMatches);
      let autoMatchedCount = 0;
      suggestions.forEach(s => {
        if (s.confidence >= 80 && !assignedReqs.has(s.requirementId) && !assignedFiles.has(s.fileId)) {
          newMatches[s.requirementId] = s.fileId;
          assignedReqs.add(s.requirementId);
          assignedFiles.add(s.fileId);
          autoMatchedCount++;
        }
      });

      if (autoMatchedCount > 0) {
        setMatches(newMatches);
      }

      return combined;
    });
    showToast(`Added ${newFiles.length} file(s). Exact content SHA-256 audited.`);
  };

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    // Clear any matches using this file
    setMatches(prev => {
      const updated = { ...prev };
      Object.entries(updated).forEach(([rId, fId]) => {
        if (fId === fileId) delete updated[rId];
      });
      return updated;
    });
  };

  const handleMatchChange = (requirementId: string, fileId: string | null) => {
    setMatches(prev => {
      const updated = { ...prev };

      // If unlinking
      if (!fileId) {
        delete updated[requirementId];
        return updated;
      }

      // If file was linked to another requirement, remove that link first
      Object.entries(updated).forEach(([rId, fId]) => {
        if (fId === fileId && rId !== requirementId) {
          delete updated[rId];
        }
      });

      updated[requirementId] = fileId;
      return updated;
    });
  };

  const handleExpiryDateChange = (requirementId: string, date: string) => {
    setExpiryDates(prev => ({
      ...prev,
      [requirementId]: date,
    }));
  };

  // Smart Auto-Match (Bonus 3)
  const handleApplyAutoMatch = () => {
    if (autoMatchSuggestions.length === 0) return;

    setMatches(prev => {
      const updated = { ...prev };
      autoMatchSuggestions.forEach(s => {
        updated[s.requirementId] = s.fileId;
      });
      return updated;
    });

    showToast(`Auto-matched ${autoMatchSuggestions.length} document(s) by filename similarity!`);
  };

  // Demo Pack Generator for instant competition testing
  const handleLoadDemoPack = async () => {
    showToast('Generating official test PDFs in browser...');

    // Generate real PDFs for the requirements
    const demoSpecs = [
      { name: '01_trade_license_2026.pdf', title: 'Valid Trade License', pages: 1, reqId: 'req_01', expiry: '2027-06-30' },
      { name: '02_tax_clearance_certificate.pdf', title: 'Tax Clearance Certificate', pages: 2, reqId: 'req_02', expiry: '2026-10-30' }, // exact deadline match
      { name: '03_bin_vat_registration.pdf', title: 'VAT Registration Certificate', pages: 1, reqId: 'req_03' },
      { name: '04_incorporation_and_moa.pdf', title: 'Certificate of Incorporation & Memorandum', pages: 4, reqId: 'req_04' },
      { name: '05_audited_financials_2023_2025.pdf', title: 'Audited Financial Statements', pages: 3, reqId: 'req_05' },
      { name: '06_bank_solvency_certificate.pdf', title: 'Bank Solvency & Credit Facility', pages: 1, reqId: 'req_06', expiry: '2027-03-31' },
      { name: '07_experience_certificates.pdf', title: 'Relevant Similar Experience', pages: 2, reqId: 'req_07' },
      { name: '08_maf_authorization_letter.pdf', title: 'Manufacturer Authorization Form', pages: 1, reqId: 'req_08', expiry: '2026-12-31' },
      { name: '09_iso_27001_certificate.pdf', title: 'ISO 27001 Quality Certification', pages: 1, reqId: 'req_09', expiry: '2027-12-31' },
    ];

    const generated: UploadedPdfFile[] = [];
    const newMatches: Record<string, string> = {};
    const newExpiries: Record<string, string> = {};

    for (const spec of demoSpecs) {
      const buffer = await createMockPdf(spec.title, spec.pages);
      const hash = await calculateFileHash(buffer);
      const pageCount = await readPdfPageCount(buffer);

      const fileObj: UploadedPdfFile = {
        id: `demo_${spec.reqId}_${Date.now()}`,
        name: spec.name,
        size: buffer.byteLength,
        arrayBuffer: buffer,
        hash,
        pageCount,
        isDamaged: false,
        isDuplicate: false,
        duplicateGroupIds: [],
      };

      generated.push(fileObj);
      newMatches[spec.reqId] = fileObj.id;
      if (spec.expiry) {
        newExpiries[spec.reqId] = spec.expiry;
      }
    }

    setUploadedFiles(generated);
    setMatches(newMatches);
    setExpiryDates(newExpiries);
    showToast('Loaded 9 verified demo PDF documents with matching & expiry dates!');
  };

  // Add duplicate file demo to test duplicate detection
  const handleAddDuplicateDemo = async () => {
    // Pick the first file or create a pair
    const baseBuffer = await createMockPdf('Relevant Similar Experience', 2);
    const hash = await calculateFileHash(baseBuffer);
    const pageCount = await readPdfPageCount(baseBuffer);

    const fileA: UploadedPdfFile = {
      id: `dup_a_${Date.now()}`,
      name: 'experience_certificate.pdf',
      size: baseBuffer.byteLength,
      arrayBuffer: baseBuffer,
      hash,
      pageCount,
      isDamaged: false,
      isDuplicate: false,
      duplicateGroupIds: [],
    };

    const fileB: UploadedPdfFile = {
      id: `dup_b_${Date.now()}`,
      name: 'experience_certificate (copy).pdf', // different name, identical content!
      size: baseBuffer.byteLength,
      arrayBuffer: baseBuffer,
      hash,
      pageCount,
      isDamaged: false,
      isDuplicate: false,
      duplicateGroupIds: [],
    };

    setUploadedFiles(prev => [...prev, fileA, fileB]);
    showToast('Added two identical PDFs with different filenames to test duplicate audit!');
  };

  // Toggle between sample tenders
  const handleSwitchTender = () => {
    const next = tender.tender_id === DEFAULT_TENDER_DATA.tender_id
      ? ALTERNATE_TENDER_DATA
      : DEFAULT_TENDER_DATA;
    setTender(next);
    setMatches({});
    setExpiryDates({});
    showToast(`Switched to Tender: ${next.tender_id}`);
  };

  // Save session state to localStorage (Bonus 5)
  const handleSaveSession = () => {
    try {
      const state = {
        tender,
        matches,
        expiryDates,
        language,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      showToast(t.savedSuccessfully);
    } catch {
      showToast('Could not save session to local storage.');
    }
  };

  // Load session from localStorage (Bonus 5)
  const handleLoadSession = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        showToast('No saved session found.');
        return;
      }
      const parsed = JSON.parse(raw);
      if (parsed.tender) setTender(parsed.tender);
      if (parsed.matches) setMatches(parsed.matches);
      if (parsed.expiryDates) setExpiryDates(parsed.expiryDates);
      if (parsed.language) setLanguage(parsed.language);
      showToast('Session restored successfully from browser storage!');
    } catch {
      showToast('Failed to parse saved session.');
    }
  };

  const hasSavedSession = Boolean(localStorage.getItem(STORAGE_KEY));

  const handleResetAll = () => {
    if (window.confirm('Clear all uploaded files and matching state?')) {
      setUploadedFiles([]);
      setMatches({});
      setExpiryDates({});
      showToast('All files and matches reset.');
    }
  };

  const handleExportCsv = () => {
    exportChecklistToCSV(tender, validationResults, auditedFiles);
    showToast('Exported checklist as CSV with UTF-8 BOM.');
  };

  // PDF Package Generation
  const handleGeneratePackage = async (options: PackageGenerationOptions) => {
    setIsGenerating(true);
    try {
      const matchedList = validationResults
        .filter(r => r.matchedFileId)
        .map(r => {
          const file = auditedFiles.find(f => f.id === r.matchedFileId)!;
          return {
            requirement: r.requirement,
            file,
            expiryDate: expiryDates[r.requirement.id],
          };
        });

      // Safety check: validate that each matched PDF is assigned to the selected requirement
      // and that no two non-duplicate or duplicate files are matched to the same requirement
      const usedFileIds = new Set<string>();
      const usedReqIds = new Set<string>();

      for (const item of matchedList) {
        if (!item.file) {
          throw new Error(`Safety check failed: Attached file for requirement "${item.requirement.title_en}" is missing.`);
        }
        if (usedReqIds.has(item.requirement.id)) {
          throw new Error(`Safety check failed: Multiple documents assigned to requirement "${item.requirement.title_en}".`);
        }
        usedReqIds.add(item.requirement.id);

        if (usedFileIds.has(item.file.id)) {
          throw new Error(`Safety check failed: File "${item.file.name}" is assigned to more than one requirement.`);
        }
        usedFileIds.add(item.file.id);

        if (item.file.isDuplicate) {
          throw new Error(`Safety check failed: Duplicate file "${item.file.name}" cannot be included in final package.`);
        }
        if (item.file.isDamaged) {
          throw new Error(`Safety check failed: Corrupted or unreadable file "${item.file.name}" cannot be packaged.`);
        }
      }

      const { pdfBytes, totalPages, filename } = await generateTenderPackage(
        tender,
        matchedList,
        options
      );

      // Create blob & auto-download
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      setGeneratedPdfBlobUrl(url);
      setGeneratedFilename(filename);
      setGeneratedTotalPages(totalPages);

      // Trigger browser download
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      showToast(`Package generated successfully! (${totalPages} pages) Download started.`);
    } catch (err: any) {
      alert(`Package generation error: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Matched list for Package Modal Preview
  const matchedForModal = useMemo(() => {
    return validationResults
      .filter(r => r.matchedFileId)
      .map(r => ({
        requirement: r.requirement,
        file: auditedFiles.find(f => f.id === r.matchedFileId)!,
        expiryDate: expiryDates[r.requirement.id],
      }));
  }, [validationResults, auditedFiles, expiryDates]);

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans flex flex-col selection:bg-blue-600 selection:text-white overflow-x-hidden">
      {/* Executive Header */}
      <Header
        language={language}
        onLanguageChange={setLanguage}
        onSaveSession={handleSaveSession}
        onLoadSession={handleLoadSession}
        hasSavedSession={hasSavedSession}
        onResetAll={handleResetAll}
        onExportCsv={handleExportCsv}
        onUploadRequirementsClick={() => setIsReqModalOpen(true)}
        onLoadDemoPack={handleLoadDemoPack}
        onSwitchTender={handleSwitchTender}
        activeTenderId={tender.tender_id}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 flex-1 w-full min-w-0">
        {/* Section 4: Tender Summary & Readiness Progress */}
        <TenderSummary
          tender={tender}
          language={language}
          okCount={validationSummary.okCount}
          totalRequiredCount={mandatoryCount}
          totalRequirementsCount={tender.requirements.length}
          onUpdateTender={(updated) => setTender(prev => ({ ...prev, ...updated }))}
        />

        {/* Section 11 & 12: Compliance Audit & Validation Summary */}
        <ValidationSummaryBox
          language={language}
          summary={validationSummary}
          onCheckEverything={() => showToast('Re-evaluated all requirements, deadlines & duplicate hashes.')}
          onGeneratePackageClick={() => setIsPackageModalOpen(true)}
          isGenerating={isGenerating}
        />

        {/* Section 6 & 7: PDF Upload Zone with Real Page Counting */}
        <UploadZone
          language={language}
          uploadedFiles={auditedFiles}
          onAddFiles={handleAddFiles}
          onLoadDemoPack={handleLoadDemoPack}
          onAddDuplicateDemo={handleAddDuplicateDemo}
        />

        {/* Section 6, 8, 9: Uploaded Files List with SHA-256 Duplicates */}
        <UploadedFilesList
          language={language}
          files={auditedFiles}
          requirements={tender.requirements}
          matches={matches}
          onRemoveFile={handleRemoveFile}
          onMatchChange={handleMatchChange}
          onAutoMatch={handleApplyAutoMatch}
          autoMatchAvailableCount={autoMatchSuggestions.length}
        />

        {/* Section 5, 8, 10: Requirement Checklist & Real-Time Status */}
        <RequirementChecklist
          tender={tender}
          language={language}
          validationResults={validationResults}
          uploadedFiles={auditedFiles}
          matches={matches}
          expiryDates={expiryDates}
          onMatchChange={handleMatchChange}
          onExpiryDateChange={handleExpiryDateChange}
        />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-5 sm:py-6 text-xs text-center sm:text-left">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-slate-300 font-medium">TenderPack</span>
            <span className="hidden sm:inline">•</span>
            <span>Smart Tender Document Checker & Package Generator</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-slate-400">
            <span>pdf-lib v1.17</span>
            <span>•</span>
            <span>SHA-256 Auditing</span>
            <span>•</span>
            <span>Bilingual (EN / বাংলা)</span>
          </div>
        </div>
      </footer>

      {/* Package Generation Modal */}
      <GeneratePackageModal
        isOpen={isPackageModalOpen}
        onClose={() => setIsPackageModalOpen(false)}
        tender={tender}
        language={language}
        matchedList={matchedForModal}
        onGenerate={handleGeneratePackage}
        isGenerating={isGenerating}
        generatedBlobUrl={generatedPdfBlobUrl}
        generatedFilename={generatedFilename}
        generatedTotalPages={generatedTotalPages}
      />

      {/* Custom Requirements JSON Upload Modal */}
      <UploadRequirementsModal
        isOpen={isReqModalOpen}
        onClose={() => setIsReqModalOpen(false)}
        onLoadTender={(newTender) => {
          setTender(newTender);
          setMatches({});
          setExpiryDates({});
          showToast(`Loaded tender: ${newTender.tender_id} with ${newTender.requirements.length} requirements!`);
        }}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-5 sm:bottom-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-200 max-w-sm sm:max-w-md">
          <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
          <span className="break-words">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
