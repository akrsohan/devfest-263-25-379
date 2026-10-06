import React, { useState } from 'react';
import { Language, TenderData } from '../types/tender';
import { I18N } from '../utils/i18n';
import {
  Building2,
  Calendar,
  FileSignature,
  Hash,
  CheckCircle2,
  AlertCircle,
  Clock,
  Edit3,
  X,
  Check,
} from 'lucide-react';

interface TenderSummaryProps {
  tender: TenderData;
  language: Language;
  okCount: number;
  totalRequiredCount: number;
  totalRequirementsCount: number;
  onUpdateTender: (updated: Partial<TenderData>) => void;
}

export const TenderSummary: React.FC<TenderSummaryProps> = ({
  tender,
  language,
  okCount,
  totalRequiredCount,
  totalRequirementsCount,
  onUpdateTender,
}) => {
  const t = I18N[language];
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    tender_id: tender.tender_id,
    title: tender.title,
    procuring_entity: tender.procuring_entity,
    bidder: tender.bidder,
    submission_deadline: tender.submission_deadline,
  });

  const percentReady = totalRequiredCount > 0
    ? Math.round((okCount / totalRequiredCount) * 100)
    : 0;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateTender(editForm);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden mb-6">
      {/* Top Banner Header */}
      <div className="bg-linear-to-r from-slate-900 via-blue-950 to-slate-900 px-4 sm:px-6 py-3.5 sm:py-4 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] sm:text-xs font-mono font-semibold bg-blue-500/30 text-blue-200 border border-blue-400/30 whitespace-nowrap">
              {tender.tender_id}
            </span>
            <span className="text-[11px] sm:text-xs text-slate-400">
              {t.tenderSummary}
            </span>
          </div>
          <h2 className="text-sm sm:text-base md:text-lg font-bold text-white break-words leading-snug" title={tender.title}>
            {tender.title}
          </h2>
        </div>

        {/* Action button to edit or toggle details */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => {
              setEditForm({
                tender_id: tender.tender_id,
                title: tender.title,
                procuring_entity: tender.procuring_entity,
                bidder: tender.bidder,
                submission_deadline: tender.submission_deadline,
              });
              setIsEditing(!isEditing);
            }}
            className="w-full sm:w-auto px-3 py-1.5 min-h-[36px] text-xs font-medium text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Cancel Edit' : 'Edit Details'}</span>
          </button>
        </div>
      </div>

      {/* Quick Edit Drawer if opened */}
      {isEditing && (
        <form onSubmit={handleSave} className="p-3.5 sm:p-4 bg-slate-50 border-b border-slate-200 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Tender ID</label>
              <input
                type="text"
                value={editForm.tender_id}
                onChange={(e) => setEditForm({ ...editForm, tender_id: e.target.value })}
                className="w-full px-2.5 py-2 border border-slate-300 rounded bg-white text-slate-800 text-xs min-h-[36px]"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-slate-600 font-medium mb-1">Title</label>
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="w-full px-2.5 py-2 border border-slate-300 rounded bg-white text-slate-800 text-xs min-h-[36px]"
                required
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Procuring Entity</label>
              <input
                type="text"
                value={editForm.procuring_entity}
                onChange={(e) => setEditForm({ ...editForm, procuring_entity: e.target.value })}
                className="w-full px-2.5 py-2 border border-slate-300 rounded bg-white text-slate-800 text-xs min-h-[36px]"
                required
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Bidder</label>
              <input
                type="text"
                value={editForm.bidder}
                onChange={(e) => setEditForm({ ...editForm, bidder: e.target.value })}
                className="w-full px-2.5 py-2 border border-slate-300 rounded bg-white text-slate-800 text-xs min-h-[36px]"
                required
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Submission Deadline</label>
              <input
                type="date"
                value={editForm.submission_deadline}
                onChange={(e) => setEditForm({ ...editForm, submission_deadline: e.target.value })}
                className="w-full px-2.5 py-2 border border-slate-300 rounded bg-white text-slate-800 font-mono text-xs min-h-[36px]"
                required
              />
            </div>
          </div>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 mt-3">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="w-full sm:w-auto px-3 py-2 min-h-[38px] text-slate-600 hover:bg-slate-200 rounded cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 min-h-[38px] bg-blue-600 hover:bg-blue-700 text-white font-medium rounded flex items-center justify-center gap-1.5 cursor-pointer text-center"
            >
              <Check className="w-3.5 h-3.5" />
              Save Changes
            </button>
          </div>
        </form>
      )}

      {/* Main Grid Information Cards */}
      <div className="p-3.5 sm:p-5 lg:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Procuring Entity */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100 min-w-0">
          <div className="p-2 rounded-md bg-blue-100 text-blue-700 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] sm:text-xs text-slate-500 font-medium">{t.procuringEntity}</div>
            <div className="text-xs sm:text-sm font-semibold text-slate-900 break-words" title={tender.procuring_entity}>
              {tender.procuring_entity}
            </div>
          </div>
        </div>

        {/* Submitting Bidder */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100 min-w-0">
          <div className="p-2 rounded-md bg-purple-100 text-purple-700 shrink-0">
            <FileSignature className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] sm:text-xs text-slate-500 font-medium">{t.bidder}</div>
            <div className="text-xs sm:text-sm font-semibold text-slate-900 break-words" title={tender.bidder}>
              {tender.bidder}
            </div>
          </div>
        </div>

        {/* Submission Deadline */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100 min-w-0">
          <div className="p-2 rounded-md bg-amber-100 text-amber-700 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] sm:text-xs text-slate-500 font-medium">{t.deadline}</div>
            <div className="text-xs sm:text-sm font-semibold text-slate-900 font-mono">
              {tender.submission_deadline}
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">
              Expiry dates must be on or after this date
            </div>
          </div>
        </div>

        {/* Document Readiness Progress Indicator */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between mb-1.5 gap-2">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-700 flex items-center gap-1.5 truncate">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="truncate">{t.readyProgress}</span>
            </span>
            <span className="text-xs font-bold font-mono text-slate-800 shrink-0">
              {okCount} / {totalRequiredCount}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden my-1">
            <div
              className={`h-2.5 rounded-full transition-all duration-300 ${
                okCount === totalRequiredCount
                  ? 'bg-emerald-500'
                  : okCount > 0
                  ? 'bg-blue-600'
                  : 'bg-slate-400'
              }`}
              style={{ width: `${Math.min(percentReady, 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500 mt-1">
            <span>{percentReady}% Ready</span>
            <span>{totalRequirementsCount} Total Criteria</span>
          </div>
        </div>
      </div>
    </div>
  );
};
