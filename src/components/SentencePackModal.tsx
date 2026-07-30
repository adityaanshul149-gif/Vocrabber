import React, { useState } from 'react';
import { VocabularyService } from '../services/vocabulary';
import { X, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';

interface SentencePackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateComplete: () => void;
}

export const SentencePackModal: React.FC<SentencePackModalProps> = ({
  isOpen,
  onClose,
  onUpdateComplete
}) => {
  const [text, setText] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(
    null
  );

  if (!isOpen) return null;

  const handleApply = () => {
    try {
      const parsed = VocabularyService.parsePipeImport(text);
      if (parsed.records.length === 0) {
        setStatusMessage({
          text: `Failed: ${parsed.errors.join(' ')}`,
          isError: true
        });
        return;
      }

      const result = VocabularyService.updateSentencePack(parsed);
      const msg = `Processed: ${result.processed} | Updated: ${result.updated}${
        result.unknownIds.length > 0 ? ` | Unknown IDs: ${result.unknownIds.length}` : ''
      }${result.errors.length > 0 ? ` | Errors: ${result.errors.length}` : ''}`;

      setStatusMessage({
        text: msg,
        isError: result.errors.length > 0 || result.unknownIds.length > 0
      });

      onUpdateComplete();
    } catch (e) {
      setStatusMessage({
        text: `Error updating sentences: ${(e as Error).message}`,
        isError: true
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-in fade-in">
      <div className="bg-white border border-purple-100 max-w-md w-full p-6 rounded-3xl shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[11px] font-extrabold uppercase text-purple-600 tracking-wider">
              Data Management
            </span>
            <h2 className="text-xl font-black font-display text-slate-900">Update Sentence Pack</h2>
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
          Paste 17-column pipe-separated rows. Only sentence fields for existing vocabulary IDs will be updated.
        </p>

        <textarea
          spellCheck={false}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="id|word|sector|definition|example_usage|s1|s1_true|s2|s2_true|s3|s3_true|s4|s4_true|s5|s5_true|s6|s6_true"
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
            onClick={() => {
              setText('');
              setStatusMessage(null);
            }}
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
              onClick={handleApply}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-extrabold font-display text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-md shadow-purple-600/20"
            >
              <RefreshCw className="w-4 h-4" />
              Update Sentences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
