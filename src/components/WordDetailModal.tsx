import React, { useState, useEffect } from 'react';
import { VocabularyRecord, ProgressRecord, Sentence, SectorName } from '../types';
import { StorageService } from '../services/storage';
import { PronunciationButton } from './PronunciationButton';
import { getPronunciation } from '../services/pronunciation';
import { getSynonyms } from '../services/synonyms';
import { VALID_SECTORS } from '../data/defaultVocabulary';
import { X, Check, AlertCircle, Edit2, Save, Sparkles, Plus, Trash2 } from 'lucide-react';

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
  onDataChanged
}) => {
  const [showSynonyms, setShowSynonyms] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Edit form states
  const [editId, setEditId] = useState('');
  const [editWord, setEditWord] = useState('');
  const [editSector, setEditSector] = useState<SectorName | string>('General');
  const [editPhonetic, setEditPhonetic] = useState('');
  const [editDefinition, setEditDefinition] = useState('');
  const [editExampleUsage, setEditExampleUsage] = useState('');
  const [editSynonymsStr, setEditSynonymsStr] = useState('');
  const [editSentences, setEditSentences] = useState<Sentence[]>([]);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Sync state when word changes or when toggling edit mode
  useEffect(() => {
    if (word) {
      setEditId(word.id);
      setEditWord(word.word);
      setEditSector(word.sector);
      setEditPhonetic(word.phonetic || getPronunciation(word.word));
      setEditDefinition(word.definition);
      setEditExampleUsage(word.exampleUsage);
      setEditSynonymsStr(getSynonyms(word).join(', '));
      setEditSentences(
        word.sentences && word.sentences.length > 0
          ? word.sentences.map(s => ({ ...s }))
          : [
              { text: '', correct: true },
              { text: '', correct: true },
              { text: '', correct: false },
              { text: '', correct: false },
              { text: '', correct: false },
              { text: '', correct: false }
            ]
      );
    }
  }, [word]);

  if (!word) return null;

  const p1 = StorageService.getProgress('lvl1').find(p => p.vocabularyId === word.id) || null;
  const p2 = StorageService.getProgress('lvl2').find(p => p.vocabularyId === word.id) || null;

  const state1 = StorageService.getLearningState(p1);
  const state2 = StorageService.getLearningState(p2);
  const isQualifiedL2 = state1 === 'Mastered';

  const handleStartEditing = () => {
    setIsEditing(true);
    setSaveSuccessMsg('');
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    // Reset edit fields back to word props
    setEditId(word.id);
    setEditWord(word.word);
    setEditSector(word.sector);
    setEditPhonetic(word.phonetic || getPronunciation(word.word));
    setEditDefinition(word.definition);
    setEditExampleUsage(word.exampleUsage);
    setEditSynonymsStr(getSynonyms(word).join(', '));
    setEditSentences(word.sentences.map(s => ({ ...s })));
  };

  const handleSentenceChange = (index: number, text: string) => {
    const updated = [...editSentences];
    updated[index] = { ...updated[index], text };
    setEditSentences(updated);
  };

  const handleSentenceToggleCorrect = (index: number) => {
    const updated = [...editSentences];
    updated[index] = { ...updated[index], correct: !updated[index].correct };
    setEditSentences(updated);
  };

  const handleSaveWord = () => {
    if (!editId.trim() || !editWord.trim() || !editDefinition.trim()) {
      alert('Word ID, Target Word, and Definition cannot be empty.');
      return;
    }

    const parsedSynonyms = editSynonymsStr
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const updatedRecord: VocabularyRecord = {
      ...word,
      id: editId.trim(),
      word: editWord.trim(),
      sector: editSector,
      phonetic: editPhonetic.trim(),
      definition: editDefinition.trim(),
      exampleUsage: editExampleUsage.trim(),
      synonyms: parsedSynonyms,
      sentences: editSentences.filter(s => s.text.trim().length > 0),
      updatedAt: new Date().toISOString()
    };

    const saved = StorageService.updateVocabularyRecord(word.id, updatedRecord);
    if (saved) {
      setIsEditing(false);
      setSaveSuccessMsg('Word metadata saved successfully!');
      if (onDataChanged) {
        onDataChanged();
      }
      setTimeout(() => setSaveSuccessMsg(''), 3000);
    } else {
      alert('Failed to save word changes.');
    }
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 pt-4 pb-24 font-sans animate-in fade-in overflow-y-auto"
    >
      <div 
        onClick={e => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 border-3 border-black dark:border-white max-w-lg w-full rounded-2xl shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#A855F7] flex flex-col max-h-[calc(100dvh-7.5rem)] my-auto overflow-hidden transition-colors"
      >
        
        {/* Modal Header (Fixed top) */}
        <div className="flex-shrink-0 sticky top-0 z-20 flex items-start justify-between border-b-2.5 border-black dark:border-slate-800 p-3.5 sm:p-5 bg-slate-50 dark:bg-slate-900">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black font-display text-slate-900 dark:text-white uppercase tracking-tight">
                {isEditing ? 'Edit Word Metadata' : word.word}
              </h2>
              {!isEditing && (
                <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-[#FFE600] text-black border-2 border-black uppercase">
                  {word.sector}
                </span>
              )}
            </div>

            {!isEditing && (
              <>
                {/* Text Phonetic Pronunciation Guide */}
                <div className="text-xs sm:text-sm italic font-serif text-purple-700 dark:text-purple-300 font-semibold mt-0.5">
                  {getPronunciation(word.word, word.phonetic)}
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <PronunciationButton word={word.word} size="sm" />
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold font-mono">
                    ID: {word.id}
                  </span>
                </div>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            title="Close modal"
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-2 border-black dark:border-white text-black dark:text-white hover:bg-slate-200 transition-all cursor-pointer shadow-[2px_2px_0px_0px_#000] shrink-0"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Save success toast */}
        {saveSuccessMsg && (
          <div className="bg-[#4ADE80] text-black px-4 py-2 text-xs font-black uppercase text-center border-b-2 border-black flex items-center justify-center gap-2 shrink-0">
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 pb-8 space-y-4">
          {isEditing ? (
            /* --- EDITING FORM --- */
            <div className="space-y-4 text-xs font-bold text-slate-900 dark:text-slate-100">
              {/* Word ID & Target Word Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-black tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Word ID
                  </label>
                  <input
                    type="text"
                    value={editId}
                    onChange={e => setEditId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-black dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold font-mono text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                    placeholder="VOC000001"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-black tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Target Word
                  </label>
                  <input
                    type="text"
                    value={editWord}
                    onChange={e => setEditWord(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-black dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold uppercase text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                    placeholder="e.g. abate"
                  />
                </div>
              </div>

              {/* Sector & Phonetics Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-black tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Domain / Sector
                  </label>
                  <select
                    value={editSector}
                    onChange={e => setEditSector(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-black dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600 cursor-pointer"
                  >
                    {VALID_SECTORS.map(sec => (
                      <option key={sec} value={sec}>
                        {sec}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-black tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Phonetic Guide (Text)
                  </label>
                  <input
                    type="text"
                    value={editPhonetic}
                    onChange={e => setEditPhonetic(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-black dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold italic font-serif text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                    placeholder="e.g. uh·bayt"
                  />
                </div>
              </div>

              {/* Definition */}
              <div>
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Definition
                </label>
                <textarea
                  value={editDefinition}
                  onChange={e => setEditDefinition(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-black dark:border-slate-700 rounded-xl p-3 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600 leading-snug"
                  placeholder="Definition..."
                />
              </div>

              {/* Example Usage */}
              <div>
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Example Usage
                </label>
                <textarea
                  value={editExampleUsage}
                  onChange={e => setEditExampleUsage(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-black dark:border-slate-700 rounded-xl p-3 text-xs font-bold italic text-slate-900 dark:text-white focus:outline-none focus:border-purple-600 leading-snug"
                  placeholder="Sentence using the word..."
                />
              </div>

              {/* Synonyms */}
              <div>
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Synonyms (Comma-separated)
                </label>
                <input
                  type="text"
                  value={editSynonymsStr}
                  onChange={e => setEditSynonymsStr(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-black dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                  placeholder="e.g. subside, dwindle"
                />
              </div>

              {/* Individual Sentences Editing */}
              <div className="space-y-2 pt-2 border-t-2 border-black/10 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    Individual Practice Sentences (6 Sentences)
                  </span>
                  <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300">
                    Check = Correct usage
                  </span>
                </div>

                <div className="space-y-2.5">
                  {editSentences.map((s, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 dark:bg-slate-800 border-2 border-black dark:border-slate-700 rounded-xl space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">
                          Sentence #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleSentenceToggleCorrect(idx)}
                          className={`px-2 py-0.5 rounded-lg border border-black font-black text-[10px] uppercase transition-all cursor-pointer flex items-center gap-1 ${
                            s.correct
                              ? 'bg-[#4ADE80] text-black'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {s.correct ? (
                            <>
                              <Check className="w-3 h-3 stroke-[3]" />
                              <span>Correct Usage</span>
                            </>
                          ) : (
                            <span>Distractor</span>
                          )}
                        </button>
                      </div>

                      <textarea
                        value={s.text}
                        onChange={e => handleSentenceChange(idx, e.target.value)}
                        rows={2}
                        className="w-full bg-white dark:bg-slate-900 border-2 border-black/30 dark:border-slate-700 rounded-lg p-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600 leading-snug"
                        placeholder={`Sentence ${idx + 1}...`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* --- READ ONLY VIEW MODE --- */
            <>
              {/* Metrics Row */}
              <div className="space-y-2">
                {/* Level I Row */}
                <div className="grid grid-cols-3 gap-2 bg-[#FFE600]/20 dark:bg-slate-800/80 p-3 rounded-xl border-2 border-black dark:border-slate-700 text-center text-xs">
                  <div>
                    <span className="text-black dark:text-slate-400 block text-[10px] font-black uppercase">Level I Status</span>
                    <span
                      className={`font-black block text-xs uppercase mt-0.5 ${
                        state1 === 'Mastered'
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : state1 === 'Needs Work'
                          ? 'text-rose-700 dark:text-rose-400'
                          : state1 === 'Learning'
                          ? 'text-purple-700 dark:text-purple-300'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {state1} I
                    </span>
                  </div>
                  <div>
                    <span className="text-black dark:text-slate-400 block text-[10px] font-black uppercase">L1 Points Score</span>
                    <span className={`font-black block text-xs mt-0.5 ${
                      p1 && StorageService.getWordScore(p1) > 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : p1 && StorageService.getWordScore(p1) < 0
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-slate-900 dark:text-slate-100'
                    }`}>
                      {p1 ? (StorageService.getWordScore(p1) > 0 ? `+${StorageService.getWordScore(p1)}` : StorageService.getWordScore(p1)) : 0} pts
                    </span>
                  </div>
                  <div>
                    <span className="text-black dark:text-slate-400 block text-[10px] font-black uppercase">L1 Tries</span>
                    <span className="font-black text-slate-900 dark:text-slate-100 block text-xs mt-0.5">
                      {p1?.attempts || 0}
                    </span>
                  </div>
                </div>

                {/* Level II Row if qualified */}
                {isQualifiedL2 && (
                  <div className="grid grid-cols-3 gap-2 bg-pink-500/10 dark:bg-pink-950/40 p-3 rounded-xl border-2 border-pink-500 text-center text-xs">
                    <div>
                      <span className="text-pink-700 dark:text-pink-300 block text-[10px] font-black uppercase">Level II Status</span>
                      <span
                        className={`font-black block text-xs uppercase mt-0.5 ${
                          state2 === 'Mastered'
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : state2 === 'Needs Work'
                            ? 'text-rose-700 dark:text-rose-400'
                            : state2 === 'Learning'
                            ? 'text-purple-700 dark:text-purple-300'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {state2} II
                      </span>
                    </div>
                    <div>
                      <span className="text-pink-700 dark:text-pink-300 block text-[10px] font-black uppercase">L2 Points Score</span>
                      <span className={`font-black block text-xs mt-0.5 ${
                        p2 && StorageService.getWordScore(p2) > 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : p2 && StorageService.getWordScore(p2) < 0
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}>
                        {p2 ? (StorageService.getWordScore(p2) > 0 ? `+${StorageService.getWordScore(p2)}` : StorageService.getWordScore(p2)) : 0} pts
                      </span>
                    </div>
                    <div>
                      <span className="text-pink-700 dark:text-pink-300 block text-[10px] font-black uppercase">L2 Tries</span>
                      <span className="font-black text-slate-900 dark:text-slate-100 block text-xs mt-0.5">
                        {p2?.attempts || 0}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Definition & Usage */}
              <div className="space-y-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border-2 border-black dark:border-slate-700">
                <div>
                  <span className="text-[10px] font-black uppercase text-purple-700 dark:text-purple-300 tracking-wide block mb-0.5">
                    Definition
                  </span>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-relaxed">{word.definition}</p>

                  {/* Synonyms toggle */}
                  <div className="mt-2.5 pt-2 border-t border-black/10 dark:border-slate-700 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowSynonyms(!showSynonyms)}
                      className="px-2.5 py-1 bg-[#FFE600] hover:bg-[#FFD700] text-black border border-black text-[10px] font-black uppercase rounded-md shadow-[1px_1px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer flex items-center gap-1 transition-all shrink-0"
                    >
                      <Sparkles className="w-3 h-3 stroke-[2.5]" />
                      <span>{showSynonyms ? 'Hide Synonyms' : 'Synonyms'}</span>
                    </button>
                    {showSynonyms && (
                      <span className="text-xs text-slate-800 dark:text-slate-200">
                        <span className="opacity-75 mr-1 font-semibold">Synonyms:</span>
                        <strong className="font-bold text-xs uppercase text-purple-700 dark:text-purple-300 tracking-wide">
                          {getSynonyms(word).join(', ')}
                        </strong>
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t-2 border-black/20 dark:border-slate-700">
                  <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wide block mb-0.5">
                    Example Usage
                  </span>
                  <p className="text-xs text-slate-900 dark:text-slate-300 italic font-bold leading-relaxed">
                    "{word.exampleUsage}"
                  </p>
                </div>
              </div>

              {/* 6 Retrieval Sentences */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-black dark:text-white block">
                  Sentences (2 Correct / 4 Distractors)
                </span>
                <div className="space-y-2">
                  {word.sentences.map((s, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border-2 text-xs font-sans flex items-start gap-2.5 transition-all ${
                        s.correct
                          ? 'border-black bg-[#4ADE80] text-black font-bold'
                          : 'border-black/30 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/40 text-slate-700 dark:text-slate-400'
                      }`}
                    >
                      {s.correct ? (
                        <Check className="w-4 h-4 text-black shrink-0 mt-0.5 stroke-[3]" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5 stroke-[2]" />
                      )}
                      <span className="leading-relaxed flex-1 font-bold">{s.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Action Controls Footer (Sticky bottom - always 100% visible) */}
        <div className="flex-shrink-0 sticky bottom-0 z-20 border-t-2.5 border-black dark:border-slate-800 p-3.5 sm:p-4 bg-slate-100 dark:bg-slate-900 flex items-center justify-between gap-3 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleCancelEditing}
                className="px-3.5 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-black dark:text-white border-2 border-black dark:border-slate-600 rounded-xl text-xs font-black cursor-pointer transition-all"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveWord}
                className="px-4 py-2 bg-[#4ADE80] hover:bg-[#38C168] text-black border-2 border-black rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
              >
                <Save className="w-4 h-4 stroke-[2.5]" />
                <span>Save Changes</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-black dark:text-white border-2 border-black dark:border-slate-600 rounded-xl text-xs font-black cursor-pointer transition-all"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handleStartEditing}
                className="px-4 py-2 bg-[#FFE600] hover:bg-[#FFD700] text-black border-2 border-black font-black text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
              >
                <Edit2 className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Edit Word Metadata</span>
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
