import React, { useState } from 'react';
import { VocabularyService } from '../services/vocabulary';
import { X, Upload, CheckCircle2, AlertTriangle, Target, Info } from 'lucide-react';
import { PackInstructionModal } from './PackInstructionModal';

interface Level2PackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateComplete: () => void;
}

export const Level2PackModal: React.FC<Level2PackModalProps> = ({
  isOpen,
  onClose,
  onUpdateComplete
}) => {
  const [text, setText] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(
    null
  );
  const [showInstructions, setShowInstructions] = useState(false);

  if (!isOpen) return null;

  const handleImport = () => {
    try {
      const result = VocabularyService.parseAndMergeLevel2Pack(text);
      if (result.updated === 0 && result.errors.length > 0) {
        setStatusMessage({
          text: `Failed: ${result.errors.join(' ')}`,
          isError: true
        });
        return;
      }

      const msg = `Processed: ${result.processed} | Updated LVL II Words: ${result.updated}${
        result.unknownIds.length > 0 ? ` | Unknown IDs: ${result.unknownIds.length}` : ''
      }`;

      setStatusMessage({
        text: msg,
        isError: result.errors.length > 0
      });

      onUpdateComplete();
    } catch (e) {
      setStatusMessage({
        text: `Error updating Level 2 pack: ${(e as Error).message}`,
        isError: true
      });
    }
  };

  const handleClear = () => {
    setText('');
    setStatusMessage(null);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-in fade-in">
        <div className="bg-white dark:bg-slate-900 border-3 border-black dark:border-white max-w-md w-full p-6 rounded-2xl shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#FF2E93] space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between border-b-2.5 border-black dark:border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-black uppercase text-[#FF2E93] tracking-wider flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-[#FF2E93] stroke-[2.5]" /> Level II Configuration
              </span>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black font-display uppercase text-slate-900 dark:text-white">
                  Paste Level II Word Pack
                </h2>
                <button
                  type="button"
                  onClick={() => setShowInstructions(true)}
                  title="How to generate copyable Level II pack with AI"
                  className="p-1 rounded-lg bg-[#FF2E93] border-2 border-black text-white hover:bg-[#E0267D] transition-all cursor-pointer shadow-[1.5px_1.5px_0px_0px_#000]"
                >
                  <Info className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
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
            Paste pipe-separated (<code>|</code>) or semicolon-separated (<code>;</code>) Level II word data containing ID, word, exact definition, and 4 close distractors:
          </p>

          <textarea
            spellCheck={false}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={`id|word|definition|distractor1|distractor2|distractor3|distractor4\nVOC000001|abate|To become less intense or widespread|To intensify rapidly under external pressure|To completely eradicate or annihilate|To hesitate briefly before taking action|To duplicate precisely in structural form\nOR Semicolon format:\nVOC000001 | To become less intense ; To intensify rapidly ; To eradicate ; To hesitate ; To duplicate`}
            className="w-full h-48 bg-slate-50 dark:bg-slate-800 border-2 border-black dark:border-slate-700 rounded-xl p-3 font-mono text-xs text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-pink-500 resize-y"
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

          {/* Buttons */}
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
                className="px-5 py-2 bg-[#FF2E93] hover:bg-[#E0267D] disabled:bg-slate-300 disabled:text-slate-500 text-white font-black font-display text-xs uppercase rounded-xl border-2.5 border-black flex items-center gap-2 cursor-pointer shadow-[3px_3px_0px_0px_#00F0FF] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
              >
                <Upload className="w-4 h-4 stroke-[2.5]" />
                Update Level II Pack
              </button>
            </div>
          </div>
        </div>
      </div>

      <PackInstructionModal
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
        type="lvl2_options"
      />
    </>
  );
};
