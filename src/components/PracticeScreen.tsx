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
    <div className="min-h-screen bg-[#F6F5FB] text-slate-900 font-sans flex flex-col justify-between p-4 sm:p-6 max-w-md mx-auto pb-8">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between border-b border-purple-100 pb-3 mb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-purple-500" /> {modeTitle} Mode
          </span>
          <h1 className="text-lg font-extrabold font-display text-slate-900 leading-tight">
            Select 2 Correct Usages
          </h1>
        </div>
        <button
          type="button"
          onClick={onEndPractice}
          className="px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 border border-rose-200/80 text-rose-600 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
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
      <div className="space-y-2.5 flex-1 mb-4">
        {shuffledSentences.map(({ sentence, originalIdx }) => {
          const isSelected = selectedIndices.has(originalIdx);
          const isTrueSentence = sentence.correct;

          let cardStyle =
            'bg-white border-slate-200/80 text-slate-700 hover:border-purple-300 hover:bg-purple-50/30';

          if (isAnswered) {
            if (isTrueSentence) {
              cardStyle = 'bg-emerald-50 border-emerald-400 text-emerald-950 font-medium shadow-xs';
            } else if (isSelected && !isTrueSentence) {
              cardStyle = 'bg-rose-50 border-rose-300 text-rose-950';
            } else {
              cardStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-50';
            }
          } else if (isSelected) {
            cardStyle = 'bg-purple-50 border-purple-500 text-purple-950 shadow-md shadow-purple-500/10 font-medium';
          }

          return (
            <button
              key={originalIdx}
              type="button"
              disabled={isAnswered}
              onClick={() => toggleSentence(originalIdx)}
              className={`w-full text-left p-3.5 rounded-2xl border text-xs sm:text-sm font-sans transition-all duration-200 flex items-start gap-3 cursor-pointer ${cardStyle}`}
            >
              <div
                className={`w-5 h-5 rounded-lg border shrink-0 flex items-center justify-center mt-0.5 transition-all ${
                  isSelected
                    ? 'bg-purple-600 border-purple-600 text-white font-bold'
                    : 'border-slate-300 bg-slate-100'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
              <span className="leading-relaxed flex-1">{sentence.text}</span>
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
        <div className="bg-white border border-purple-100 rounded-3xl p-5 space-y-4 shadow-xl animate-in fade-in">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            {isCorrect ? (
              <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-2xl bg-rose-100 text-rose-500 flex items-center justify-center">
                <X className="w-6 h-6" />
              </div>
            )}
            <div>
              <span
                className={`text-base font-extrabold font-display block leading-tight ${
                  isCorrect ? 'text-emerald-600' : 'text-rose-500'
                }`}
              >
                {isCorrect ? 'Awesome! Correct Answer 🎉' : 'Needs Review 💡'}
              </span>
              <p className="text-[11px] text-slate-500 font-medium">
                {isCorrect ? 'You accurately retrieved the word meanings.' : 'Review correct usage highlighted in green above.'}
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="bg-purple-50/60 p-3 rounded-2xl border border-purple-100">
              <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wide block">
                Definition
              </span>
              <p className="text-slate-800 font-semibold mt-0.5">{currentWord.definition}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">
                Example Usage
              </span>
              <p className="text-slate-700 italic mt-0.5">"{currentWord.exampleUsage}"</p>
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
                className="w-full py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 rounded-2xl cursor-pointer border border-purple-200 transition-all"
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
