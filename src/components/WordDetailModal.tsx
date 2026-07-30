import React from 'react';
import { VocabularyRecord, ProgressRecord } from '../types';
import { StorageService } from '../services/storage';
import { X, Check, AlertCircle, Play, RotateCcw, Calendar, History } from 'lucide-react';

interface WordDetailModalProps {
  word: VocabularyRecord | null;
  progress: ProgressRecord | null;
  onClose: () => void;
  onPracticeWord?: (wordId: string) => void;
  onDataChanged?: () => void;
}

export const WordDetailModal: React.FC<WordDetailModalProps> = ({
  word,
  progress,
  onClose,
  onPracticeWord,
  onDataChanged
}) => {
  if (!word) return null;

  const state = StorageService.getLearningState(progress);

  const handleClearWordProgress = () => {
    if (!window.confirm(`Reset practice history and progress for "${word.word}"?`)) return;

    const allProgress = StorageService.getProgress();
    const updated = allProgress.filter(p => p.vocabularyId !== word.id);
    StorageService.setProgress(updated);
    if (onDataChanged) onDataChanged();
  };

  const handlePracticeThisWord = () => {
    if (onPracticeWord) {
      onPracticeWord(word.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border-3 border-black dark:border-white max-w-md w-full p-6 rounded-2xl shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#A855F7] space-y-4 max-h-[90vh] overflow-y-auto transition-colors">
        {/* Header */}
        <div className="flex items-start justify-between border-b-2.5 border-black dark:border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black font-display text-slate-900 dark:text-white uppercase">
                {word.word}
              </h2>
              <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-[#FFE600] text-black border-2 border-black uppercase">
                {word.sector}
              </span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
              ID: {word.id}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-2 border-black dark:border-white text-black dark:text-white hover:bg-slate-200 transition-all cursor-pointer shadow-[2px_2px_0px_0px_#000]"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-3 gap-2 bg-[#FFE600]/20 dark:bg-slate-800/80 p-3 rounded-xl border-2 border-black dark:border-slate-700 text-center text-xs">
          <div>
            <span className="text-black dark:text-slate-400 block text-[10px] font-black uppercase">Status</span>
            <span
              className={`font-black block text-xs uppercase mt-0.5 ${
                state === 'Mastered'
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : state === 'Needs Work'
                  ? 'text-rose-700 dark:text-rose-400'
                  : state === 'Learning'
                  ? 'text-purple-700 dark:text-purple-300'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {state}
            </span>
          </div>
          <div>
            <span className="text-black dark:text-slate-400 block text-[10px] font-black uppercase">Accuracy</span>
            <span className="font-black text-slate-900 dark:text-slate-100 block text-xs mt-0.5">
              {progress ? Math.round(progress.accuracy * 100) : 0}%
            </span>
          </div>
          <div>
            <span className="text-black dark:text-slate-400 block text-[10px] font-black uppercase">Attempts</span>
            <span className="font-black text-slate-900 dark:text-slate-100 block text-xs mt-0.5">
              {progress?.attempts || 0}
            </span>
          </div>
        </div>

        {/* Definition & Usage */}
        <div className="space-y-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border-2 border-black dark:border-slate-700">
          <div>
            <span className="text-[10px] font-black uppercase text-purple-700 dark:text-purple-300 tracking-wide block mb-0.5">
              Definition
            </span>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-relaxed">{word.definition}</p>
          </div>
          <div className="pt-2 border-t-2 border-black/20 dark:border-slate-700">
            <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wide block mb-0.5">
              Example Usage
            </span>
            <p className="text-xs text-slate-900 dark:text-slate-300 italic font-bold leading-relaxed">
              "{word.exampleUsage}"
            </p>
          </div>
        </div>

        {/* 6 Retrieval Sentences */}
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-black dark:text-white block">
            Sentences (2 Correct / 4 Distractors)
          </span>
          <div className="space-y-2">
            {word.sentences.map((s, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border-2 text-xs font-sans flex items-start gap-2.5 transition-all ${
                  s.correct
                    ? 'border-black bg-[#4ADE80] text-black font-bold'
                    : 'border-black/30 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/40 text-slate-700 dark:text-slate-400'
                }`}
              >
                {s.correct ? (
                  <Check className="w-4 h-4 text-black shrink-0 mt-0.5 stroke-[3]" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5 stroke-[2]" />
                )}
                <span className="leading-relaxed flex-1 font-bold">{s.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-3 border-t-2 border-black dark:border-slate-800 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleClearWordProgress}
            className="px-3 py-2 bg-[#FF6B6B] hover:bg-[#FF5252] text-black border-2 border-black rounded-xl text-xs font-black flex items-center gap-1 cursor-pointer shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
            Reset Progress
          </button>

          <div className="flex gap-2">
            {onPracticeWord && (
              <button
                type="button"
                onClick={handlePracticeThisWord}
                className="px-4 py-2 bg-[#A855F7] hover:bg-[#9333EA] text-white border-2 border-black font-black text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Practice Now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
