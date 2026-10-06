import React, { useRef, useState } from 'react';
import { Language, UploadedPdfFile } from '../types/tender';
import { I18N } from '../utils/i18n';
import { readPdfPageCount } from '../utils/pdfPackageBuilder';
import { calculateFileHash } from '../utils/hash';
import {
  Upload,
  FileText,
  AlertTriangle,
  Sparkles,
  Copy,
  FileQuestion,
  Info,
  CheckCircle2,
} from 'lucide-react';

interface UploadZoneProps {
  language: Language;
  uploadedFiles: UploadedPdfFile[];
  onAddFiles: (files: UploadedPdfFile[]) => void;
  onLoadDemoPack: () => void;
  onAddDuplicateDemo: () => void;
}

const MAX_FILES = 30;
const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50 MB

export const UploadZone: React.FC<UploadZoneProps> = ({
  language,
  uploadedFiles,
  onAddFiles,
  onLoadDemoPack,
  onAddDuplicateDemo,
}) => {
  const t = I18N[language];
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentTotalBytes = uploadedFiles.reduce((acc, f) => acc + f.size, 0);
  const currentTotalMB = (currentTotalBytes / (1024 * 1024)).toFixed(1);

  const handleFiles = async (filesList: FileList | null) => {
    if (!filesList || filesList.length === 0) return;
    setErrorMessage(null);
    setIsProcessing(true);

    const newFiles: UploadedPdfFile[] = [];
    let runningSize = currentTotalBytes;
    let runningCount = uploadedFiles.length;

    try {
      for (let i = 0; i < filesList.length; i++) {
        const file = filesList[i];

        // 1. Check if genuine PDF
        const isPdfExtension = file.name.toLowerCase().endsWith('.pdf');
        const isPdfMime = file.type === 'application/pdf' || file.type === '';
        if (!isPdfExtension && !isPdfMime) {
          setErrorMessage(`"${file.name}" was rejected. Only genuine PDF documents (.pdf) are permitted.`);
          continue;
        }

        // 2. Check 30 files limit
        if (runningCount + 1 > MAX_FILES) {
          setErrorMessage(`Limit exceeded: Cannot upload more than ${MAX_FILES} PDF files in total.`);
          break;
        }

        // 3. Check 50 MB cumulative limit
        if (runningSize + file.size > MAX_TOTAL_SIZE) {
          setErrorMessage(`Cumulative size limit exceeded: Total upload volume cannot exceed 50 MB.`);
          break;
        }

        // 4. Read arrayBuffer and calculate real hash & real page count
        const buffer = await file.arrayBuffer();
        const hash = await calculateFileHash(buffer);

        let pageCount = 0;
        let isDamaged = false;
        let parseError: string | undefined = undefined;

        try {
          pageCount = await readPdfPageCount(buffer);
        } catch (err: any) {
          isDamaged = true;
          parseError = err?.message || 'Could not read this PDF. Please check that the file is not damaged or password-protected.';
        }

        const newDoc: UploadedPdfFile = {
          id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
          name: file.name,
          size: file.size,
          arrayBuffer: buffer,
          hash,
          pageCount,
          isDamaged,
          errorMessage: parseError,
          isDuplicate: false,
          duplicateGroupIds: [],
        };

        newFiles.push(newDoc);
        runningSize += file.size;
        runningCount++;
      }

      if (newFiles.length > 0) {
        onAddFiles(newFiles);
      }
    } catch (e: any) {
      setErrorMessage(`Error processing file: ${e?.message || 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="mb-6">
      {/* Upload Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-blue-500 bg-blue-50/70 scale-[0.99]'
            : 'border-slate-300 hover:border-blue-400 bg-white hover:bg-slate-50/60 shadow-xs'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-xs">
            <Upload className="w-7 h-7" />
          </div>

          <div>
            <h3 className="text-base font-semibold text-slate-800">
              {t.dragDropTitle}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              {t.dragDropSubtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500 bg-slate-100/70 px-3.5 py-1.5 rounded-lg border border-slate-200/60">
            <span className="font-medium text-slate-700">
              {uploadedFiles.length} / {MAX_FILES} {t.totalFiles}
            </span>
            <span>•</span>
            <span className="font-medium text-slate-700">
              {currentTotalMB} MB / 50 MB
            </span>
            <span>•</span>
            <span className="text-emerald-700 font-medium">100% Client-Side Private</span>
          </div>

          {isProcessing && (
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 animate-pulse">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-600 animate-ping" />
              Reading PDF bytes, calculating SHA-256 hash & counting pages...
            </div>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-700">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Upload notice:</span> {errorMessage}
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-400 hover:text-red-700 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* Quick Test Controls */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500">
          <Info className="w-3.5 h-3.5 text-blue-500" />
          <span>Competition Testing Shortcuts:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onLoadDemoPack}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-300 font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Generates complete set of test PDFs in memory with real page counts"
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Generate Demo Test Files</span>
          </button>
          <button
            type="button"
            onClick={onAddDuplicateDemo}
            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-md border border-amber-300 font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Adds an exact-content duplicate file with a different name to test section 5 & 9"
          >
            <Copy className="w-3 h-3 text-amber-600" />
            <span>Test Duplicate PDF Detection</span>
          </button>
        </div>
      </div>
    </div>
  );
};
