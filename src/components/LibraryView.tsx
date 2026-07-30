import React, { useState, useMemo } from 'react';
import { VocabularyRecord, ProgressRecord } from '../types';
import { StorageService } from '../services/storage';
import { VocabularyService } from '../services/vocabulary';
import { VALID_SECTORS } from '../data/defaultVocabulary';
import { WordDetailModal } from './WordDetailModal';
import {
  Search,
  Download,
  Trash2,
  CheckSquare,
  Square,
  Copy,
  RotateCcw,
  Play,
  Shuffle,
  Eye,
  Filter,
  Check,
  X
} from 'lucide-react';

interface LibraryViewProps {
  vocabulary: VocabularyRecord[];
  progress: ProgressRecord[];
  onDataChanged: () => void;
  onPracticeSelectedWords?: (wordIds: string[]) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  vocabulary,
  progress,
  onDataChanged,
  onPracticeSelectedWords
}) => {
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTarget, setSearchTarget] = useState<'all' | 'word' | 'definition' | 'example' | 'sector' | 'id'>('all');

  // Filter state
  const [sectorFilter, setSectorFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [encounteredFilter, setEncounteredFilter] = useState('all');
  const [accuracyFilter, setAccuracyFilter] = useState('all');
  const [attemptsFilter, setAttemptsFilter] = useState('all');

  // Sort state
  const [sortKey, setSortKey] = useState<
    | 'word-asc'
    | 'word-desc'
    | 'id-asc'
    | 'id-desc'
    | 'accuracy-asc'
    | 'accuracy-desc'
    | 'attempts-asc'
    | 'attempts-desc'
    | 'reviewed-desc'
    | 'reviewed-asc'
    | 'status-asc'
    | 'random'
  >('word-asc');

  // Selection & Copy Notice state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeDetailWord, setActiveDetailWord] = useState<VocabularyRecord | null>(null);
  const [copyNotice, setCopyNotice] = useState(false);

  // Quick lookup map for progress
  const progressMap = useMemo(
    () => new Map<string, ProgressRecord>(progress.map(p => [p.vocabularyId, p])),
    [progress]
  );

  // Filter logic
  const filteredVocabulary = useMemo(() => {
    return vocabulary.filter(item => {
      const p = progressMap.get(item.id) || null;
      const state = StorageService.getLearningState(p);
      const attempts = p ? p.attempts : 0;
      const accuracy = p ? p.accuracy : 0;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        if (searchTarget === 'word' && !item.word.toLowerCase().includes(q)) return false;
        if (searchTarget === 'definition' && !item.definition.toLowerCase().includes(q)) return false;
        if (searchTarget === 'example' && !item.exampleUsage.toLowerCase().includes(q)) return false;
        if (searchTarget === 'sector' && !item.sector.toLowerCase().includes(q)) return false;
        if (searchTarget === 'id' && !item.id.toLowerCase().includes(q)) return false;

        if (searchTarget === 'all') {
          const match =
            item.word.toLowerCase().includes(q) ||
            item.definition.toLowerCase().includes(q) ||
            item.exampleUsage.toLowerCase().includes(q) ||
            item.sector.toLowerCase().includes(q) ||
            item.id.toLowerCase().includes(q);
          if (!match) return false;
        }
      }

      // Sector Filter
      if (sectorFilter !== 'all' && item.sector !== sectorFilter) return false;

      // Status Filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'never' && state !== 'Never Practiced') return false;
        if (statusFilter === 'learning' && state !== 'Learning') return false;
        if (statusFilter === 'needs-work' && state !== 'Needs Work') return false;
        if (statusFilter === 'mastered' && state !== 'Mastered') return false;
      }

      // Encountered Filter
      if (encounteredFilter !== 'all') {
        if (encounteredFilter === 'encountered' && attempts === 0) return false;
        if (encounteredFilter === 'never' && attempts > 0) return false;
      }

      // Accuracy Filter
      if (accuracyFilter !== 'all') {
        if (accuracyFilter === 'low' && (attempts === 0 || accuracy >= 0.5)) return false;
        if (accuracyFilter === 'med' && (accuracy < 0.5 || accuracy >= 0.8)) return false;
        if (accuracyFilter === 'high' && accuracy < 0.8) return false;
      }

      // Attempts Filter
      if (attemptsFilter !== 'all') {
        if (attemptsFilter === '0' && attempts !== 0) return false;
        if (attemptsFilter === '1-5' && (attempts < 1 || attempts > 5)) return false;
        if (attemptsFilter === '5+' && attempts <= 5) return false;
      }

      return true;
    });
  }, [
    vocabulary,
    progressMap,
    searchQuery,
    searchTarget,
    sectorFilter,
    statusFilter,
    encounteredFilter,
    accuracyFilter,
    attemptsFilter
  ]);

  // Sort logic
  const sortedVocabulary = useMemo(() => {
    const list = [...filteredVocabulary];

    if (sortKey === 'random') {
      // Deterministic shuffle view
      return list.sort(() => Math.sin(list.length) - 0.5);
    }

    list.sort((a, b) => {
      const pa = progressMap.get(a.id) || null;
      const pb = progressMap.get(b.id) || null;

      const accA = pa ? pa.accuracy : 0;
      const accB = pb ? pb.accuracy : 0;
      const attA = pa ? pa.attempts : 0;
      const attB = pb ? pb.attempts : 0;

      const dateA = pa?.lastReviewed ? new Date(pa.lastReviewed).getTime() : 0;
      const dateB = pb?.lastReviewed ? new Date(pb.lastReviewed).getTime() : 0;

      const stateA = StorageService.getLearningState(pa);
      const stateB = StorageService.getLearningState(pb);

      switch (sortKey) {
        case 'word-asc':
          return a.word.localeCompare(b.word);
        case 'word-desc':
          return b.word.localeCompare(a.word);
        case 'id-asc':
          return a.id.localeCompare(b.id);
        case 'id-desc':
          return b.id.localeCompare(a.id);
        case 'accuracy-asc':
          return accA - accB;
        case 'accuracy-desc':
          return accB - accA;
        case 'attempts-asc':
          return attA - attB;
        case 'attempts-desc':
          return attB - attA;
        case 'reviewed-desc':
          return dateB - dateA;
        case 'reviewed-asc':
          return dateA - dateB;
        case 'status-asc':
          return stateA.localeCompare(stateB);
        default:
          return a.word.localeCompare(b.word);
      }
    });

    return list;
  }, [filteredVocabulary, progressMap, sortKey]);

  // Selection handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.size === sortedVocabulary.length && sortedVocabulary.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedVocabulary.map(item => item.id)));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleInvertSelection = () => {
    const visibleIds = sortedVocabulary.map(v => v.id);
    const next = new Set<string>();
    visibleIds.forEach(id => {
      if (!selectedIds.has(id)) next.add(id);
    });
    setSelectedIds(next);
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  // Bulk Actions
  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    if (
      !window.confirm(
        `Permanently delete ${selectedIds.size} selected word${
          selectedIds.size === 1 ? '' : 's'
        }? This cannot be undone.`
      )
    ) {
      return;
    }

    const remainingVocab = vocabulary.filter(v => !selectedIds.has(v.id));
    const remainingProgress = progress.filter(p => !selectedIds.has(p.vocabularyId));

    StorageService.setVocabulary(remainingVocab);
    StorageService.setProgress(remainingProgress);
    setSelectedIds(new Set());
    onDataChanged();
  };

  const handleExportSelected = () => {
    if (selectedIds.size === 0) return;
    const selectedVocab = vocabulary.filter(v => selectedIds.has(v.id));
    const exportText = VocabularyService.exportToPipeFormat(selectedVocab);

    const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `voccrab_selected_${selectedVocab.length}_words.txt`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const handleCopySelected = () => {
    if (selectedIds.size === 0) return;
    const selectedVocab = vocabulary.filter(v => selectedIds.has(v.id));
    const exportText = VocabularyService.exportToPipeFormat(selectedVocab);

    navigator.clipboard.writeText(exportText).then(() => {
      setCopyNotice(true);
      setTimeout(() => setCopyNotice(false), 2500);
    });
  };

  const handleClearProgressSelected = () => {
    if (selectedIds.size === 0) return;
    if (
      !window.confirm(
        `Reset attempts, accuracy, and history for ${selectedIds.size} selected word${
          selectedIds.size === 1 ? '' : 's'
        }?`
      )
    ) {
      return;
    }

    const updatedProgress = progress.filter(p => !selectedIds.has(p.vocabularyId));
    StorageService.setProgress(updatedProgress);
    onDataChanged();
  };

  const handlePracticeSelected = () => {
    if (selectedIds.size === 0) return;
    if (onPracticeSelectedWords) {
      onPracticeSelectedWords(Array.from(selectedIds));
    }
  };

  const isAllVisibleSelected =
    sortedVocabulary.length > 0 && selectedIds.size === sortedVocabulary.length;

  return (
    <div className="space-y-4 font-sans max-w-md mx-auto">
      {/* Search Bar & Target Selector Card */}
      <div className="bg-white border border-purple-100 rounded-3xl p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-purple-700 uppercase tracking-wide flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-purple-600" />
            Library Filters
          </span>
          <span className="text-xs text-slate-500 font-semibold">
            <strong className="text-purple-700 font-extrabold">{sortedVocabulary.length}</strong> / {vocabulary.length} Words
          </span>
        </div>

        <div className="space-y-2">
          {/* Query Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search words, definitions, sectors..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-8 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500 font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Search Target */}
            <select
              value={searchTarget}
              onChange={e => setSearchTarget(e.target.value as unknown as typeof searchTarget)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-700 font-medium focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Fields</option>
              <option value="word">Word Only</option>
              <option value="definition">Definition</option>
              <option value="example">Example</option>
              <option value="sector">Sector</option>
              <option value="id">Word ID</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-700 font-medium focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Statuses</option>
              <option value="never">Never Practiced</option>
              <option value="learning">Learning</option>
              <option value="needs-work">Needs Work</option>
              <option value="mastered">Mastered</option>
            </select>
          </div>
        </div>

        {/* Sorting Row & Selection Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Sort:</span>
            <select
              value={sortKey}
              onChange={e => setSortKey(e.target.value as unknown as typeof sortKey)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 text-xs text-slate-700 font-medium focus:outline-none focus:border-purple-500"
            >
              <option value="word-asc">Alphabetical (A - Z)</option>
              <option value="word-desc">Alphabetical (Z - A)</option>
              <option value="accuracy-desc">Accuracy (High to Low)</option>
              <option value="accuracy-asc">Accuracy (Low to High)</option>
              <option value="attempts-desc">Most Attempted</option>
              <option value="random">Random Order</option>
            </select>
          </div>

          {/* Selection Tool Buttons */}
          <div className="flex items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={handleToggleSelectAll}
              className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              {isAllVisibleSelected ? <CheckSquare className="w-3.5 h-3.5 text-purple-600" /> : <Square className="w-3.5 h-3.5" />}
              {isAllVisibleSelected ? 'Deselect' : 'Select All'}
            </button>
          </div>
        </div>
      </div>

      {/* Floating Action Bar for Selected Words */}
      {selectedIds.size > 0 && (
        <div className="bg-purple-600 text-white rounded-2xl p-3 text-xs flex flex-wrap items-center justify-between gap-2 shadow-lg shadow-purple-600/20 animate-in fade-in">
          <span className="font-extrabold font-display text-sm">
            {selectedIds.size} SELECTED
          </span>

          <div className="flex items-center gap-1.5">
            {onPracticeSelectedWords && (
              <button
                type="button"
                onClick={handlePracticeSelected}
                className="px-3 py-1.5 bg-white text-purple-700 font-extrabold text-xs rounded-xl hover:bg-purple-50 flex items-center gap-1 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-purple-700" />
                Practice
              </button>
            )}

            <button
              type="button"
              onClick={handleExportSelected}
              className="px-2.5 py-1.5 bg-purple-500/80 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleDeleteSelected}
              className="px-2.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Vocabulary Cards List */}
      <div className="space-y-2.5">
        {sortedVocabulary.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center text-slate-400 border border-slate-100 text-xs font-medium">
            No matching vocabulary records found.
          </div>
        ) : (
          sortedVocabulary.map(item => {
            const p = progressMap.get(item.id) || null;
            const state = StorageService.getLearningState(p);
            const isSelected = selectedIds.has(item.id);

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isSelected
                    ? 'bg-purple-50/80 border-purple-400 shadow-sm'
                    : 'bg-white border-slate-100 hover:border-purple-200 shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelectOne(item.id)}
                      className="mt-1 accent-purple-600 w-4 h-4 cursor-pointer rounded-md"
                    />
                    <div>
                      <button
                        type="button"
                        onClick={() => setActiveDetailWord(item)}
                        className="text-base font-extrabold text-slate-900 capitalize hover:text-purple-600 text-left cursor-pointer"
                      >
                        {item.word}
                      </button>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {item.definition}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      state === 'Mastered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : state === 'Needs Work'
                        ? 'bg-rose-100 text-rose-800'
                        : state === 'Learning'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {state}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mt-3 pt-2 border-t border-slate-100">
                  <span>Sector: {item.sector}</span>
                  <span>Accuracy: {p ? `${Math.round(p.accuracy * 100)}%` : '0%'} ({p?.attempts || 0} tries)</span>
                  <button
                    type="button"
                    onClick={() => setActiveDetailWord(item)}
                    className="text-purple-600 hover:underline flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> Details
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Word Detail Modal */}
      <WordDetailModal
        word={activeDetailWord}
        progress={activeDetailWord ? progressMap.get(activeDetailWord.id) || null : null}
        onClose={() => setActiveDetailWord(null)}
        onPracticeWord={wordId => {
          if (onPracticeSelectedWords) {
            onPracticeSelectedWords([wordId]);
          }
        }}
        onDataChanged={onDataChanged}
      />
    </div>
  );
};
