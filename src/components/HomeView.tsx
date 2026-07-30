import React from 'react';
import { PracticeMode } from '../types';
import { Play, Sparkles, Target, Zap, BookOpen, CheckCircle2, AlertCircle, Award } from 'lucide-react';

interface HomeViewProps {
  vocabularyCount: number;
  masteredCount: number;
  needsWorkCount: number;
  accuracyPercent: number;
  onOpenPracticeConfig: (mode: PracticeMode) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  vocabularyCount,
  masteredCount,
  needsWorkCount,
  accuracyPercent,
  onOpenPracticeConfig
}) => {
  const masteringProgress = vocabularyCount > 0 ? (masteredCount / vocabularyCount) * 100 : 0;

  return (
    <div className="space-y-5 font-sans max-w-md mx-auto">
      {/* Welcoming Banner Card */}
      <section className="bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-800 rounded-3xl p-6 text-white shadow-xl shadow-purple-600/20 relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-6 -top-6 w-24 h-24 bg-pink-500/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold tracking-wide uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> Daily Goal Active
            </span>
          </div>

          <div>
            <h2 className="text-2xl font-extrabold font-display leading-tight">
              Learn New Words Today!
            </h2>
            <p className="text-purple-100/90 text-xs mt-1 font-medium leading-relaxed">
              Master high-frequency CAT VARC vocabulary with adaptive practice.
            </p>
          </div>

          {/* Primary Practice Launcher Button */}
          <button
            type="button"
            onClick={() => onOpenPracticeConfig('random')}
            className="w-full py-3.5 px-6 bg-white text-purple-700 hover:bg-purple-50 font-extrabold font-display text-base tracking-wide rounded-2xl shadow-lg shadow-black/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-purple-700" />
            START STUDY SESSION
          </button>
        </div>
      </section>

      {/* Quick Mode Chips */}
      <section className="space-y-2">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
          Quick Study Modes
        </span>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => onOpenPracticeConfig('weak')}
            className="p-3.5 bg-white border border-rose-100 hover:border-rose-300 rounded-2xl shadow-xs hover:shadow-md transition-all flex items-center gap-2.5 cursor-pointer text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block leading-tight">Weak Words</span>
              <span className="text-[10px] text-slate-400 font-medium">Focus on errors</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onOpenPracticeConfig('less')}
            className="p-3.5 bg-white border border-amber-100 hover:border-amber-300 rounded-2xl shadow-xs hover:shadow-md transition-all flex items-center gap-2.5 cursor-pointer text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block leading-tight">Less Attempted</span>
              <span className="text-[10px] text-slate-400 font-medium">Unseen & rare</span>
            </div>
          </button>
        </div>
      </section>

      {/* Vocabulary Metrics Cards Grid */}
      <section className="space-y-2">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
          Your Study Progress
        </span>

        <div className="grid grid-cols-2 gap-3">
          {/* Total Words */}
          <div className="m3-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block">Total Deck</span>
              <strong className="text-xl font-extrabold font-display text-slate-900 block leading-none mt-0.5">
                {vocabularyCount}
              </strong>
            </div>
          </div>

          {/* Mastered */}
          <div className="m3-card p-4 flex items-center gap-3 border border-emerald-100">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-emerald-600 block">Mastered 🎉</span>
              <strong className="text-xl font-extrabold font-display text-slate-900 block leading-none mt-0.5">
                {masteredCount}
              </strong>
            </div>
          </div>

          {/* Needs Work */}
          <div className="m3-card p-4 flex items-center gap-3 border border-rose-100">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center font-bold text-lg">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-rose-500 block">Needs Work 💡</span>
              <strong className="text-xl font-extrabold font-display text-slate-900 block leading-none mt-0.5">
                {needsWorkCount}
              </strong>
            </div>
          </div>

          {/* Accuracy */}
          <div className="m3-card p-4 flex items-center gap-3 border border-indigo-100">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block">Accuracy 📊</span>
              <strong className="text-xl font-extrabold font-display text-slate-900 block leading-none mt-0.5">
                {Math.round(accuracyPercent)}%
              </strong>
            </div>
          </div>
        </div>
      </section>

      {/* Mastering Progress Bar Card */}
      <section className="bg-white rounded-3xl p-5 border border-purple-100 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-600">Mastery Progress</span>
          <span className="text-purple-600 font-bold">{Math.round(masteringProgress)}%</span>
        </div>
        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, masteringProgress)}%` }}
          />
        </div>
      </section>
    </div>
  );
};
