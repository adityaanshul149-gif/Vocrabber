import React, { useState } from 'react';
import { VocabularyService } from '../services/vocabulary';
import { X, Upload, CheckCircle2, AlertTriangle } from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImportComplete }) => {
  const [text, setText] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(
    null
  );

  if (!isOpen) return null;

  const handleImport = () => {
    try {
      const parsed = VocabularyService.parsePipeImport(text);
      if (parsed.records.length === 0) {
        setStatusMessage({
          text: `Failed: ${parsed.errors.join(' ')}`,
          isError: true
        });
        return;
      }

      const result = VocabularyService.mergeImported(parsed.records);
      const msg = `Processed: ${parsed.processed} | Added: ${result.added} | Updated: ${result.updated}${
        parsed.errors.length > 0 ? ` | Errors: ${parsed.errors.length}` : ''
      }`;

      setStatusMessage({
        text: msg,
        isError: parsed.errors.length > 0
      });

      onImportComplete();
    } catch (e) {
      setStatusMessage({
        text: `Error parsing data: ${(e as Error).message}`,
        isError: true
      });
    }
  };

  const handleClear = () => {
    setText('');
    setStatusMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-in fade-in">
      <div className="bg-white border border-purple-100 max-w-md w-full p-6 rounded-3xl shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[11px] font-extrabold uppercase text-purple-600 tracking-wider">
              Data Management
            </span>
            <h2 className="text-xl font-black font-display text-slate-900">Paste Vocabulary Pack</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-600 font-medium">
          Paste pipe-separated (<code>|</code>) VocCrab vocabulary data with 17 columns header:
        </p>

        <textarea
          spellCheck={false}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={`id|word|sector|definition|example_usage|s1|s1_true|s2|s2_true|s3|s3_true|s4|s4_true|s5|s5_true|s6|s6_true\nVOC000001|abate|Economics|To become less intense|Inflation began to abate.|Inflation began to abate after policy changes.|TRUE|Public anger abated after the inquiry.|TRUE|The abate professor delivered a lecture.|FALSE|Researchers abated the hypothesis.|FALSE|The reforms worsened inflation and thus abated prices.|FALSE|The crisis abated into greater intensity.|FALSE`}
          className="w-full h-48 bg-slate-50 border border-slate-200 rounded-2xl p-3 font-mono text-xs text-slate-800 focus:outline-none focus:border-purple-500 focus:bg-white resize-y"
        />

        {statusMessage && (
          <div
            className={`p-3 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${
              statusMessage.isError
                ? 'bg-rose-50 border-rose-200 text-rose-700'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            {statusMessage.isError ? (
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <div className="flex justify-between items-center pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 text-xs font-bold"
          >
            Clear
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!text.trim()}
              onClick={handleImport}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-extrabold font-display text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-md shadow-purple-600/20"
            >
              <Upload className="w-4 h-4" />
              Import Pack
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
