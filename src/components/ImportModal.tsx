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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border-3 border-black dark:border-white max-w-md w-full p-6 rounded-2xl shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#A855F7] space-y-4">
        <div className="flex items-center justify-between border-b-2.5 border-black dark:border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-black uppercase text-purple-700 dark:text-purple-400 tracking-wider block">
              Data Management
            </span>
            <h2 className="text-xl font-black font-display uppercase text-slate-900 dark:text-white">Paste Vocabulary Pack</h2>
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
          Paste pipe-separated (<code>|</code>) VocCrab vocabulary data with 17 columns header:
        </p>

        <textarea
          spellCheck={false}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={`id|word|sector|definition|example_usage|s1|s1_true|s2|s2_true|s3|s3_true|s4|s4_true|s5|s5_true|s6|s6_true\nVOC000001|abate|Economics|To become less intense|Inflation began to abate.|Inflation began to abate after policy changes.|TRUE|Public anger abated after the inquiry.|TRUE|The abate professor delivered a lecture.|FALSE|Researchers abated the hypothesis.|FALSE|The reforms worsened inflation and thus abated prices.|FALSE|The crisis abated into greater intensity.|FALSE`}
          className="w-full h-48 bg-slate-50 dark:bg-slate-800 border-2 border-black dark:border-slate-700 rounded-xl p-3 font-mono text-xs text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-purple-600 resize-y"
        />

        {statusMessage && (
          <div
            className={`p-3 rounded-xl border-2 text-xs font-black uppercase flex items-center gap-2 shadow-[2px_2px_0px_0px_#000] ${
              statusMessage.isError
                ? 'bg-[#FF6B6B] border-black text-black'
                : 'bg-[#4ADE80] border-black text-black'
            }`}
          >
            {statusMessage.isError ? (
              <AlertTriangle className="w-4 h-4 shrink-0 text-black stroke-[2.5]" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-black stroke-[2.5]" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <div className="flex justify-between items-center pt-3 border-t-2 border-black dark:border-slate-800">
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-2 border-2 border-black dark:border-white text-black dark:text-white rounded-xl text-xs font-black uppercase cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Clear
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border-2 border-black dark:border-white text-black dark:text-white rounded-xl text-xs font-black uppercase cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!text.trim()}
              onClick={handleImport}
              className="px-5 py-2 bg-[#A855F7] hover:bg-[#9333EA] disabled:bg-slate-300 disabled:text-slate-500 text-white font-black font-display text-xs uppercase rounded-xl border-2.5 border-black flex items-center gap-2 cursor-pointer shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            >
              <Upload className="w-4 h-4 stroke-[2.5]" />
              Import Pack
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
