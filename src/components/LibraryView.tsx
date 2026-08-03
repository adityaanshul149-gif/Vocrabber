import React, { useState, useMemo } from 'react';
import { VocabularyRecord, ProgressRecord, AppLevel } from '../types';
import { StorageService } from '../services/storage';
import { VocabularyService } from '../services/vocabulary';
import { WordDetailModal } from './WordDetailModal';
import { ExportModal } from './ExportModal';
import { PronunciationButton } from './PronunciationButton';
import { getPronunciation } from '../services/pronunciation';
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
  X,
  Target,
  Sparkles
} from 'lucide-react';

interface LibraryViewProps {
  vocabulary: VocabularyRecord[];
  progress: ProgressRecord[];
  onDataChanged: () => void;
  onPracticeSelectedWords?: (wordIds: string[]) => void;
  appLevel?: AppLevel;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  vocabulary,
  progress,
  onDataChanged,
  onPracticeSelectedWords,
  appLevel = 'lvl1'
}) => {
  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Filter state
  const [levelFilter, setLevelFilter] = useState<'all' | 'lvl1' | 'lvl2'>('all');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [encounteredFilter, setEncounteredFilter] = useState('all');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [attemptsFilter, setAttemptsFilter] = useState('all');

  // Sort state
  const [sortKey, setSortKey] = useState<
    | 'word-asc'
    | 'word-desc'
    | 'id-asc'
    | 'id-desc'
    | 'score-asc'
    | 'score-desc'
    | 'attempts-asc'
    | 'attempts-desc'
    | 'reviewed-desc'
    | 'reviewed-asc'
    | 'status-asc'
    | 'random'
  >('word-asc');

  // Selection & Modal states
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeDetailWord, setActiveDetailWord] = useState<VocabularyRecord | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [copyNotice, setCopyNotice] = useState(false);

  // Quick lookup map for Level 1 progress
  const progressLvl1Map = useMemo(
    () => new Map<string, ProgressRecord>(StorageService.getProgress('lvl1').map(p => [p.vocabularyId, p])),
    [progress, vocabulary]
  );

  // Quick lookup map for Level 2 progress
  const progressLvl2Map = useMemo(
    () => new Map<string, ProgressRecord>(StorageService.getProgress('lvl2').map(p => [p.vocabularyId, p])),
    [progress, vocabulary]
  );

  // Active vocabulary deck for the current appLevel or levelFilter
  const activeDeck = useMemo(() => {
    if (levelFilter === 'lvl2' || (levelFilter === 'all' && appLevel === 'lvl2')) {
      return vocabulary.filter(item => {
        const p1 = progressLvl1Map.get(item.id) || null;
        return StorageService.getLearningState(p1) === 'Mastered';
      });
    }
    return vocabulary;
  }, [vocabulary, appLevel, levelFilter, progressLvl1Map]);

  // Dynamically extract unique existing sectors from loaded active deck
  const availableSectors = useMemo(() => {
    const sectorsSet = new Set<string>();
    activeDeck.forEach(item => {
      if (item.sector) sectorsSet.add(item.sector);
    });
    return Array.from(sectorsSet).sort();
  }, [activeDeck]);

  // Quick lookup map for active level progress
  const progressMap = useMemo(
    () => new Map<string, ProgressRecord>(progress.map(p => [p.vocabularyId, p])),
    [progress]
  );

  // Filter logic
  const filteredVocabulary = useMemo(() => {
    return activeDeck.filter(item => {
      const p1 = progressLvl1Map.get(item.id) || null;
      const p2 = progressLvl2Map.get(item.id) || null;
      const state1 = StorageService.getLearningState(p1);
      const state2 = StorageService.getLearningState(p2);

      let p = p1;
      let state = state1;

      if (levelFilter === 'lvl2' || (levelFilter === 'all' && appLevel === 'lvl2' && state1 === 'Mastered')) {
        p = p2;
        state = state2;
      }

      const attempts = p ? p.attempts : 0;
      const score = p ? StorageService.getWordScore(p) : 0;

      // Level Filter
      if (levelFilter === 'lvl2') {
        const isMasteredInLvl1 = state1 === 'Mastered';
        if (!isMasteredInLvl1) return false;
      }

      // Sector Filter
      if (sectorFilter !== 'all' && item.sector !== sectorFilter) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const match =
          item.word.toLowerCase().includes(q) ||
          item.definition.toLowerCase().includes(q) ||
          item.exampleUsage.toLowerCase().includes(q) ||
          item.sector.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q);
        if (!match) return false;
      }

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

      // Score Filter
      if (scoreFilter !== 'all') {
        if (scoreFilter === 'negative' && score >= 0) return false;
        if (scoreFilter === 'zero' && (attempts === 0 || score !== 0)) return false;
        if (scoreFilter === 'positive' && score <= 0) return false;
        if (scoreFilter === 'high' && score < 3) return false;
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
    levelFilter,
    searchQuery,
    sectorFilter,
    statusFilter,
    encounteredFilter,
    scoreFilter,
    attemptsFilter
  ]);

  // Sort logic
  const sortedVocabulary = useMemo(() => {
    const list = [...filteredVocabulary];

    // If there is a search query, rank prefix matches on word and ID first!
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();

      const getSearchScore = (item: VocabularyRecord) => {
        const wordLower = item.word.toLowerCase();
        const idLower = item.id.toLowerCase();

        if (wordLower === q) return 100;
        if (wordLower.startsWith(q)) return 90;
        if (idLower === q) return 85;
        if (idLower.startsWith(q)) return 80;
        if (wordLower.includes(q)) return 70;
        if (idLower.includes(q)) return 60;
        return 50;
      };

      return list.sort((a, b) => {
        const scoreA = getSearchScore(a);
        const scoreB = getSearchScore(b);
        if (scoreA !== scoreB) {
          return scoreB - scoreA; // Higher relevance first
        }
        return a.word.localeCompare(b.word);
      });
    }

    if (sortKey === 'random') {
      // Deterministic shuffle view
      return list.sort(() => Math.sin(list.length) - 0.5);
    }

    list.sort((a, b) => {
      const pa = progressMap.get(a.id) || null;
      const pb = progressMap.get(b.id) || null;

      const scoreA = pa ? StorageService.getWordScore(pa) : 0;
      const scoreB = pb ? StorageService.getWordScore(pb) : 0;
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
        case 'score-asc':
          return scoreA - scoreB;
        case 'score-desc':
          return scoreB - scoreA;
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
      {/* Search Bar & Level/Sector Filter Card */}
      <div className="bg-white dark:bg-slate-900 border-2.5 border-black dark:border-white rounded-2xl p-4 space-y-3 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#A855F7] transition-all">
        {/* Header & Level Filter Tabs */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-black text-black dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-purple-600 dark:text-purple-400 stroke-[2.5]" />
            Deck Filters
          </span>

          {/* Level Filter Pill */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border-2 border-black dark:border-slate-700">
            <button
              type="button"
              onClick={() => setLevelFilter('all')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase cursor-pointer transition-all ${
                levelFilter === 'all'
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              ALL
            </button>
            <button
              type="button"
              onClick={() => setLevelFilter('lvl1')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase cursor-pointer transition-all ${
                levelFilter === 'lvl1'
                  ? 'bg-[#FFE600] text-black border border-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              LVL I
            </button>
            <button
              type="button"
              onClick={() => setLevelFilter('lvl2')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase cursor-pointer transition-all ${
                levelFilter === 'lvl2'
                  ? 'bg-[#FF2E93] text-white border border-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              LVL II
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-black dark:text-slate-300 font-bold">
          <span>Total Matches:</span>
          <span className="text-xs">
            <strong className="text-purple-700 dark:text-purple-300 font-black">{sortedVocabulary.length}</strong> / {vocabulary.length} Words
          </span>
        </div>

        <div className="space-y-2">
          {/* Query Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-black dark:text-slate-400 absolute left-3.5 top-3 stroke-[2.5]" />
            <input
              type="search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by word, word ID (e.g. VOC000001), definition..."
              className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-black dark:border-slate-700 rounded-xl pl-10 pr-8 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-500 font-bold focus:outline-none focus:border-purple-600"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-black dark:hover:text-white"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Sector Filter Dropdown */}
            <select
              value={sectorFilter}
              onChange={e => setSectorFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border-2 border-black dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-900 dark:text-slate-100 font-black focus:outline-none focus:border-purple-600"
            >
              <option value="all">All Sectors ({availableSectors.length})</option>
              {availableSectors.map(sec => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border-2 border-black dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-900 dark:text-slate-100 font-black focus:outline-none focus:border-purple-600"
            >
              <option value="all">All Statuses</option>
              <option value="never">Never Practiced</option>
              <option value="learning">Learning</option>
              <option value="needs-work">Needs Work</option>
              <option value="mastered">Mastered</option>
            </select>

            {/* Score Filter */}
            <select
              value={scoreFilter}
              onChange={e => setScoreFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border-2 border-black dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-900 dark:text-slate-100 font-black focus:outline-none focus:border-purple-600"
            >
              <option value="all">All Points</option>
              <option value="negative">Negative Points (&lt; 0 pts)</option>
              <option value="zero">Zero Points (0 pts)</option>
              <option value="positive">Positive Points (&gt; 0 pts)</option>
              <option value="high">Mastered Score (≥ 3 pts)</option>
            </select>
          </div>
        </div>

        {/* Sorting Row & Selection / Export Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t-2 border-black dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[10px] font-black text-black dark:text-slate-400 uppercase">Sort:</span>
            <select
              value={sortKey}
              onChange={e => setSortKey(e.target.value as unknown as typeof sortKey)}
              className="bg-slate-50 dark:bg-slate-800 border-2 border-black dark:border-slate-700 rounded-xl px-2 py-1 text-xs text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-purple-600"
            >
              <option value="word-asc">Alphabetical (A - Z)</option>
              <option value="word-desc">Alphabetical (Z - A)</option>
              <option value="score-asc">Points Score (Weakest First)</option>
              <option value="score-desc">Points Score (Highest First)</option>
              <option value="attempts-desc">Most Attempted</option>
              <option value="random">Random Order</option>
            </select>
          </div>

          {/* Selection & Export Tool Buttons */}
          <div className="flex items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className="px-2.5 py-1 bg-[#4ADE80] text-black border-2 border-black rounded-xl text-[11px] font-black flex items-center gap-1 cursor-pointer shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              Export
            </button>

            <button
              type="button"
              onClick={handleToggleSelectAll}
              className="px-2.5 py-1 bg-[#FFE600] text-black border-2 border-black rounded-xl text-[11px] font-black flex items-center gap-1 cursor-pointer shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            >
              {isAllVisibleSelected ? <CheckSquare className="w-3.5 h-3.5 stroke-[2.5]" /> : <Square className="w-3.5 h-3.5 stroke-[2.5]" />}
              {isAllVisibleSelected ? 'Deselect' : 'Select All'}
            </button>
          </div>
        </div>
      </div>

      {/* Floating Action Bar for Selected Words */}
      {selectedIds.size > 0 && (
        <div className="bg-[#A855F7] text-white border-2.5 border-black rounded-2xl p-3 text-xs flex flex-wrap items-center justify-between gap-2 shadow-[4px_4px_0px_0px_#000] animate-in fade-in">
          <span className="font-black font-display text-sm tracking-wide">
            {selectedIds.size} SELECTED
          </span>

          <div className="flex items-center gap-1.5">
            {onPracticeSelectedWords && (
              <button
                type="button"
                onClick={handlePracticeSelected}
                className="px-3 py-1.5 bg-[#FFE600] text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center gap-1 cursor-pointer transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-black stroke-[2]" />
                Practice
              </button>
            )}

            <button
              type="button"
              onClick={handleExportSelected}
              className="px-2.5 py-1.5 bg-white text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center gap-1 cursor-pointer transition-all"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>

            <button
              type="button"
              onClick={handleDeleteSelected}
              className="px-2.5 py-1.5 bg-[#FF6B6B] hover:bg-[#FF5252] text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center gap-1 cursor-pointer transition-all"
            >
              <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      )}

      {/* Vocabulary Cards List */}
      <div className="space-y-3">
        {sortedVocabulary.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center text-slate-700 dark:text-slate-300 border-2.5 border-black dark:border-white shadow-[4px_4px_0px_0px_#000] text-xs font-black uppercase">
            No matching vocabulary records found.
          </div>
        ) : (
          sortedVocabulary.map(item => {
            const p1 = progressLvl1Map.get(item.id) || null;
            const p2 = progressLvl2Map.get(item.id) || null;
            const state1 = StorageService.getLearningState(p1);
            const state2 = StorageService.getLearningState(p2);
            const isQualifiedL2 = state1 === 'Mastered';
            const isSelected = selectedIds.has(item.id);

            const getBadgeClass = (st: string) => {
              switch (st) {
                case 'Mastered':
                  return 'bg-[#4ADE80] text-black border-black';
                case 'Needs Work':
                  return 'bg-[#FF6B6B] text-black border-black';
                case 'Learning':
                  return 'bg-[#A855F7] text-white border-black';
                default:
                  return 'bg-slate-200 text-black dark:bg-slate-800 dark:text-white border-black';
              }
            };

            const renderBadges = () => {
              const b1 = (
                <span
                  key="b1"
                  className={`shrink-0 px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase border shadow-[1.5px_1.5px_0px_0px_#000] whitespace-nowrap ${getBadgeClass(
                    state1
                  )}`}
                >
                  {state1} I
                </span>
              );

              const b2 = (
                <span
                  key="b2"
                  className={`shrink-0 px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase border shadow-[1.5px_1.5px_0px_0px_#000] whitespace-nowrap ${getBadgeClass(
                    state2
                  )}`}
                >
                  {state2} II
                </span>
              );

              if (levelFilter === 'lvl1') {
                return <div className="flex flex-col items-end gap-1 shrink-0">{b1}</div>;
              }
              if (levelFilter === 'lvl2') {
                return <div className="flex flex-col items-end gap-1 shrink-0">{b2}</div>;
              }

              // levelFilter === 'all'
              if (isQualifiedL2) {
                return (
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {b1}
                    {b2}
                  </div>
                );
              }
              return <div className="flex flex-col items-end gap-1 shrink-0">{b1}</div>;
            };

            const isL2ActiveCard = levelFilter === 'lvl2' || (levelFilter === 'all' && appLevel === 'lvl2' && isQualifiedL2);
            const activeP = isL2ActiveCard ? p2 : p1;

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border-2.5 border-black dark:border-white transition-all ${
                  isSelected
                    ? 'bg-[#FFE600] text-black shadow-[4px_4px_0px_0px_#000]'
                    : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-[3.5px_3.5px_0px_0px_#000] dark:shadow-[3.5px_3.5px_0px_0px_#A855F7]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelectOne(item.id)}
                      className="mt-1 accent-black w-4 h-4 cursor-pointer rounded border-2 border-black"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveDetailWord(item)}
                          className="text-base font-black font-display uppercase hover:underline hover:text-purple-600 dark:hover:text-purple-400 text-left cursor-pointer"
                        >
                          {item.word}
                        </button>
                      </div>
                      <div className="text-[11px] italic font-serif text-purple-700 dark:text-purple-300 font-medium leading-none mt-0.5">
                        {getPronunciation(item.word, item.phonetic)}
                      </div>
                      <div className="mt-1">
                        <PronunciationButton word={item.word} size="sm" />
                      </div>
                      <p className="text-xs font-bold opacity-90 line-clamp-1 mt-1">
                        {item.definition}
                      </p>
                    </div>
                  </div>

                  {renderBadges()}
                </div>

                <div className="flex items-center justify-between text-[11px] font-bold mt-3 pt-2 border-t-2 border-black/20 dark:border-white/20">
                  <span className="uppercase text-slate-700 dark:text-slate-300">Sector: {item.sector}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-600 dark:text-slate-400 font-extrabold">{isL2ActiveCard ? 'L2' : 'L1'}:</span>
                    {(() => {
                      const scoreVal = activeP ? StorageService.getWordScore(activeP) : 0;
                      const scoreText = scoreVal > 0 ? `+${scoreVal} pts` : `${scoreVal} pts`;
                      const colorClass = scoreVal < 0 
                        ? 'bg-[#FF6B6B] text-black border-black'
                        : scoreVal > 0
                        ? 'bg-[#4ADE80] text-black border-black'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border-black/30 dark:border-white/30';
                      return (
                        <span className={`px-2 py-0.5 rounded-md border text-[10px] font-black ${colorClass}`}>
                          {scoreText}
                        </span>
                      );
                    })()}
                    <span className="text-[10px] text-slate-500 font-bold">({activeP?.attempts || 0} tries)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveDetailWord(item)}
                    className="font-black underline flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 stroke-[2.5]" /> View
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

      {/* Custom Column Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        records={selectedIds.size > 0 ? vocabulary.filter(v => selectedIds.has(v.id)) : sortedVocabulary}
      />
    </div>
  );
};
