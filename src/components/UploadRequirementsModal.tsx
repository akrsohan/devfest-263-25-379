import React, { useRef, useState } from 'react';
import { TenderData } from '../types/tender';
import { UploadCloud, Check, X, AlertTriangle, FileCode } from 'lucide-react';

interface UploadRequirementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadTender: (data: TenderData) => void;
}

export const UploadRequirementsModal: React.FC<UploadRequirementsModalProps> = ({
  isOpen,
  onClose,
  onLoadTender,
}) => {
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const validateAndApply = (parsed: any) => {
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Invalid JSON: Must be an object.');
    }

    // Support tender information in nested "tender" object as provided by competition JSON,
    // with graceful fallback to root-level fields.
    const tenderInfo = (parsed.tender && typeof parsed.tender === 'object') ? parsed.tender : parsed;

    const tender_id = tenderInfo.tender_id ?? parsed.tender_id;
    const title = tenderInfo.title ?? parsed.title;
    const procuring_entity = tenderInfo.procuring_entity ?? parsed.procuring_entity;
    const bidder = tenderInfo.bidder ?? parsed.bidder;
    const submission_deadline = tenderInfo.submission_deadline ?? parsed.submission_deadline;

    if (!tender_id) throw new Error('Missing "tender_id" in tender information.');
    if (!title) throw new Error('Missing "title" in tender information.');
    if (!procuring_entity) throw new Error('Missing "procuring_entity" in tender information.');
    if (!bidder) throw new Error('Missing "bidder" in tender information.');
    if (!submission_deadline) throw new Error('Missing "submission_deadline" in tender information.');

    // Requirements list can be at root level or within tender object
    const rawRequirements =
      Array.isArray(parsed.requirements)
        ? parsed.requirements
        : Array.isArray(parsed.tender?.requirements)
        ? parsed.tender.requirements
        : Array.isArray(parsed.documents)
        ? parsed.documents
        : Array.isArray(parsed.tender?.documents)
        ? parsed.tender.documents
        : null;

    if (!rawRequirements) {
      throw new Error('Missing or invalid "requirements" list in requirements.json.');
    }

    // Validate and preserve each requirement field exactly
    const cleanRequirements: any[] = [];
    for (let i = 0; i < rawRequirements.length; i++) {
      const r = rawRequirements[i];
      if (!r || typeof r !== 'object') {
        throw new Error(`Requirement at index ${i} is not a valid object.`);
      }
      if (r.id === undefined || r.id === null || String(r.id).trim() === '') {
        throw new Error(`Requirement at index ${i} is missing "id".`);
      }
      if (typeof r.order !== 'number') {
        throw new Error(`Requirement "${r.id}" is missing numerical "order".`);
      }
      if (!r.title_en) {
        throw new Error(`Requirement "${r.id}" is missing "title_en".`);
      }
      if (typeof r.mandatory !== 'boolean') {
        throw new Error(`Requirement "${r.id}" is missing boolean "mandatory".`);
      }
      if (typeof r.has_expiry !== 'boolean') {
        throw new Error(`Requirement "${r.id}" is missing boolean "has_expiry".`);
      }

      cleanRequirements.push({
        id: String(r.id),
        order: Number(r.order),
        title_en: String(r.title_en),
        title_bn: r.title_bn !== undefined && r.title_bn !== null ? String(r.title_bn) : String(r.title_en),
        mandatory: Boolean(r.mandatory),
        has_expiry: Boolean(r.has_expiry),
      });
    }

    // Sort requirements by order
    cleanRequirements.sort((a, b) => a.order - b.order);

    const tenderData: TenderData = {
      tender_id: String(tender_id),
      title: String(title),
      procuring_entity: String(procuring_entity),
      bidder: String(bidder),
      submission_deadline: String(submission_deadline),
      requirements: cleanRequirements,
    };

    onLoadTender(tenderData);
    onClose();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      const text = await file.text();
      setJsonText(text);
      const parsed = JSON.parse(text);
      validateAndApply(parsed);
    } catch (err: any) {
      setError(`Failed to load requirements.json: ${err?.message || 'Invalid format'}`);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const parsed = JSON.parse(jsonText);
      validateAndApply(parsed);
    } catch (err: any) {
      setError(`JSON Parse Error: ${err?.message || 'Invalid JSON syntax'}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold">Load Tender Requirements (JSON)</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-md cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleManualSubmit} className="p-6 space-y-4">
          <p className="text-xs text-slate-600">
            Select a custom <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-blue-700">requirements.json</code> file or paste JSON code directly to evaluate against unseen competition test packs.
          </p>

          {/* File Picker */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-4 text-center cursor-pointer bg-slate-50 hover:bg-blue-50/50 transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleFileUpload}
            />
            <UploadCloud className="w-7 h-7 text-blue-600 mx-auto mb-1.5" />
            <div className="text-xs font-semibold text-slate-800">
              Click to browse requirements.json
            </div>
            <div className="text-[11px] text-slate-500">
              Supports standard competition format
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <div className="h-px bg-slate-200 flex-1" />
            <span>OR PASTE JSON CODE</span>
            <div className="h-px bg-slate-200 flex-1" />
          </div>

          <div>
            <textarea
              rows={7}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder="Paste requirements.json content here..."
              className="w-full text-xs font-mono p-3 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:border-blue-500"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!jsonText.trim()}
              className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Apply Requirements</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
