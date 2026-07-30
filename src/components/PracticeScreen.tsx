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
    <div className="min-h-screen bg-[#F6F5FB] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col justify-between p-4 sm:p-6 max-w-md mx-auto pb-8 transition-colors">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between border-b border-purple-100 dark:border-slate-800 pb-3 mb-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-purple-500" /> {modeTitle} Mode
          </span>
          <h1 className="text-lg font-black font-display text-slate-900 dark:text-white leading-tight">
            Select 2 Correct Usages
          </h1>
        </div>
        <button
          type="button"
          onClick={onEndPractice}
          className="px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/80 border border-rose-200/80 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Exit Session
        </button>
      </div>

      {/* Target Word Hero Display */}
      <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-800 text-white rounded-3xl p-5 text-center shadow-lg shadow-purple-600/20 space-y-1.5 mb-4 relative overflow-hidden">
        <span className="text-[11px] font-medium text-purple-200 uppercase tracking-wide block">
          Target Vocabulary Word
        </span>
        <h2 className="text-3xl font-black font-display tracking-tight text-white capitalize">
          {currentWord.word}
        </h2>
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 text-[11px] font-bold text-white tracking-wide mt-1">
          <BookOpen className="w-3 h-3 text-yellow-300" />
          Sector: {currentWord.sector}
        </div>
      </div>

      {/* 6 Sentences Options */}
      <div className="space-y-3 flex-1 mb-4">
        {shuffledSentences.map(({ sentence, originalIdx }) => {
          const isSelected = selectedIndices.has(originalIdx);
          const isTrueSentence = sentence.correct;

          let cardStyle =
            'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-slate-800/80';

          if (isAnswered) {
            if (isTrueSentence) {
              cardStyle = 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-500 dark:border-emerald-400 text-emerald-950 dark:text-emerald-100 font-bold shadow-xs';
            } else if (isSelected && !isTrueSentence) {
              cardStyle = 'bg-rose-50 dark:bg-rose-950/80 border-rose-400 dark:border-rose-500 text-rose-950 dark:text-rose-100 font-semibold';
            } else {
              cardStyle = 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 opacity-50';
            }
          } else if (isSelected) {
            cardStyle = 'bg-purple-50 dark:bg-purple-950/70 border-purple-600 dark:border-purple-400 text-purple-950 dark:text-purple-100 shadow-md shadow-purple-500/10 font-bold';
          }

          return (
            <button
              key={originalIdx}
              type="button"
              disabled={isAnswered}
              onClick={() => toggleSentence(originalIdx)}
              className={`w-full text-left p-4 rounded-2xl border text-sm sm:text-base font-semibold font-sans leading-relaxed transition-all duration-200 flex items-start gap-3.5 cursor-pointer ${cardStyle}`}
            >
              <div
                className={`w-5 h-5 rounded-lg border shrink-0 flex items-center justify-center mt-0.5 transition-all ${
                  isSelected
                    ? 'bg-purple-600 border-purple-600 text-white font-bold'
                    : 'border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
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
          className="w-full py-4 bg-purple-600 disabled:opacity-40 disabled:hover:bg-purple-600 text-white font-extrabold font-display text-base tracking-wide rounded-2xl shadow-lg shadow-purple-600/30 hover:bg-purple-700 active:scale-[0.98] transition-all cursor-pointer"
        >
          SUBMIT SELECTION ({selectedIndices.size}/2)
        </button>
      ) : (
        /* Feedback Card Banner */
        <div className="bg-white dark:bg-slate-900 border border-purple-100 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl animate-in fade-in">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            {isCorrect ? (
              <div className="w-9 h-9 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-500 dark:text-rose-300 flex items-center justify-center">
                <X className="w-6 h-6" />
              </div>
            )}
            <div>
              <span
                className={`text-base font-extrabold font-display block leading-tight ${
                  isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'
                }`}
              >
                {isCorrect ? 'Awesome! Correct Answer 🎉' : 'Needs Review 💡'}
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {isCorrect ? 'You accurately retrieved the word meanings.' : 'Review correct usage highlighted in green above.'}
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="bg-purple-50/60 dark:bg-purple-950/40 p-3 rounded-2xl border border-purple-100 dark:border-purple-900/60">
              <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wide block">
                Definition
              </span>
              <p className="text-slate-900 dark:text-slate-100 font-bold mt-0.5">{currentWord.definition}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block">
                Example Usage
              </span>
              <p className="text-slate-800 dark:text-slate-200 italic font-medium mt-0.5">"{currentWord.exampleUsage}"</p>
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
                className="w-full py-3 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 rounded-2xl cursor-pointer border border-purple-200 dark:border-purple-800 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                TRY AGAIN
              </button>
            ) : (
              <button
                type="button"
                onClick={onNextWord}
                className="w-full py-3.5 bg-purple-600 text-white font-extrabold font-display text-base tracking-wide rounded-2xl hover:bg-purple-700 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-600/30 active:scale-[0.98] transition-all"
              >
                NEXT WORD
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
