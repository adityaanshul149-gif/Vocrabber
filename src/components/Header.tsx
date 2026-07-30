import React from 'react';
import { Sparkles, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ theme = 'light', onToggleTheme }) => {
  return (
    <header className="bg-[#FFE600] dark:bg-purple-950 border-b-3 border-black dark:border-white sticky top-0 z-40 transition-colors shadow-[0px_4px_0px_0px_#000] dark:shadow-[0px_4px_0px_0px_#A855F7]">
      <div className="max-w-md mx-auto px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white border-2 border-black dark:border-white shadow-[2.5px_2.5px_0px_0px_#000] dark:shadow-[2.5px_2.5px_0px_0px_#FFF] flex items-center justify-center text-xl font-black">
            🦀
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-black font-display tracking-tight text-black dark:text-white uppercase">
                VocCrab
              </h1>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-black text-amber-300 border border-black dark:bg-white dark:text-black">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-black/80 dark:text-purple-200 font-extrabold uppercase tracking-wide">CAT VARC Vocabulary</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label="Toggle dark mode"
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border-2 border-black dark:border-white shadow-[2.5px_2.5px_0px_0px_#000] dark:shadow-[2.5px_2.5px_0px_0px_#A855F7] text-black dark:text-white active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#000] transition-all cursor-pointer font-bold"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 stroke-[2.5]" />
              ) : (
                <Moon className="w-4 h-4 text-slate-900 stroke-[2.5]" />
              )}
            </button>
          )}

          <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-400 dark:bg-emerald-500 text-black border-2 border-black shadow-[2.5px_2.5px_0px_0px_#000] text-xs font-black">
            <Sparkles className="w-3.5 h-3.5 text-black stroke-[3] animate-pulse" />
            <span className="uppercase tracking-wide">CAT Mode</span>
          </div>
        </div>
      </div>
    </header>
  );
};

