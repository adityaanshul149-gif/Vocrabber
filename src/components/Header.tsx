import React from 'react';
import { AppLevel } from '../types';
import { Sparkles, Target } from 'lucide-react';

interface HeaderProps {
  appLevel: AppLevel;
  onToggleLevel: (level: AppLevel) => void;
  theme?: 'light' | 'dark';
}

export const Header: React.FC<HeaderProps> = ({ appLevel, onToggleLevel }) => {
  const isLvl2 = appLevel === 'lvl2';

  return (
    <header className={`sticky top-0 z-40 transition-colors border-b-3 border-black shadow-[0px_4px_0px_0px_#000] ${
      isLvl2
        ? 'bg-[#0B0F19] text-white border-pink-500 shadow-[0px_4px_0px_0px_#FF2E93]'
        : 'bg-[#FFE600] dark:bg-purple-950 text-black dark:text-white dark:shadow-[0px_4px_0px_0px_#A855F7]'
    }`}>
      <div className="max-w-md mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        {/* VocCrab Logo Branding */}
        <div className="flex items-center gap-2 shrink-0">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl font-black border-2 border-black transition-all ${
            isLvl2 ? 'bg-[#FF2E93] text-white shadow-[2.5px_2.5px_0px_0px_#00F0FF]' : 'bg-purple-600 text-white shadow-[2.5px_2.5px_0px_0px_#000]'
          }`}>
            🦀
          </div>
          <div>
            <h1 className="text-xl font-black font-display tracking-tight uppercase leading-none">
              VocCrab
            </h1>
          </div>
        </div>

        {/* Animated Horizontal Level Switcher */}
        <div className={`relative p-1 rounded-2xl border-2.5 border-black flex items-center gap-1 shadow-[3px_3px_0px_0px_#000] cursor-pointer transition-all ${
          isLvl2 ? 'bg-[#121827] border-pink-500' : 'bg-white dark:bg-slate-900'
        }`}>
          {/* Level 1 Button */}
          <button
            type="button"
            onClick={() => onToggleLevel('lvl1')}
            className={`relative z-10 px-3 py-1.5 rounded-xl font-black text-xs uppercase tracking-wide transition-all flex items-center gap-1 cursor-pointer ${
              !isLvl2
                ? 'bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 stroke-[2.5] ${!isLvl2 ? 'text-purple-700' : 'text-slate-500'}`} />
            LVL I
          </button>

          {/* Level 2 Button */}
          <button
            type="button"
            onClick={() => onToggleLevel('lvl2')}
            className={`relative z-10 px-3 py-1.5 rounded-xl font-black text-xs uppercase tracking-wide transition-all flex items-center gap-1 cursor-pointer ${
              isLvl2
                ? 'bg-[#FF2E93] text-white border-2 border-black shadow-[2px_2px_0px_0px_#00F0FF] animate-pulse'
                : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Target className={`w-3.5 h-3.5 stroke-[2.5] ${isLvl2 ? 'text-[#00F0FF]' : 'text-slate-500'}`} />
            LVL II
          </button>
        </div>
      </div>
    </header>
  );
};

