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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-purple-100 dark:border-slate-800 max-w-md w-full p-6 rounded-3xl shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto transition-colors">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black font-display text-slate-900 dark:text-white capitalize">
                {word.word}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300">
                {word.sector}
              </span>
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              ID: {word.id}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-3 gap-2 bg-purple-50/60 dark:bg-slate-800/80 p-3 rounded-2xl text-center text-xs">
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-bold uppercase">Status</span>
            <span
              className={`font-extrabold block text-xs mt-0.5 ${
                state === 'Mastered'
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : state === 'Needs Work'
                  ? 'text-rose-700 dark:text-rose-400'
                  : state === 'Learning'
                  ? 'text-purple-700 dark:text-purple-300'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {state}
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-bold uppercase">Accuracy</span>
            <span className="font-extrabold text-slate-900 dark:text-slate-100 block text-xs mt-0.5">
              {progress ? Math.round(progress.accuracy * 100) : 0}%
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-bold uppercase">Attempts</span>
            <span className="font-extrabold text-slate-900 dark:text-slate-100 block text-xs mt-0.5">
              {progress?.attempts || 0}
            </span>
          </div>
        </div>

        {/* Definition & Usage */}
        <div className="space-y-2 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[10px] font-bold uppercase text-purple-700 dark:text-purple-300 tracking-wide block mb-0.5">
              Definition
            </span>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">{word.definition}</p>
          </div>
          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
            <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wide block mb-0.5">
              Example Usage
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">
              "{word.exampleUsage}"
            </p>
          </div>
        </div>

        {/* 6 Retrieval Sentences */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wide text-purple-700 dark:text-purple-300 block">
            Sentences (2 Correct / 4 Distractors)
          </span>
          <div className="space-y-2">
            {word.sentences.map((s, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-2xl border text-xs sm:text-sm font-sans flex items-start gap-2.5 transition-all ${
                  s.correct
                    ? 'border-emerald-400 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-950/70 text-emerald-950 dark:text-emerald-100 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                }`}
              >
                {s.correct ? (
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
                )}
                <span className="leading-relaxed flex-1 font-medium">{s.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleClearWordProgress}
            className="px-3 py-2 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-600 dark:text-rose-300 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Progress
          </button>

          <div className="flex gap-2">
            {onPracticeWord && (
              <button
                type="button"
                onClick={handlePracticeThisWord}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md shadow-purple-600/20"
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
