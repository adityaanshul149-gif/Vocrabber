import React from 'react';
import { PracticeMode, AppLevel } from '../types';
import { Play, Sparkles, Target, Zap, BookOpen, CheckCircle2, AlertCircle, Award } from 'lucide-react';

interface HomeViewProps {
  vocabularyCount: number;
  masteredCount: number;
  needsWorkCount: number;
  accuracyPercent: number;
  appLevel?: AppLevel;
  onOpenPracticeConfig: (mode: PracticeMode) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  vocabularyCount,
  masteredCount,
  needsWorkCount,
  accuracyPercent,
  appLevel = 'lvl1',
  onOpenPracticeConfig
}) => {
  const isLvl2 = appLevel === 'lvl2';
  const masteringProgress = vocabularyCount > 0 ? (masteredCount / vocabularyCount) * 100 : 0;

  return (
    <div className="space-y-6 font-sans max-w-md mx-auto">
      {/* Welcoming Banner Card - Neobrutalism Banner */}
      <section className={`border-3 border-black dark:border-white rounded-3xl p-6 shadow-[5px_5px_0px_0px_#000] dark:shadow-[5px_5px_0px_0px_#FF2E93] space-y-4 transition-all ${
        isLvl2 ? 'bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white' : 'bg-[#FFE600] dark:bg-purple-900 text-black dark:text-white'
      }`}>
        <div className="flex items-center justify-between">
          <span className={`px-3 py-1 rounded-xl text-xs font-black tracking-wider uppercase flex items-center gap-1.5 border border-black ${
            isLvl2 ? 'bg-[#FF2E93] text-white' : 'bg-black text-amber-300 dark:bg-white dark:text-black'
          }`}>
            <Sparkles className="w-3.5 h-3.5 fill-current" /> {isLvl2 ? 'LEVEL II INTENSE' : 'DAILY CAT GOAL'}
          </span>
          <span className="text-xs font-black px-2.5 py-1 bg-white text-black border-2 border-black rounded-lg uppercase">
            {isLvl2 ? 'WORD & MEANING' : 'CAT VARC'}
          </span>
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-black font-display leading-tight uppercase tracking-tight">
            {isLvl2 ? 'Master Word Meanings!' : 'Level Up Your VARC Vocab!'}
          </h2>
          <p className={`text-xs mt-1.5 font-bold leading-relaxed ${isLvl2 ? 'text-slate-300' : 'text-black/90 dark:text-purple-200'}`}>
            {isLvl2
              ? 'Distractor-heavy 5-option quizzes on your Level I Mastered words.'
              : 'Master high-frequency CAT words with real 6-sentence usage tests.'}
          </p>
        </div>

        {/* Primary Practice Launcher Button */}
        <button
          type="button"
          onClick={() => onOpenPracticeConfig('random')}
          className={`w-full py-4 px-6 text-white font-black font-display text-base tracking-wider uppercase rounded-2xl border-3 border-black shadow-[4px_4px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0px_0px_#000] transition-all flex items-center justify-center gap-2 cursor-pointer ${
            isLvl2 ? 'bg-[#FF2E93] hover:bg-[#E0267F]' : 'bg-[#A855F7] hover:bg-[#9333EA]'
          }`}
        >
          <Play className="w-5 h-5 fill-white stroke-[2.5]" />
          START {isLvl2 ? 'LEVEL II' : 'STUDY'} SESSION
        </button>
      </section>

      {/* Quick Mode Chips */}
      <section className="space-y-2.5">
        <span className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest px-1">
          ⚡ Quick Study Modes ({isLvl2 ? 'Level II' : 'Level I'})
        </span>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onOpenPracticeConfig('weak')}
            className="p-3.5 bg-[#FF6B6B] hover:bg-[#FF5252] text-black border-2.5 border-black rounded-2xl shadow-[3.5px_3.5px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#000] transition-all flex items-center gap-2.5 cursor-pointer text-left font-extrabold"
          >
            <div className="w-9 h-9 rounded-xl bg-white border-2 border-black text-rose-600 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xs font-black block leading-tight uppercase">Weak Words</span>
              <span className="text-[10px] text-black/80 font-bold">Focus on errors</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onOpenPracticeConfig('less')}
            className="p-3.5 bg-[#FFC72C] hover:bg-[#FFB700] text-black border-2.5 border-black rounded-2xl shadow-[3.5px_3.5px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#000] transition-all flex items-center gap-2.5 cursor-pointer text-left font-extrabold"
          >
            <div className="w-9 h-9 rounded-xl bg-white border-2 border-black text-amber-700 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xs font-black block leading-tight uppercase">Unseen Words</span>
              <span className="text-[10px] text-black/80 font-bold">Rare & low attempts</span>
            </div>
          </button>
        </div>
      </section>

      {/* Vocabulary Metrics Cards Grid */}
      <section className="space-y-2.5">
        <span className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest px-1">
          📊 Study Statistics ({isLvl2 ? 'Level II' : 'Level I'})
        </span>

        <div className="grid grid-cols-2 gap-3">
          {/* Total Words */}
          <div className="bg-white dark:bg-slate-900 border-2.5 border-black dark:border-white rounded-2xl p-4 shadow-[3.5px_3.5px_0px_0px_#000] dark:shadow-[3.5px_3.5px_0px_0px_#A855F7] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900 border-2 border-black dark:border-white text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-lg">
              <BookOpen className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 block">Total Deck</span>
              <strong className="text-2xl font-black font-display text-slate-900 dark:text-white block leading-none mt-0.5">
                {vocabularyCount}
              </strong>
            </div>
          </div>

          {/* Mastered */}
          <div className="bg-[#4ADE80] text-black border-2.5 border-black rounded-2xl p-4 shadow-[3.5px_3.5px_0px_0px_#000] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border-2 border-black text-emerald-700 flex items-center justify-center font-bold text-lg">
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-black/80 block">Mastered 🎉</span>
              <strong className="text-2xl font-black font-display text-black block leading-none mt-0.5">
                {masteredCount}
              </strong>
            </div>
          </div>

          {/* Needs Work */}
          <div className="bg-[#FF8A8A] text-black border-2.5 border-black rounded-2xl p-4 shadow-[3.5px_3.5px_0px_0px_#000] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border-2 border-black text-rose-700 flex items-center justify-center font-bold text-lg">
              <Target className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-black/80 block">Needs Work</span>
              <strong className="text-2xl font-black font-display text-black block leading-none mt-0.5">
                {needsWorkCount}
              </strong>
            </div>
          </div>

          {/* Accuracy */}
          <div className="bg-[#38BDF8] text-black border-2.5 border-black rounded-2xl p-4 shadow-[3.5px_3.5px_0px_0px_#000] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border-2 border-black text-blue-700 flex items-center justify-center font-bold text-lg">
              <Award className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-black/80 block">Accuracy 🎯</span>
              <strong className="text-2xl font-black font-display text-black block leading-none mt-0.5">
                {Math.round(accuracyPercent)}%
              </strong>
            </div>
          </div>
        </div>
      </section>

      {/* Mastery Progress Bar Card */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 border-2.5 border-black dark:border-white shadow-[3.5px_3.5px_0px_0px_#000] dark:shadow-[3.5px_3.5px_0px_0px_#A855F7] space-y-2">
        <div className="flex items-center justify-between text-xs font-black uppercase">
          <span className="text-slate-900 dark:text-white">Level {isLvl2 ? 'II' : 'I'} Mastery</span>
          <span className="text-purple-600 dark:text-purple-400 font-extrabold">{Math.round(masteringProgress)}%</span>
        </div>
        <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 border-2 border-black dark:border-white rounded-xl overflow-hidden p-0.5">
          <div
            className={`h-full rounded-lg transition-all duration-500 border border-black ${isLvl2 ? 'bg-[#FF2E93]' : 'bg-[#A855F7]'}`}
            style={{ width: `${Math.min(100, masteringProgress)}%` }}
          />
        </div>
      </section>
    </div>
  );
};
