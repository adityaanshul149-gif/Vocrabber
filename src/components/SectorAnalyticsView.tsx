import React, { useState } from 'react';
import { VocabularyRecord, ProgressRecord, AppLevel } from '../types';
import { StorageService } from '../services/storage';
import { VocabularyService } from '../services/vocabulary';
import { Copy, Download, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface SectorAnalyticsViewProps {
  vocabulary: VocabularyRecord[];
  progress: ProgressRecord[];
  onDataChanged: () => void;
  appLevel?: AppLevel;
}

export const SectorAnalyticsView: React.FC<SectorAnalyticsViewProps> = ({
  vocabulary,
  progress,
  onDataChanged,
  appLevel = 'lvl1'
}) => {
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('alphabetical');
  const [expandedSector, setExpandedSector] = useState<string | null>(null);
  const [selectedWordIds, setSelectedWordIds] = useState<Set<string>>(new Set());
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const progressMap = new Map<string, ProgressRecord>(progress.map(p => [p.vocabularyId, p]));
  const progressLvl1Map = new Map<string, ProgressRecord>(StorageService.getProgress('lvl1').map(p => [p.vocabularyId, p]));

  const activeVocab = appLevel === 'lvl2'
    ? vocabulary.filter(v => StorageService.getLearningState(progressLvl1Map.get(v.id) || null) === 'Mastered')
    : vocabulary;

  // Group words by sector
  const sectorGroups = new Map<
    string,
    { name: string; words: { word: VocabularyRecord; progress: ProgressRecord | null }[] }
  >();

  activeVocab.forEach(word => {
    if (!sectorGroups.has(word.sector)) {
      sectorGroups.set(word.sector, { name: word.sector, words: [] });
    }
    sectorGroups.get(word.sector)!.words.push({
      word,
      progress: progressMap.get(word.id) || null
    });
  });

  const sectorStatsList = Array.from(sectorGroups.values()).map(group => {
    const total = group.words.length;
    let attempts = 0;
    let correct = 0;
    let mastered = 0;
    let needsWork = 0;
    let learning = 0;
    let encountered = 0;
    let totalPoints = 0;

    group.words.forEach(item => {
      const p = item.progress;
      const state = StorageService.getLearningState(p);
      const score = StorageService.getWordScore(p);

      if (p) {
        attempts += p.attempts || 0;
        correct += p.correct || 0;
      }

      if (state !== 'Never Practiced') {
        encountered++;
        totalPoints += score;
      }
      if (state === 'Mastered') mastered++;
      if (state === 'Needs Work') needsWork++;
      if (state === 'Learning') learning++;
    });

    const averageScore = total > 0 ? totalPoints / total : 0;
    const accuracy = attempts > 0 ? (correct / attempts) * 100 : 0;
    const progressPercent = total > 0 ? (encountered / total) * 100 : 0;

    let status = 'all';
    if (mastered === total && total > 0) status = 'completed';
    else if (needsWork > 0 || totalPoints < 0) status = 'attention';
    else if (mastered > 0 || totalPoints >= 5) status = 'nearly';

    return {
      name: group.name,
      words: group.words,
      total,
      encountered,
      neverPracticed: total - encountered,
      mastered,
      needsWork,
      learning,
      totalPoints,
      averageScore,
      accuracy,
      attempts,
      progressPercent,
      status
    };
  });

  // Filter & sort
  const filteredSectors = sectorStatsList.filter(s => {
    if (filter === 'all') return true;
    return s.status === filter;
  });

  filteredSectors.sort((a, b) => {
    if (sort === 'points-asc') return a.totalPoints - b.totalPoints; // Weakest / lowest score first
    if (sort === 'points-desc') return b.totalPoints - a.totalPoints;
    if (sort === 'progress') return b.progressPercent - a.progressPercent;
    if (sort === 'total') return b.total - a.total;
    return a.name.localeCompare(b.name);
  });

  const handleDeleteWords = (ids: string[]) => {
    if (ids.length === 0) return;
    if (
      !window.confirm(
        `Delete ${ids.length} word${ids.length === 1 ? '' : 's'}? This action cannot be undone.`
      )
    )
      return;

    const idSet = new Set(ids);
    const newVocab = vocabulary.filter(v => !idSet.has(v.id));
    const newProg = progress.filter(p => !idSet.has(p.vocabularyId));

    StorageService.setVocabulary(newVocab);
    StorageService.setProgress(newProg);
    setSelectedWordIds(new Set());
    setActionMessage(`Deleted ${ids.length} word(s).`);
    onDataChanged();
  };

  const handleCopySector = async (sectorWords: VocabularyRecord[], sectorName: string) => {
    const text = VocabularyService.exportToPipeFormat(sectorWords);
    try {
      await navigator.clipboard.writeText(text);
      setActionMessage(`Copied ${sectorName} dataset to clipboard.`);
    } catch {
      setActionMessage(`Failed to copy to clipboard.`);
    }
  };

  const handleExportSector = (sectorWords: VocabularyRecord[], sectorName: string) => {
    const text = VocabularyService.exportToPipeFormat(sectorWords);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${sectorName.replace(/[^A-Za-z0-9]+/g, '_')}_Vocabulary.txt`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
    setActionMessage(`Exported ${sectorName} dataset.`);
  };

  return (
    <div className="space-y-4 font-sans max-w-md mx-auto">
      {/* Controls Bar */}
      <div className="grid grid-cols-2 gap-2 bg-white dark:bg-slate-900 border-2.5 border-black dark:border-white rounded-2xl p-3 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#A855F7]">
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="bg-slate-50 dark:bg-slate-800 border-2 border-black dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-900 dark:text-slate-100 font-black focus:outline-none focus:border-purple-600 uppercase"
        >
          <option value="all">ALL SECTORS</option>
          <option value="attention">NEEDS ATTENTION</option>
          <option value="nearly">NEARLY MASTERED</option>
          <option value="completed">COMPLETED</option>
        </select>

        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="bg-slate-50 dark:bg-slate-800 border-2 border-black dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-900 dark:text-slate-100 font-black focus:outline-none focus:border-purple-600 uppercase"
        >
          <option value="points-asc">POINTS (WEAKEST FIRST)</option>
          <option value="points-desc">POINTS (HIGHEST FIRST)</option>
          <option value="alphabetical">ALPHABETICAL</option>
          <option value="progress">PROGRESS</option>
          <option value="total">TOTAL WORDS</option>
        </select>
      </div>

      {actionMessage && (
        <p className="text-xs text-black bg-[#FFE600] border-2 border-black rounded-xl p-3 font-black uppercase shadow-[2px_2px_0px_0px_#000]">
          ⚡ {actionMessage}
        </p>
      )}

      {/* Sector Cards Stack */}
      <div className="space-y-3">
        {filteredSectors.length === 0 ? (
          <div className="text-center p-8 text-slate-700 dark:text-slate-300 text-xs bg-white dark:bg-slate-900 rounded-2xl border-2.5 border-black dark:border-white shadow-[4px_4px_0px_0px_#000] font-black uppercase">
            No sectors match current filter options.
          </div>
        ) : (
          filteredSectors.map(stats => {
            const isExpanded = expandedSector === stats.name;
            const sectorWordsList = stats.words.map(w => w.word);

            const getScoreColorBg = (pts: number) => {
              if (pts > 0) return 'bg-[#4ADE80] text-black';
              if (pts < 0) return 'bg-[#FF6B6B] text-black';
              return 'bg-[#FFE600] text-black';
            };

            return (
              <div
                key={stats.name}
                className="bg-white dark:bg-slate-900 border-2.5 border-black dark:border-white rounded-2xl p-4 space-y-3 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#A855F7] transition-all"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-black font-display text-slate-900 dark:text-white text-base uppercase">{stats.name}</h3>
                  <span className={`text-xs font-black px-2.5 py-1 border-2 border-black rounded-lg ${getScoreColorBg(stats.totalPoints)}`}>
                    {stats.totalPoints > 0 ? `+${stats.totalPoints}` : stats.totalPoints} PTS
                  </span>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 font-bold truncate">
                  {sectorWordsList.slice(0, 3).map(w => w.word).join(' · ') || 'No words'}
                </p>

                <div className="flex items-center justify-between text-xs text-black dark:text-slate-400 font-bold pt-2 border-t-2 border-black/10 dark:border-slate-800">
                  <span className="uppercase">
                    {stats.total} words · {Math.round(stats.progressPercent)}% seen
                  </span>
                  <button
                    type="button"
                    onClick={() => setExpandedSector(isExpanded ? null : stats.name)}
                    className="text-black dark:text-white font-black underline text-xs flex items-center gap-1 cursor-pointer"
                  >
                    {isExpanded ? (
                      <>
                        Collapse <ChevronUp className="w-3.5 h-3.5 stroke-[2.5]" />
                      </>
                    ) : (
                      <>
                        Details <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                      </>
                    )}
                  </button>
                </div>

                {isExpanded && (
                  <div className="pt-3 border-t-2 border-black dark:border-slate-800 space-y-3">
                    <div className="grid grid-cols-3 gap-2 bg-[#FFE600]/20 dark:bg-slate-800 p-3 rounded-xl border-2 border-black dark:border-slate-700 text-center text-xs">
                      <div>
                        <span className="text-black dark:text-slate-400 block text-[10px] font-black uppercase">Total</span>
                        <strong className="text-slate-900 dark:text-white font-black">{stats.total}</strong>
                      </div>
                      <div>
                        <span className="text-emerald-700 dark:text-emerald-400 block text-[10px] font-black uppercase">Mastered</span>
                        <strong className="text-emerald-700 dark:text-emerald-400 font-black">{stats.mastered}</strong>
                      </div>
                      <div>
                        <span className="text-rose-700 dark:text-rose-400 block text-[10px] font-black uppercase">Needs Work</span>
                        <strong className="text-rose-700 dark:text-rose-400 font-black">{stats.needsWork}</strong>
                      </div>
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-1.5 p-1">
                      {sectorWordsList.map(w => {
                        const isChecked = selectedWordIds.has(w.id);
                        const p = progressMap.get(w.id) || null;
                        const state = StorageService.getLearningState(p);

                        return (
                          <label
                            key={w.id}
                            className={`flex items-center justify-between p-2.5 rounded-xl border-2 text-xs cursor-pointer transition-all ${
                              isChecked
                                ? 'bg-[#FFE600] text-black border-black font-black'
                                : 'bg-slate-50 dark:bg-slate-800/80 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  const next = new Set(selectedWordIds);
                                  if (next.has(w.id)) next.delete(w.id);
                                  else next.add(w.id);
                                  setSelectedWordIds(next);
                                }}
                                className="accent-black w-4 h-4 cursor-pointer"
                              />
                              <span className="font-black uppercase">{w.word}</span>
                            </div>
                            <span className="text-[10px] font-black uppercase">{state}</span>
                          </label>
                        );
                      })}
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2 border-t-2 border-black dark:border-slate-800 text-xs">
                      <button
                        type="button"
                        onClick={() => handleCopySector(sectorWordsList, stats.name)}
                        className="px-3 py-1.5 bg-[#FFE600] text-black font-black border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <Copy className="w-3.5 h-3.5 stroke-[2.5]" />
                        Copy
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExportSector(sectorWordsList, stats.name)}
                        className="px-3 py-1.5 bg-white text-black font-black border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                        Export
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteWords(Array.from(selectedWordIds))}
                        className="px-3 py-1.5 bg-[#FF6B6B] text-black font-black border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
