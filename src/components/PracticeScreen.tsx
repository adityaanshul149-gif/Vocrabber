import React, { useState, useEffect } from 'react';
import { VocabularyRecord, Sentence } from '../types';
import { Check, X, ArrowRight, RotateCcw, LogOut, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';

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

  const handleRetry = () => {
    setSelectedIndices(new Set());
    setIsAnswered(false);
    setIsCorrect(false);
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col justify-between p-4 sm:p-6 max-w-md mx-auto pb-8 transition-colors">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between border-b-2.5 border-black dark:border-slate-800 pb-3 mb-3">
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
          className="px-3 py-1.5 rounded-xl bg-[#FF6B6B] hover:bg-[#FF5252] text-black border-2 border-black text-xs font-black flex items-center gap-1 cursor-pointer shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
        >
          <LogOut className="w-3.5 h-3.5 stroke-[2.5]" />
          Exit
        </button>
      </div>

      {/* Target Word Hero Purple Card */}
      <div className="bg-[#A855F7] dark:bg-purple-950 text-white rounded-2xl p-4 sm:p-5 border-3 border-black dark:border-white shadow-[5px_5px_0px_0px_#000] dark:shadow-[5px_5px_0px_0px_#FFE600] space-y-3 mb-3 relative transition-all">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 text-left">
            <span className="text-[10px] font-black text-purple-200 dark:text-purple-300 uppercase tracking-widest block">
              Target Vocabulary Word
            </span>
            <h2 className="text-3xl font-black font-display tracking-tight uppercase leading-tight text-white">
              {currentWord.word}
            </h2>
          </div>

          {/* Floating Circular Try-Again Button floating next to the word */}
          {isAnswered && !isCorrect && (
            <button
              type="button"
              onClick={handleRetry}
              title="Try Again"
              className="w-11 h-11 rounded-full bg-[#FFE600] text-black border-2.5 border-black flex items-center justify-center hover:bg-[#FFD700] active:scale-90 transition-all shadow-[3px_3px_0px_0px_#000] shrink-0 cursor-pointer animate-bounce"
            >
              <RotateCcw className="w-5 h-5 stroke-[3]" />
            </button>
          )}
        </div>

        {/* Meaning & Example inside purple card: smooth slide-down animation */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isAnswered ? 'max-h-96 opacity-100 pt-3 border-t-2 border-black/30 dark:border-white/30' : 'max-h-0 opacity-0 p-0'
          }`}
        >
          <div className="space-y-2 text-xs text-left">
            {/* Definition box */}
            <div className="bg-black/90 text-white dark:bg-slate-900/90 border-2 border-black dark:border-white rounded-xl p-3 shadow-[2px_2px_0px_0px_#000]">
              <span className="text-[10px] font-black uppercase text-[#FFE600] tracking-wider block mb-0.5 font-display">
                Meaning
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

      {/* Incorrect Feedback Banner (between purple card and options) */}
      {isAnswered && !isCorrect && (
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
            className="px-3 py-1.5 bg-[#FFE600] hover:bg-[#FFD700] text-black border-2 border-black font-black text-xs uppercase rounded-lg shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer flex items-center gap-1 shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
            Retry
          </button>
        </div>
      )}

      {/* Correct Feedback Banner */}
      {isAnswered && isCorrect && (
        <div className="bg-[#4ADE80] text-black border-2.5 border-black rounded-xl p-3 mb-3 flex items-center gap-2.5 shadow-[3px_3px_0px_0px_#000] animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-5 h-5 stroke-[2.5] text-black shrink-0" />
          <div>
            <span className="text-xs font-black uppercase block tracking-wide">
              All 2 usages correct! 🎉
            </span>
            <p className="text-[11px] font-bold text-black/90 leading-tight">
              Great job! Review the meaning and move to the next word.
            </p>
          </div>
        </div>
      )}

      {/* 6 Sentences Options */}
      <div className="space-y-3 flex-1 mb-4">
        {shuffledSentences.map(({ sentence, originalIdx }) => {
          const isSelected = selectedIndices.has(originalIdx);
          const isTrueSentence = sentence.correct;

          let cardStyle =
            'bg-white dark:bg-slate-900 border-2.5 border-black dark:border-white text-slate-900 dark:text-slate-100 shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#334155] hover:bg-purple-50 dark:hover:bg-slate-800';

          if (isAnswered) {
            if (isCorrect) {
              // Reveal correct answers only when the user gets them right!
              if (isTrueSentence) {
                cardStyle = 'bg-[#4ADE80] text-black border-2.5 border-black font-black shadow-[3px_3px_0px_0px_#000]';
              } else {
                cardStyle = 'bg-slate-100 dark:bg-slate-900/40 border-2 border-slate-300 dark:border-slate-800 text-slate-400 dark:text-slate-600 opacity-40 shadow-none';
              }
            } else {
              // When WRONG: do NOT reveal correct answers! Keep selected cards marked neutrally without green/red reveals
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
      ) : !isCorrect ? (
        <button
          type="button"
          onClick={handleRetry}
          className="w-full py-4 bg-[#FFE600] hover:bg-[#FFD700] text-black font-black font-display text-base tracking-wider uppercase rounded-2xl border-3 border-black shadow-[4px_4px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-5 h-5 stroke-[2.5]" />
          TRY AGAIN
        </button>
      ) : (
        <button
          type="button"
          onClick={onNextWord}
          className="w-full py-4 bg-[#A855F7] hover:bg-[#9333EA] text-white font-black font-display text-base tracking-wider uppercase rounded-2xl border-3 border-black flex items-center justify-center gap-2 cursor-pointer shadow-[4px_4px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
        >
          NEXT WORD
          <ArrowRight className="w-5 h-5 stroke-[2.5]" />
        </button>
      )}
    </div>
  );
};

