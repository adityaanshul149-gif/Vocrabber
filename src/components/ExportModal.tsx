import React, { useState } from 'react';
import { VocabularyRecord } from '../types';
import { VocabularyService } from '../services/vocabulary';
import { X, Download, CheckSquare, Square, FileText, Sparkles } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: VocabularyRecord[];
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, records }) => {
  const [fields, setFields] = useState({
    id: true,
    word: true,
    sector: true,
    definition: true,
    exampleUsage: true,
    sentences: false,
    level2Distractors: false
  });

  if (!isOpen) return null;

  const toggleField = (key: keyof typeof fields) => {
    setFields(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDownload = () => {
    const selectedColumns = Object.entries(fields)
      .filter(([, checked]) => checked)
      .map(([key]) => key);

    if (selectedColumns.length === 0) {
      alert('Please select at least one field to export.');
      return;
    }

    const content = VocabularyService.exportCustomColumnsPipeFormat(records, selectedColumns);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `voccrab_export_${selectedColumns.join('_')}.txt`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
    onClose();
  };

  const fieldLabels: { key: keyof typeof fields; label: string; desc: string }[] = [
    { key: 'id', label: 'ID', desc: 'e.g. VOC000001' },
    { key: 'word', label: 'Word', desc: 'e.g. abate' },
    { key: 'sector', label: 'Sector', desc: 'e.g. Economics' },
    { key: 'definition', label: 'Meaning / Definition', desc: 'e.g. To become less intense' },
    { key: 'exampleUsage', label: 'Example Usage', desc: 'e.g. Inflation began to abate...' },
    { key: 'sentences', label: 'Sentences (s1..s6 + true/false)', desc: '6 context sentences with correctness flags' },
    { key: 'level2Distractors', label: 'Level II Distractors', desc: '4 close distractor options for Level II quiz' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border-3 border-black dark:border-white max-w-md w-full p-6 rounded-2xl shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#A855F7] space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2.5 border-black dark:border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-black uppercase text-purple-700 dark:text-purple-400 tracking-wider block flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" /> Export Output File
            </span>
            <h2 className="text-xl font-black font-display uppercase text-slate-900 dark:text-white">Choose Output Columns</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-2 border-black dark:border-white text-black dark:text-white hover:bg-slate-200 transition-all cursor-pointer shadow-[2px_2px_0px_0px_#000]"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        <p className="text-xs text-slate-800 dark:text-slate-200 font-bold">
          Select which fields to include in your pipe-separated (<code>|</code>) export file ({records.length} words selected):
        </p>

        {/* Checkboxes List */}
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {fieldLabels.map(({ key, label, desc }) => {
            const isChecked = fields[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleField(key)}
                className={`w-full p-3 rounded-xl border-2 text-left flex items-start gap-3 transition-all cursor-pointer ${
                  isChecked
                    ? 'bg-[#FFE600] text-black border-black shadow-[2.5px_2.5px_0px_0px_#000]'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isChecked ? (
                    <CheckSquare className="w-5 h-5 text-black stroke-[2.5]" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-400 stroke-[2]" />
                  )}
                </div>
                <div>
                  <span className="text-xs font-black uppercase block tracking-tight">{label}</span>
                  <span className="text-[11px] font-bold opacity-80 block">{desc}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-3 border-t-2 border-black dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border-2 border-black dark:border-white text-black dark:text-white rounded-xl text-xs font-black uppercase cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="px-5 py-2.5 bg-[#4ADE80] hover:bg-[#22C55E] text-black font-black font-display text-xs uppercase rounded-xl border-2.5 border-black flex items-center gap-2 cursor-pointer shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            Generate & Download File
          </button>
        </div>
      </div>
    </div>
  );
};
