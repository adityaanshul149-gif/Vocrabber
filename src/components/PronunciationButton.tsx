import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { TTSService } from '../services/ttsService';

interface PronunciationButtonProps {
  word: string;
  className?: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showTextBelow?: boolean; // If true, renders the word with speaker icon immediately below
}

export const PronunciationButton: React.FC<PronunciationButtonProps> = ({
  word,
  className = '',
  iconOnly = false,
  size = 'md',
  showTextBelow = false
}) => {
  const [isSpeakingThis, setIsSpeakingThis] = useState(false);

  useEffect(() => {
    const unsubscribe = TTSService.subscribeSpeaking((speaking, text) => {
      setIsSpeakingThis(speaking && text === word);
    });
    return unsubscribe;
  }, [word]);

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSpeakingThis) {
      TTSService.stop();
    } else {
      TTSService.speak(word);
    }
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const btnPadding = {
    sm: 'p-1',
    md: 'p-1.5',
    lg: 'p-2'
  };

  if (showTextBelow) {
    return (
      <div className="inline-flex flex-col items-center group">
        {/* Clickable Word */}
        <button
          type="button"
          onClick={handleSpeak}
          title={`Click to pronounce "${word}"`}
          className="font-black text-slate-900 dark:text-white cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/50 px-2 py-0.5 rounded-lg transition-all text-left flex items-center gap-1.5"
        >
          <span>{word}</span>
        </button>

        {/* Small Speaker Icon immediately below word */}
        <button
          type="button"
          onClick={handleSpeak}
          title={`Pronounce "${word}"`}
          aria-label={`Pronounce ${word}`}
          className={`mt-0.5 inline-flex items-center justify-center rounded-md border border-black dark:border-white transition-all cursor-pointer ${
            isSpeakingThis
              ? 'bg-[#A855F7] text-white shadow-[1px_1px_0px_0px_#000] scale-105 animate-pulse'
              : 'bg-[#FFE600] text-black hover:bg-yellow-300 shadow-[1px_1px_0px_0px_#000]'
          } ${btnPadding[size]} ${className}`}
        >
          <Volume2 className={`${iconSizes[size]} ${isSpeakingThis ? 'animate-bounce' : ''}`} />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleSpeak}
      title={`Listen to pronunciation for "${word}"`}
      aria-label={`Pronounce ${word}`}
      className={`inline-flex items-center justify-center rounded-xl border-2 border-black dark:border-white cursor-pointer transition-all shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
        isSpeakingThis
          ? 'bg-[#A855F7] text-white animate-pulse'
          : 'bg-[#FFE600] hover:bg-yellow-300 text-black'
      } ${btnPadding[size]} ${className}`}
    >
      <Volume2 className={`${iconSizes[size]} ${isSpeakingThis ? 'animate-bounce' : ''}`} />
    </button>
  );
};
