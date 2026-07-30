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
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-in fade-in">
      <div className="bg-white border border-purple-100 max-w-md w-full p-6 rounded-3xl shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black font-display text-slate-900 capitalize">
                {word.word}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                {word.sector}
              </span>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              ID: {word.id}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-3 gap-2 bg-purple-50/60 p-3 rounded-2xl text-center text-xs">
          <div>
            <span className="text-slate-500 block text-[10px] font-bold uppercase">Status</span>
            <span
              className={`font-extrabold block text-xs mt-0.5 ${
                state === 'Mastered'
                  ? 'text-emerald-700'
                  : state === 'Needs Work'
                  ? 'text-rose-700'
                  : state === 'Learning'
                  ? 'text-purple-700'
                  : 'text-slate-500'
              }`}
            >
              {state}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] font-bold uppercase">Accuracy</span>
            <span className="font-extrabold text-slate-900 block text-xs mt-0.5">
              {progress ? Math.round(progress.accuracy * 100) : 0}%
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] font-bold uppercase">Attempts</span>
            <span className="font-extrabold text-slate-900 block text-xs mt-0.5">
              {progress?.attempts || 0}
            </span>
          </div>
        </div>

        {/* Definition & Usage */}
        <div className="space-y-2 bg-slate-50 rounded-2xl p-4 border border-slate-100">
          <div>
            <span className="text-[10px] font-bold uppercase text-purple-700 tracking-wide block mb-0.5">
              Definition
            </span>
            <p className="text-xs font-semibold text-slate-800 leading-relaxed">{word.definition}</p>
          </div>
          <div className="pt-2 border-t border-slate-200/60">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wide block mb-0.5">
              Example Usage
            </span>
            <p className="text-xs text-slate-600 italic leading-relaxed">
              "{word.exampleUsage}"
            </p>
          </div>
        </div>

        {/* 6 Retrieval Sentences */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wide text-purple-700 block">
            Sentences (2 Correct / 4 Distractors)
          </span>
          <div className="space-y-1.5">
            {word.sentences.map((s, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border text-xs font-sans flex items-start gap-2 transition-all ${
                  s.correct
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-950 font-medium'
                    : 'border-slate-100 bg-slate-50 text-slate-500'
                }`}
              >
                {s.correct ? (
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                )}
                <span className="leading-relaxed flex-1">{s.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleClearWordProgress}
            className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
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
