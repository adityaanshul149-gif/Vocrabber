import React from 'react';
import { VocabularyRecord, ProgressRecord, SessionData } from '../types';
import { StorageService } from '../services/storage';

interface AnalyticsViewProps {
  vocabulary: VocabularyRecord[];
  progress: ProgressRecord[];
  session: SessionData | null;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  vocabulary,
  progress,
  session
}) => {
  const progressMap = new Map<string, ProgressRecord>(progress.map(p => [p.vocabularyId, p]));

  let totalAttempts = 0;
  let totalCorrect = 0;
  let masteredCount = 0;
  let needsWorkCount = 0;
  let encounteredCount = 0;

  vocabulary.forEach(v => {
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

  const neverPracticedCount = vocabulary.length - encounteredCount;
  const overallAccuracy = totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0;

  const sessionReviewed = session?.reviewedCount || 0;
  const sessionCorrect = session?.correctCount || 0;
  const sessionAccuracy = sessionReviewed > 0 ? (sessionCorrect / sessionReviewed) * 100 : 0;

  const masteringPercent = vocabulary.length > 0 ? (masteredCount / vocabulary.length) * 100 : 0;

  const recentActivity = session?.sessionStatistics?.recentActivity || [];

  return (
    <div className="space-y-4 font-sans max-w-md mx-auto">
      {/* 6 Top Stat Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-white border border-purple-100 rounded-3xl p-3.5 shadow-2xs">
          <span className="text-slate-500 text-[11px] font-semibold block">Total Vocabulary</span>
          <strong className="text-2xl font-black text-slate-900 block mt-0.5">
            {vocabulary.length}
          </strong>
        </div>
        <div className="bg-white border border-purple-100 rounded-3xl p-3.5 shadow-2xs">
          <span className="text-purple-600 text-[11px] font-semibold block">Encountered</span>
          <strong className="text-2xl font-black text-purple-700 block mt-0.5">
            {encounteredCount}
          </strong>
        </div>
        <div className="bg-emerald-50 border border-emerald-200/80 rounded-3xl p-3.5">
          <span className="text-emerald-700 text-[11px] font-bold block">Mastered</span>
          <strong className="text-2xl font-black text-emerald-800 block mt-0.5">
            {masteredCount}
          </strong>
        </div>
        <div className="bg-rose-50 border border-rose-200/80 rounded-3xl p-3.5">
          <span className="text-rose-700 text-[11px] font-bold block">Needs Work</span>
          <strong className="text-2xl font-black text-rose-800 block mt-0.5">
            {needsWorkCount}
          </strong>
        </div>
        <div className="bg-slate-100 border border-slate-200 rounded-3xl p-3.5">
          <span className="text-slate-600 text-[11px] font-semibold block">Never Practiced</span>
          <strong className="text-2xl font-black text-slate-700 block mt-0.5">
            {neverPracticedCount}
          </strong>
        </div>
        <div className="bg-indigo-50 border border-indigo-200/80 rounded-3xl p-3.5">
          <span className="text-indigo-700 text-[11px] font-bold block">Accuracy Rate</span>
          <strong className="text-2xl font-black text-indigo-800 block mt-0.5">
            {Math.round(overallAccuracy)}%
          </strong>
        </div>
      </div>

      {/* Analytics Progress Bar Cards */}
      <div className="bg-white border border-purple-100 rounded-3xl p-5 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="font-extrabold text-slate-900 text-sm">Mastering Progress</h3>
          <span className="text-xs text-emerald-600 font-extrabold">
            {Math.round(masteringPercent)}%
          </span>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1 font-medium">
              <span>Mastered Words</span>
              <span className="font-extrabold text-slate-800">
                {masteredCount} / {vocabulary.length}
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                style={{ width: `${Math.min(100, masteringPercent)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1 font-medium">
              <span>Accuracy Distribution</span>
              <span className="font-extrabold text-slate-800">
                {Math.round(overallAccuracy)}%
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-purple-600 transition-all duration-300 rounded-full"
                style={{ width: `${Math.min(100, overallAccuracy)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Live Statistics Grid */}
      <div className="bg-white border border-purple-100 rounded-3xl p-5 space-y-3 shadow-2xs">
        <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">
          Practice Lifetime Overview
        </h3>
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[11px] text-slate-500 font-medium block">Total Attempts</span>
            <strong className="text-lg font-extrabold text-slate-900 block mt-0.5">
              {totalAttempts}
            </strong>
          </div>
          <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100">
            <span className="text-[11px] text-emerald-700 font-medium block">Total Correct</span>
            <strong className="text-lg font-extrabold text-emerald-700 block mt-0.5">
              {totalCorrect}
            </strong>
          </div>
          <div className="p-3 bg-rose-50/60 rounded-2xl border border-rose-100">
            <span className="text-[11px] text-rose-700 font-medium block">Total Incorrect</span>
            <strong className="text-lg font-extrabold text-rose-700 block mt-0.5">
              {totalAttempts - totalCorrect}
            </strong>
          </div>
          <div className="p-3 bg-purple-50/60 rounded-2xl border border-purple-100">
            <span className="text-[11px] text-purple-700 font-medium block">Session Reviewed</span>
            <strong className="text-lg font-extrabold text-purple-700 block mt-0.5">
              {sessionReviewed}
            </strong>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-purple-100 rounded-3xl p-5 space-y-3 shadow-2xs">
        <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">
          Recent Activity (Last 10)
        </h3>
        {recentActivity.length === 0 ? (
          <p className="text-xs text-slate-400 py-2 font-medium">No reviewed words in this session yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentActivity.map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 capitalize">{item.word}</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                      item.wasCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {item.wasCorrect ? '✔ Correct' : '✘ Incorrect'}
                  </span>
                  <span className="text-slate-400 text-[11px]">
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
