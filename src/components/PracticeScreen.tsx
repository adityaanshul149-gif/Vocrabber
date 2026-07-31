import React, { useState, useEffect, useMemo } from 'react';
import { VocabularyRecord, Sentence, AppLevel } from '../types';
import { Check, ArrowRight, RotateCcw, LogOut, Sparkles, AlertTriangle, CheckCircle2, HelpCircle, Target } from 'lucide-react';

interface PracticeScreenProps {
  currentWord: VocabularyRecord;
  modeTitle: string;
  appLevel?: AppLevel;
  allVocabulary?: VocabularyRecord[];
  onAnswerSubmit: (word: VocabularyRecord, isCorrect: boolean) => void;
  onNextWord: () => void;
  onEndPractice: () => void;
}

export const PracticeScreen: React.FC<PracticeScreenProps> = ({
  currentWord,
  modeTitle,
  appLevel = 'lvl1',
  allVocabulary = [],
  onAnswerSubmit,
  onNextWord,
  onEndPractice
}) => {
  // Level 1: Sentence State
  const [shuffledSentences, setShuffledSentences] = useState<{ sentence: Sentence; originalIdx: number }[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());

  // Level 2: Definition Options State
  const [definitionOptions, setDefinitionOptions] = useState<{ text: string; isCorrect: boolean }[]>([]);
  const [selectedDefIndex, setSelectedDefIndex] = useState<number | null>(null);

  // Common Practice State
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isDontKnow, setIsDontKnow] = useState(false);
  const [hasAttemptedCurrentTurn, setHasAttemptedCurrentTurn] = useState(false);

  useEffect(() => {
    setSelectedIndices(new Set());
    setSelectedDefIndex(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setIsDontKnow(false);
    setHasAttemptedCurrentTurn(false);

    if (appLevel === 'lvl2') {
      // Build 5 definition options (1 correct + 4 distractors)
      let distractors: string[] = [];

      if (currentWord.level2Distractors && currentWord.level2Distractors.length >= 4) {
        distractors = currentWord.level2Distractors.slice(0, 4);
      } else {
        // Gather definitions from allVocabulary
        const otherDefs = allVocabulary
          .filter(v => v.id !== currentWord.id && v.definition)
          .map(v => v.definition);

        // Shuffle other defs to get 4 distractors
        const pool = [...otherDefs];
        for (let i = pool.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        distractors = pool.slice(0, 4);

        // Fallback generic distractors if database is small
        const genericFallbacks = [
          'To intentionally evade or ignore standard procedures',
          'A gradual decrease or decline in overall quality or vigor',
          'To formally declare or endorse an opposing viewpoint',
          'An unexpected occurrence causing minor temporary disruption'
        ];
        while (distractors.length < 4) {
          distractors.push(genericFallbacks[distractors.length % genericFallbacks.length]);
        }
      }

      const options = [
        { text: currentWord.definition, isCorrect: true },
        ...distractors.map(d => ({ text: d, isCorrect: false }))
      ];

      // Shuffle options
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }

      setDefinitionOptions(options);
    } else {
      // Level 1: Shuffle sentences
      const withIndex = currentWord.sentences.map((sentence, originalIdx) => ({
        sentence,
        originalIdx
      }));
      for (let i = withIndex.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [withIndex[i], withIndex[j]] = [withIndex[j], withIndex[i]];
      }
      setShuffledSentences(withIndex);
    }
  }, [currentWord, appLevel, allVocabulary]);

  const toggleSentence = (originalIdx: number) => {
    if (isAnswered) return;
    const next = new Set(selectedIndices);
    if (next.has(originalIdx)) {
      next.delete(originalIdx);
    } else {
      if (next.size < 2) {
        next.add(originalIdx);
      }
    }
    setSelectedIndices(next);
  };

  const handleSelectDefinition = (index: number) => {
    if (isAnswered) return;
    setSelectedDefIndex(index);
  };

  const handleSubmit = () => {
    if (isAnswered) return;

    let correct = false;

    if (appLevel === 'lvl2') {
      if (selectedDefIndex === null) return;
      correct = definitionOptions[selectedDefIndex]?.isCorrect || false;
    } else {
      if (selectedIndices.size !== 2) return;
      const correctOriginalIndices = new Set(
        currentWord.sentences
          .map((s, idx) => (s.correct ? idx : null))
          .filter((idx): idx is number => idx !== null)
      );

      correct =
        selectedIndices.size === correctOriginalIndices.size &&
        Array.from(selectedIndices).every(idx => correctOriginalIndices.has(idx));
    }

    // Submit attempt score only if it's the first turn attempt for this word
    if (!hasAttemptedCurrentTurn) {
      onAnswerSubmit(currentWord, correct);
      setHasAttemptedCurrentTurn(true);
    }

    setIsCorrect(correct);
    setIsAnswered(true);
    setIsDontKnow(false);
  };

  const handleDontKnow = () => {
    if (isAnswered) return;

    // Record as failed first attempt in DB
    if (!hasAttemptedCurrentTurn) {
      onAnswerSubmit(currentWord, false);
      setHasAttemptedCurrentTurn(true);
    }

    setIsDontKnow(true);
    setIsCorrect(false);
    setIsAnswered(true);
  };

  const handleRetry = () => {
    setSelectedIndices(new Set());
    setSelectedDefIndex(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setIsDontKnow(false);
  };

  const isLvl2 = appLevel === 'lvl2';

  return (
    <div className={`min-h-screen font-sans flex flex-col justify-between p-4 sm:p-6 max-w-md mx-auto pb-8 transition-colors ${
      isLvl2 ? 'bg-[#0B0F19] text-slate-100' : 'bg-[#FFFDF5] dark:bg-slate-950 text-slate-900 dark:text-slate-100'
    }`}>
      {/* Top Header Bar */}
      <div className={`flex items-center justify-between border-b-2.5 pb-3 mb-3 ${
        isLvl2 ? 'border-pink-500/50' : 'border-black dark:border-slate-800'
      }`}>
        <div>
          <span className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
            isLvl2 ? 'text-pink-400' : 'text-purple-700 dark:text-purple-400'
          }`}>
            {isLvl2 ? (
              <Target className="w-3.5 h-3.5 text-pink-500 stroke-[2.5]" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 stroke-[2.5]" />
            )}
            {isLvl2 ? 'LVL II (Intense Definition Mode)' : `${modeTitle} Mode`}
          </span>
          <h1 className="text-lg font-black font-display uppercase tracking-tight leading-tight">
            {isLvl2 ? 'Select Exact Definition' : 'Select 2 Correct Usages'}
          </h1>
        </div>
        <button
          type="button"
          onClick={onEndPractice}
          className="px-3 py-1.5 rounded-xl bg-[#FF6B6B] hover:bg-[#FF5252] text-black border-2 border-black text-xs font-black flex items-center gap-1 cursor-pointer shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
        >
          <LogOut className="w-3.5 h-3.5 stroke-[2.5]" />
          Exit
        </button>
      </div>

      {/* Target Word Hero Card */}
      <div className={`rounded-2xl p-4 sm:p-5 border-3 space-y-3 mb-3 relative transition-all ${
        isLvl2
          ? 'bg-[#FF2E93] text-white border-black shadow-[5px_5px_0px_0px_#00F0FF]'
          : 'bg-[#A855F7] dark:bg-purple-950 text-white border-black dark:border-white shadow-[5px_5px_0px_0px_#000] dark:shadow-[5px_5px_0px_0px_#FFE600]'
      }`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 text-left">
            <span className="text-[10px] font-black text-white/80 uppercase tracking-widest block">
              {isLvl2 ? 'LVL II Target Word' : 'Target Vocabulary Word'}
            </span>
            <h2 className="text-3xl font-black font-display tracking-tight uppercase leading-tight text-white">
              {currentWord.word}
            </h2>
          </div>

          {/* Don't Know Button: Appears ONLY on 1st attempt for the current word in a turn */}
          {!isAnswered && !hasAttemptedCurrentTurn && (
            <button
              type="button"
              onClick={handleDontKnow}
              title="I Don't Know"
              className="px-3 py-2 bg-[#FFE600] hover:bg-[#FFD700] text-black border-2 border-black font-black text-xs uppercase rounded-xl shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer flex items-center gap-1 shrink-0"
            >
              <HelpCircle className="w-4 h-4 stroke-[2.5]" />
              Don't Know
            </button>
          )}
        </div>

        {/* Meaning & Example inside hero card: smooth slide-down animation */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isAnswered ? 'max-h-96 opacity-100 pt-3 border-t-2 border-black/30 dark:border-white/30' : 'max-h-0 opacity-0 p-0'
          }`}
        >
          <div className="space-y-2 text-xs text-left">
            {/* Definition box */}
            <div className="bg-black/90 text-white border-2 border-black rounded-xl p-3 shadow-[2px_2px_0px_0px_#000]">
              <span className="text-[10px] font-black uppercase text-[#FFE600] tracking-wider block mb-0.5 font-display">
                Exact Meaning
              </span>
              <p className="text-xs sm:text-sm font-bold text-slate-100 leading-snug">
                {currentWord.definition}
              </p>
            </div>

            {/* Example box */}
            <div className="bg-[#FFE600] text-black border-2 border-black rounded-xl p-3 shadow-[2px_2px_0px_0px_#000]">
              <span className="text-[10px] font-black uppercase text-black/80 tracking-wider block mb-0.5 font-display">
                Example Usage
              </span>
              <p className="text-xs sm:text-sm font-bold italic text-black leading-snug">
                "{currentWord.exampleUsage}"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Don't Know Prompt Banner */}
      {isAnswered && !isCorrect && isDontKnow && (
        <div className="bg-[#FFE600] text-black border-2.5 border-black rounded-xl p-3 mb-3 flex items-center justify-between gap-3 shadow-[3px_3px_0px_0px_#000] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-5 h-5 stroke-[2.5] text-black shrink-0" />
            <div>
              <span className="text-xs font-black uppercase block tracking-wide">
                Word Revealed!
              </span>
              <p className="text-[11px] font-bold text-black/90 leading-tight">
                Review meaning above & try practicing again.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRetry}
            className="px-3.5 py-1.5 bg-[#A855F7] hover:bg-[#9333EA] text-white border-2 border-black font-black text-xs uppercase rounded-lg shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer flex items-center gap-1 shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
            Try Practice
          </button>
        </div>
      )}

      {/* Incorrect Feedback Banner */}
      {isAnswered && !isCorrect && !isDontKnow && (
        <div className="bg-[#FF6B6B] text-black border-2.5 border-black rounded-xl p-3 mb-3 flex items-center justify-between gap-3 shadow-[3px_3px_0px_0px_#000] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 stroke-[2.5] text-black shrink-0" />
            <div>
              <span className="text-xs font-black uppercase block tracking-wide">
                One or more options are incorrect
              </span>
              <p className="text-[11px] font-bold text-black/90 leading-tight">
                Review definition above & try again!
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRetry}
            className="px-3.5 py-1.5 bg-[#FFE600] hover:bg-[#FFD700] text-black border-2 border-black font-black text-xs uppercase rounded-lg shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer flex items-center gap-1 shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
            Try Again
          </button>
        </div>
      )}

      {/* Correct Feedback Banner with Next Word button inside */}
      {isAnswered && isCorrect && (
        <div className="bg-[#4ADE80] text-black border-2.5 border-black rounded-xl p-3 mb-3 flex items-center justify-between gap-3 shadow-[3px_3px_0px_0px_#000] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 stroke-[2.5] text-black shrink-0" />
            <span className="text-xs sm:text-sm font-black uppercase tracking-wide">
              {isLvl2 ? 'Correct Definition! 🎉' : 'All 2 usages correct! 🎉'}
            </span>
          </div>
          <button
            type="button"
            onClick={onNextWord}
            className="px-3.5 py-2 bg-[#A855F7] hover:bg-[#9333EA] text-white border-2 border-black font-black text-xs uppercase rounded-xl shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            Next Word
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      )}

      {/* Options List */}
      <div className="space-y-3 flex-1 mb-4">
        {isLvl2 ? (
          /* Level 2: 5 Definition Choices */
          definitionOptions.map((opt, idx) => {
            const isSelected = selectedDefIndex === idx;

            let cardStyle =
              'bg-[#121827] border-2.5 border-slate-700 text-slate-100 shadow-[3px_3px_0px_0px_#000] hover:bg-slate-800 hover:border-pink-500/60';

            if (isAnswered) {
              if (isCorrect) {
                if (opt.isCorrect) {
                  cardStyle = 'bg-[#4ADE80] text-black border-2.5 border-black font-black shadow-[3px_3px_0px_0px_#000]';
                } else {
                  cardStyle = 'bg-slate-900 border-2 border-slate-800 text-slate-600 opacity-40 shadow-none';
                }
              } else {
                if (isSelected) {
                  cardStyle = 'bg-[#FFE600] text-black border-2.5 border-black font-black shadow-[3px_3px_0px_0px_#000] opacity-80';
                } else {
                  cardStyle = 'bg-[#121827] border-2 border-slate-800 text-slate-400 shadow-[2px_2px_0px_0px_#000]';
                }
              }
            } else if (isSelected) {
              cardStyle = 'bg-[#FF2E93] text-white border-2.5 border-black font-black shadow-[4px_4px_0px_0px_#00F0FF]';
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={isAnswered}
                onClick={() => handleSelectDefinition(idx)}
                className={`w-full text-left p-3.5 rounded-2xl border-2.5 text-xs sm:text-sm font-bold font-sans leading-relaxed transition-all duration-150 flex items-start gap-3 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 ${cardStyle}`}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 border-black shrink-0 flex items-center justify-center mt-0.5 font-black text-xs transition-all ${
                    isSelected ? 'bg-black text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className="leading-relaxed flex-1">{opt.text}</span>
              </button>
            );
          })
        ) : (
          /* Level 1: 6 Sentence Choices */
          shuffledSentences.map(({ sentence, originalIdx }) => {
            const isSelected = selectedIndices.has(originalIdx);
            const isTrueSentence = sentence.correct;

            let cardStyle =
              'bg-white dark:bg-slate-900 border-2.5 border-black dark:border-white text-slate-900 dark:text-slate-100 shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#334155] hover:bg-purple-50 dark:hover:bg-slate-800';

            if (isAnswered) {
              if (isCorrect) {
                if (isTrueSentence) {
                  cardStyle = 'bg-[#4ADE80] text-black border-2.5 border-black font-black shadow-[3px_3px_0px_0px_#000]';
                } else {
                  cardStyle = 'bg-slate-100 dark:bg-slate-900/40 border-2 border-slate-300 dark:border-slate-800 text-slate-400 dark:text-slate-600 opacity-40 shadow-none';
                }
              } else {
                if (isSelected) {
                  cardStyle = 'bg-[#FFE600] text-black border-2.5 border-black font-black shadow-[3px_3px_0px_0px_#000] opacity-80';
                } else {
                  cardStyle = 'bg-white dark:bg-slate-900 border-2.5 border-black/50 dark:border-white/50 text-slate-700 dark:text-slate-300 shadow-[2px_2px_0px_0px_#000]';
                }
              }
            } else if (isSelected) {
              cardStyle = 'bg-[#FFE600] text-black border-2.5 border-black font-black shadow-[4px_4px_0px_0px_#000]';
            }

            return (
              <button
                key={originalIdx}
                type="button"
                disabled={isAnswered}
                onClick={() => toggleSentence(originalIdx)}
                className={`w-full text-left p-4 rounded-2xl border-2.5 text-sm sm:text-base font-bold font-sans leading-relaxed transition-all duration-150 flex items-start gap-3.5 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 ${cardStyle}`}
              >
                <div
                  className={`w-6 h-6 rounded-lg border-2 border-black shrink-0 flex items-center justify-center mt-0.5 font-black transition-all ${
                    isSelected ? 'bg-black text-white' : 'bg-white text-slate-400'
                  }`}
                >
                  {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                </div>
                <span className="leading-relaxed flex-1 tracking-normal">{sentence.text}</span>
              </button>
            );
          })
        )}
      </div>

      {/* Action Footer: ONLY Submit button exists here when not answered */}
      {!isAnswered && (
        <button
          type="button"
          disabled={isLvl2 ? selectedDefIndex === null : selectedIndices.size !== 2}
          onClick={handleSubmit}
          className={`w-full py-4 text-white font-black font-display text-base tracking-wider uppercase rounded-2xl border-3 border-black shadow-[4px_4px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer ${
            isLvl2
              ? 'bg-[#FF2E93] hover:bg-[#E0267D] disabled:bg-slate-800 disabled:text-slate-600 disabled:border-slate-700 disabled:shadow-none shadow-[4px_4px_0px_0px_#00F0FF]'
              : 'bg-[#A855F7] hover:bg-[#9333EA] disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 disabled:border-slate-400 disabled:shadow-none'
          }`}
        >
          {isLvl2
            ? `SUBMIT SELECTION (${selectedDefIndex !== null ? 1 : 0}/1)`
            : `SUBMIT SELECTION (${selectedIndices.size}/2)`}
        </button>
      )}
    </div>
  );
};


