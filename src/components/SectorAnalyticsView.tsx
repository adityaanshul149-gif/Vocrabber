import React, { useState } from 'react';
import { VocabularyRecord, ProgressRecord } from '../types';
import { StorageService } from '../services/storage';
import { VocabularyService } from '../services/vocabulary';
import { Copy, Download, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface SectorAnalyticsViewProps {
  vocabulary: VocabularyRecord[];
  progress: ProgressRecord[];
  onDataChanged: () => void;
}

export const SectorAnalyticsView: React.FC<SectorAnalyticsViewProps> = ({
  vocabulary,
  progress,
  onDataChanged
}) => {
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('alphabetical');
  const [expandedSector, setExpandedSector] = useState<string | null>(null);
  const [selectedWordIds, setSelectedWordIds] = useState<Set<string>>(new Set());
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const progressMap = new Map<string, ProgressRecord>(progress.map(p => [p.vocabularyId, p]));

  // Group words by sector
  const sectorGroups = new Map<
    string,
    { name: string; words: { word: VocabularyRecord; progress: ProgressRecord | null }[] }
  >();

  vocabulary.forEach(word => {
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

    group.words.forEach(item => {
      const p = item.progress;
      const state = StorageService.getLearningState(p);

      if (p) {
        attempts += p.attempts || 0;
        correct += p.correct || 0;
      }

      if (state !== 'Never Practiced') encountered++;
      if (state === 'Mastered') mastered++;
      if (state === 'Needs Work') needsWork++;
      if (state === 'Learning') learning++;
    });

    const accuracy = attempts > 0 ? (correct / attempts) * 100 : 0;
    const progressPercent = total > 0 ? (encountered / total) * 100 : 0;

    let status = 'all';
    if (mastered === total && total > 0) status = 'completed';
    else if (needsWork > 0) status = 'attention';
    else if (mastered > 0 || accuracy >= 80) status = 'nearly';

    return {
      name: group.name,
      words: group.words,
      total,
      encountered,
      neverPracticed: total - encountered,
      mastered,
      needsWork,
      learning,
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
    if (sort === 'accuracy') return b.accuracy - a.accuracy;
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
      <div className="grid grid-cols-2 gap-2 bg-white border border-purple-100 rounded-3xl p-3 shadow-2xs">
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-2xl px-2.5 py-2 text-xs text-slate-700 font-bold focus:outline-none focus:border-purple-500"
        >
          <option value="all">ALL SECTORS</option>
          <option value="attention">NEEDS ATTENTION</option>
          <option value="nearly">NEARLY MASTERED</option>
          <option value="completed">COMPLETED</option>
        </select>

        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-2xl px-2.5 py-2 text-xs text-slate-700 font-bold focus:outline-none focus:border-purple-500"
        >
          <option value="alphabetical">ALPHABETICAL</option>
          <option value="accuracy">ACCURACY</option>
          <option value="progress">PROGRESS</option>
          <option value="total">TOTAL WORDS</option>
        </select>
      </div>

      {actionMessage && (
        <p className="text-xs text-purple-800 bg-purple-50 border border-purple-200 rounded-2xl p-3 font-semibold">
          ✨ {actionMessage}
        </p>
      )}

      {/* Sector Cards Stack */}
      <div className="space-y-3">
        {filteredSectors.length === 0 ? (
          <div className="text-center p-8 text-slate-400 text-xs bg-white rounded-3xl border border-slate-100 font-medium">
            No sectors match current filter options.
          </div>
        ) : (
          filteredSectors.map(stats => {
            const isExpanded = expandedSector === stats.name;
            const sectorWordsList = stats.words.map(w => w.word);

            return (
              <div
                key={stats.name}
                className="bg-white border border-purple-100 rounded-3xl p-4 space-y-3 shadow-2xs hover:border-purple-300 transition-all"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold font-display text-slate-900 text-base">{stats.name}</h3>
                  <span className="text-xs font-bold px-2.5 py-1 bg-purple-100 text-purple-800 rounded-full">
                    {Math.round(stats.accuracy)}%
                  </span>
                </div>

                <p className="text-xs text-slate-500 font-medium truncate">
                  {sectorWordsList.slice(0, 3).map(w => w.word).join(' · ') || 'No words'}
                </p>

                <div className="flex items-center justify-between text-xs text-slate-400 font-medium pt-2 border-t border-slate-100">
                  <span>
                    {stats.total} words · {Math.round(stats.progressPercent)}% encountered
                  </span>
                  <button
                    type="button"
                    onClick={() => setExpandedSector(isExpanded ? null : stats.name)}
                    className="text-purple-600 hover:underline font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    {isExpanded ? (
                      <>
                        Collapse <ChevronUp className="w-3.5 h-3.5" />
                      </>
                    ) : (
                      <>
                        View Details <ChevronDown className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>

                {isExpanded && (
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <div className="grid grid-cols-3 gap-2 bg-purple-50/60 p-3 rounded-2xl text-center text-xs">
                      <div>
                        <span className="text-slate-500 block text-[10px] font-bold uppercase">Total</span>
                        <strong className="text-slate-900 font-extrabold">{stats.total}</strong>
                      </div>
                      <div>
                        <span className="text-emerald-700 block text-[10px] font-bold uppercase">Mastered</span>
                        <strong className="text-emerald-700 font-extrabold">{stats.mastered}</strong>
                      </div>
                      <div>
                        <span className="text-rose-700 block text-[10px] font-bold uppercase">Needs Work</span>
                        <strong className="text-rose-700 font-extrabold">{stats.needsWork}</strong>
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
                            className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50 text-xs cursor-pointer hover:border-purple-200"
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
                                className="accent-purple-600 w-4 h-4 cursor-pointer"
                              />
                              <span className="font-bold text-slate-900 capitalize">{w.word}</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-500">{state}</span>
                          </label>
                        );
                      })}
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 text-xs">
                      <button
                        type="button"
                        onClick={() => handleCopySector(sectorWordsList, stats.name)}
                        className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Copy
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExportSector(sectorWordsList, stats.name)}
                        className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Export
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteWords(Array.from(selectedWordIds))}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
