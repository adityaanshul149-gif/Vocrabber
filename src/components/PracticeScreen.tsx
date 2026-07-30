import React, { useState, useEffect } from 'react';
import { VocabularyRecord, Sentence } from '../types';
import { Check, X, ArrowRight, RotateCcw, LogOut, Sparkles, BookOpen, CheckCircle2 } from 'lucide-react';

interface PracticeScreenProps {
  currentWord: VocabularyRecord;
  modeTitle: string;
  onAnswerSubmit: (word: VocabularyRecord, isCorrect: boolean) => void;
  onNextWord: () => void;
  onEndPractice: () => void;
}

export const PracticeScreen: React.FC<PracticeScreenProps> = ({
  currentWord,
  modeTitle,
  onAnswerSubmit,
  onNextWord,
  onEndPractice
}) => {
  const [shuffledSentences, setShuffledSentences] = useState<{ sentence: Sentence; originalIdx: number }[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    // Shuffle sentences when word changes
    const withIndex = currentWord.sentences.map((sentence, originalIdx) => ({
      sentence,
      originalIdx
    }));
    for (let i = withIndex.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [withIndex[i], withIndex[j]] = [withIndex[j], withIndex[i]];
    }
    setShuffledSentences(withIndex);
    setSelectedIndices(new Set());
    setIsAnswered(false);
    setIsCorrect(false);
  }, [currentWord]);

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

  const handleSubmit = () => {
    if (selectedIndices.size !== 2 || isAnswered) return;

    const correctOriginalIndices = new Set(
      currentWord.sentences
        .map((s, idx) => (s.correct ? idx : null))
        .filter((idx): idx is number => idx !== null)
    );

    const correct =
      selectedIndices.size === correctOriginalIndices.size &&
      Array.from(selectedIndices).every(idx => correctOriginalIndices.has(idx));

    setIsCorrect(correct);
    setIsAnswered(true);
    onAnswerSubmit(currentWord, correct);
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col justify-between p-4 sm:p-6 max-w-md mx-auto pb-8 transition-colors">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between border-b-2.5 border-black dark:border-slate-800 pb-3 mb-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 stroke-[2.5]" /> {modeTitle} Mode
          </span>
          <h1 className="text-lg font-black font-display uppercase tracking-tight text-slate-900 dark:text-white leading-tight">
            Select 2 Correct Usages
          </h1>
        </div>
        <button
          type="button"
          onClick={onEndPractice}
          className="px-3 py-1.5 rounded-xl bg-[#FF6B6B] hover:bg-[#FF5252] text-black border-2 border-black text-xs font-black flex items-center gap-1 cursor-pointer shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[0px_0px_0px_0px_#000] transition-all"
        >
          <LogOut className="w-3.5 h-3.5 stroke-[2.5]" />
          Exit Session
        </button>
      </div>

      {/* Target Word Hero Display */}
      <div className="bg-[#FFE600] dark:bg-purple-900 text-black dark:text-white rounded-2xl p-5 text-center border-3 border-black dark:border-white shadow-[5px_5px_0px_0px_#000] dark:shadow-[5px_5px_0px_0px_#A855F7] space-y-1 mb-4 relative overflow-hidden">
        <span className="text-[10px] font-black text-black/80 dark:text-purple-200 uppercase tracking-widest block">
          Target Vocabulary Word
        </span>
        <h2 className="text-3xl font-black font-display tracking-tight uppercase">
          {currentWord.word}
        </h2>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black text-white dark:bg-white dark:text-black text-[11px] font-black uppercase tracking-wide mt-1">
          <BookOpen className="w-3.5 h-3.5 text-amber-300 dark:text-purple-600 stroke-[2.5]" />
          Sector: {currentWord.sector}
        </div>
      </div>

      {/* 6 Sentences Options */}
      <div className="space-y-3 flex-1 mb-4">
        {shuffledSentences.map(({ sentence, originalIdx }) => {
          const isSelected = selectedIndices.has(originalIdx);
          const isTrueSentence = sentence.correct;

          let cardStyle =
            'bg-white dark:bg-slate-900 border-2.5 border-black dark:border-white text-slate-900 dark:text-slate-100 shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#334155] hover:bg-purple-50 dark:hover:bg-slate-800';

          if (isAnswered) {
            if (isTrueSentence) {
              cardStyle = 'bg-[#4ADE80] text-black border-2.5 border-black font-black shadow-[3px_3px_0px_0px_#000]';
            } else if (isSelected && !isTrueSentence) {
              cardStyle = 'bg-[#FF6B6B] text-black border-2.5 border-black font-black shadow-[3px_3px_0px_0px_#000]';
            } else {
              cardStyle = 'bg-slate-100 dark:bg-slate-900/40 border-2 border-slate-300 dark:border-slate-800 text-slate-400 dark:text-slate-600 opacity-40 shadow-none';
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
                  isSelected
                    ? 'bg-black text-white'
                    : 'bg-white text-slate-400'
                }`}
              >
                {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
              </div>
              <span className="leading-relaxed flex-1 tracking-normal">{sentence.text}</span>
            </button>
          );
        })}
      </div>

      {/* Action Footer */}
      {!isAnswered ? (
        <button
          type="button"
          disabled={selectedIndices.size !== 2}
          onClick={handleSubmit}
          className="w-full py-4 bg-[#A855F7] disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 disabled:border-slate-400 disabled:shadow-none hover:bg-[#9333EA] text-white font-black font-display text-base tracking-wider uppercase rounded-2xl border-3 border-black shadow-[4px_4px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0px_0px_#000] transition-all cursor-pointer"
        >
          SUBMIT SELECTION ({selectedIndices.size}/2)
        </button>
      ) : (
        /* Feedback Card Banner */
        <div className="bg-white dark:bg-slate-900 border-3 border-black dark:border-white rounded-2xl p-5 space-y-4 shadow-[5px_5px_0px_0px_#000] dark:shadow-[5px_5px_0px_0px_#A855F7] animate-in fade-in">
          <div className="flex items-center gap-3 border-b-2 border-black dark:border-slate-800 pb-3">
            {isCorrect ? (
              <div className="w-10 h-10 rounded-xl bg-[#4ADE80] border-2 border-black text-black flex items-center justify-center font-black">
                <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-[#FF6B6B] border-2 border-black text-black flex items-center justify-center font-black">
                <X className="w-6 h-6 stroke-[2.5]" />
              </div>
            )}
            <div>
              <span
                className={`text-base font-black font-display uppercase block leading-tight ${
                  isCorrect ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {isCorrect ? 'Awesome! Correct Answer 🎉' : 'Needs Review 💡'}
              </span>
              <p className="text-[11px] text-slate-700 dark:text-slate-300 font-bold">
                {isCorrect ? 'You accurately retrieved the word meanings.' : 'Review correct usage highlighted above.'}
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="bg-[#FFE600]/30 dark:bg-purple-950/50 p-3 rounded-xl border-2 border-black dark:border-slate-700">
              <span className="text-[10px] font-black text-black dark:text-purple-300 uppercase tracking-wide block">
                Definition
              </span>
              <p className="text-slate-900 dark:text-slate-100 font-bold mt-0.5">{currentWord.definition}</p>
            </div>
            <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl border-2 border-black dark:border-slate-700">
              <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-wide block">
                Example Usage
              </span>
              <p className="text-slate-900 dark:text-slate-200 italic font-bold mt-0.5">"{currentWord.exampleUsage}"</p>
            </div>
          </div>

          <div className="pt-1">
            {!isCorrect ? (
              <button
                type="button"
                onClick={() => {
                  setSelectedIndices(new Set());
                  setIsAnswered(false);
                }}
                className="w-full py-3.5 bg-[#FFC72C] hover:bg-[#FFB700] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 rounded-xl border-2.5 border-black shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer transition-all"
              >
                <RotateCcw className="w-4 h-4 stroke-[2.5]" />
                TRY AGAIN
              </button>
            ) : (
              <button
                type="button"
                onClick={onNextWord}
                className="w-full py-4 bg-[#A855F7] hover:bg-[#9333EA] text-white font-black font-display text-base tracking-wider uppercase rounded-xl border-3 border-black flex items-center justify-center gap-2 cursor-pointer shadow-[4px_4px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
              >
                NEXT WORD
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
