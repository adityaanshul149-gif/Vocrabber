import React from 'react';
import { VocabularyRecord, ProgressRecord, SessionData, AppLevel } from '../types';
import { StorageService } from '../services/storage';

interface AnalyticsViewProps {
  vocabulary: VocabularyRecord[];
  progress: ProgressRecord[];
  session: SessionData | null;
  appLevel?: AppLevel;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  vocabulary,
  progress,
  session,
  appLevel = 'lvl1'
}) => {
  const isLvl2 = appLevel === 'lvl2';
  const progressMap = new Map<string, ProgressRecord>(progress.map(p => [p.vocabularyId, p]));
  const progressLvl1Map = new Map<string, ProgressRecord>(StorageService.getProgress('lvl1').map(p => [p.vocabularyId, p]));

  const activeVocab = isLvl2
    ? vocabulary.filter(v => StorageService.getLearningState(progressLvl1Map.get(v.id) || null) === 'Mastered')
    : vocabulary;

  let totalAttempts = 0;
  let totalCorrect = 0;
  let masteredCount = 0;
  let needsWorkCount = 0;
  let encounteredCount = 0;

  activeVocab.forEach(v => {
    const p = progressMap.get(v.id) || null;
    const state = StorageService.getLearningState(p);

    if (p) {
      totalAttempts += p.attempts || 0;
      totalCorrect += p.correct || 0;
    }

    if (state !== 'Never Practiced') {
      encounteredCount++;
    }
    if (state === 'Mastered') {
      masteredCount++;
    }
    if (state === 'Needs Work') {
      needsWorkCount++;
    }
  });

  const neverPracticedCount = activeVocab.length - encounteredCount;
  const overallAccuracy = totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0;

  const getAccuracyColorBg = (acc: number) => {
    if (acc >= 90) return 'bg-[#4ADE80] text-black';
    if (acc >= 70) return 'bg-[#FFE600] text-black';
    return 'bg-[#FF6B6B] text-black';
  };

  const sessionReviewed = session?.reviewedCount || 0;
  const sessionCorrect = session?.correctCount || 0;
  const sessionAccuracy = sessionReviewed > 0 ? (sessionCorrect / sessionReviewed) * 100 : 0;

  const masteringPercent = activeVocab.length > 0 ? (masteredCount / activeVocab.length) * 100 : 0;

  const recentActivity = session?.sessionStatistics?.recentActivity || [];

  return (
    <div className="space-y-4 font-sans max-w-md mx-auto">
      {/* Level Indicator Banner */}
      <div className={`p-3 rounded-2xl border-2.5 border-black flex items-center justify-between shadow-[3.5px_3.5px_0px_0px_#000] ${
        isLvl2 ? 'bg-[#FF2E93] text-white shadow-[3.5px_3.5px_0px_0px_#00F0FF]' : 'bg-[#FFE600] text-black'
      }`}>
        <span className="font-black font-display uppercase text-xs tracking-wider">
          {isLvl2 ? '⚡ LEVEL II Analytics (Definitions Quiz)' : '✨ LEVEL I Analytics (Sentences Practice)'}
        </span>
        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-lg border border-black bg-white text-black">
          {isLvl2 ? 'Intense' : 'Standard'}
        </span>
      </div>

      {/* 6 Top Stat Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-slate-900 border-2.5 border-black dark:border-white rounded-2xl p-3.5 shadow-[3.5px_3.5px_0px_0px_#000] dark:shadow-[3.5px_3.5px_0px_0px_#A855F7]">
          <span className="text-black dark:text-slate-400 text-[10px] font-black uppercase block">Total Deck</span>
          <strong className="text-2xl font-black font-display text-slate-900 dark:text-white block mt-0.5">
            {activeVocab.length}
          </strong>
        </div>
        <div className="bg-[#FFE600] text-black border-2.5 border-black rounded-2xl p-3.5 shadow-[3.5px_3.5px_0px_0px_#000]">
          <span className="text-black/80 text-[10px] font-black uppercase block">Encountered</span>
          <strong className="text-2xl font-black font-display text-black block mt-0.5">
            {encounteredCount}
          </strong>
        </div>
        <div className="bg-[#4ADE80] text-black border-2.5 border-black rounded-2xl p-3.5 shadow-[3.5px_3.5px_0px_0px_#000]">
          <span className="text-black/80 text-[10px] font-black uppercase block">Mastered</span>
          <strong className="text-2xl font-black font-display text-black block mt-0.5">
            {masteredCount}
          </strong>
        </div>
        <div className="bg-[#FF6B6B] text-black border-2.5 border-black rounded-2xl p-3.5 shadow-[3.5px_3.5px_0px_0px_#000]">
          <span className="text-black/80 text-[10px] font-black uppercase block">Needs Work</span>
          <strong className="text-2xl font-black font-display text-black block mt-0.5">
            {needsWorkCount}
          </strong>
        </div>
        <div className="bg-slate-200 dark:bg-slate-800 text-black dark:text-white border-2.5 border-black dark:border-white rounded-2xl p-3.5 shadow-[3.5px_3.5px_0px_0px_#000]">
          <span className="text-black/70 dark:text-slate-400 text-[10px] font-black uppercase block">Unseen</span>
          <strong className="text-2xl font-black font-display block mt-0.5">
            {neverPracticedCount}
          </strong>
        </div>
        <div className={`${getAccuracyColorBg(overallAccuracy)} border-2.5 border-black rounded-2xl p-3.5 shadow-[3.5px_3.5px_0px_0px_#000]`}>
          <span className="text-black/80 text-[10px] font-black uppercase block">Accuracy</span>
          <strong className="text-2xl font-black font-display text-black block mt-0.5">
            {Math.round(overallAccuracy)}%
          </strong>
        </div>
      </div>

      {/* Analytics Progress Bar Cards */}
      <div className="bg-white dark:bg-slate-900 border-2.5 border-black dark:border-white rounded-2xl p-5 space-y-4 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#A855F7]">
        <div className="flex items-center justify-between border-b-2 border-black dark:border-slate-800 pb-2">
          <h3 className="font-black font-display uppercase text-slate-900 dark:text-white text-sm">Mastering Progress</h3>
          <span className="text-xs font-black text-purple-600 dark:text-purple-400">
            {Math.round(masteringPercent)}%
          </span>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs text-black dark:text-slate-300 mb-1 font-bold">
              <span>Mastered Words</span>
              <span className="font-black text-slate-900 dark:text-white">
                {masteredCount} / {vocabulary.length}
              </span>
            </div>
            <div className="h-3.5 rounded-xl bg-slate-200 dark:bg-slate-800 border-2 border-black dark:border-white overflow-hidden p-0.5">
              <div
                className="h-full bg-[#4ADE80] transition-all duration-300 rounded-lg border border-black"
                style={{ width: `${Math.min(100, masteringPercent)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-black dark:text-slate-300 mb-1 font-bold">
              <span>Accuracy Distribution</span>
              <span className="font-black text-slate-900 dark:text-white">
                {Math.round(overallAccuracy)}%
              </span>
            </div>
            <div className="h-3.5 rounded-xl bg-slate-200 dark:bg-slate-800 border-2 border-black dark:border-white overflow-hidden p-0.5">
              <div
                className="h-full bg-[#A855F7] transition-all duration-300 rounded-lg border border-black"
                style={{ width: `${Math.min(100, overallAccuracy)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Live Statistics Grid */}
      <div className="bg-white dark:bg-slate-900 border-2.5 border-black dark:border-white rounded-2xl p-5 space-y-3 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#A855F7]">
        <h3 className="font-black font-display uppercase text-slate-900 dark:text-white text-sm border-b-2 border-black dark:border-slate-800 pb-2">
          Practice Lifetime Overview
        </h3>
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl border-2 border-black dark:border-slate-700">
            <span className="text-[10px] font-black uppercase text-slate-700 dark:text-slate-400 block">Total Attempts</span>
            <strong className="text-lg font-black font-display text-slate-900 dark:text-white block mt-0.5">
              {totalAttempts}
            </strong>
          </div>
          <div className="p-3 bg-[#4ADE80] text-black rounded-xl border-2 border-black">
            <span className="text-[10px] font-black uppercase text-black/80 block">Total Correct</span>
            <strong className="text-lg font-black font-display text-black block mt-0.5">
              {totalCorrect}
            </strong>
          </div>
          <div className="p-3 bg-[#FF6B6B] text-black rounded-xl border-2 border-black">
            <span className="text-[10px] font-black uppercase text-black/80 block">Total Incorrect</span>
            <strong className="text-lg font-black font-display text-black block mt-0.5">
              {totalAttempts - totalCorrect}
            </strong>
          </div>
          <div className="p-3 bg-[#FFE600] text-black rounded-xl border-2 border-black">
            <span className="text-[10px] font-black uppercase text-black/80 block">Session Reviewed</span>
            <strong className="text-lg font-black font-display text-black block mt-0.5">
              {sessionReviewed}
            </strong>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-slate-900 border-2.5 border-black dark:border-white rounded-2xl p-5 space-y-3 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#A855F7]">
        <h3 className="font-black font-display uppercase text-slate-900 dark:text-white text-sm border-b-2 border-black dark:border-slate-800 pb-2">
          Recent Activity (Last 10)
        </h3>
        {recentActivity.length === 0 ? (
          <p className="text-xs text-slate-500 py-2 font-bold uppercase">No reviewed words in this session yet.</p>
        ) : (
          <div className="divide-y-2 divide-black/10 dark:divide-slate-800">
            {recentActivity.map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                <span className="font-black text-slate-900 dark:text-white uppercase">{item.word}</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-black uppercase px-2 py-0.5 rounded-md text-[10px] border border-black ${
                      item.wasCorrect ? 'bg-[#4ADE80] text-black' : 'bg-[#FF6B6B] text-black'
                    }`}
                  >
                    {item.wasCorrect ? '✔ Correct' : '✘ Incorrect'}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] font-bold">
                    {new Date(item.reviewedAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
