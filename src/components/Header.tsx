import React from 'react';
import { Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-purple-100/80 sticky top-0 z-40 shadow-xs">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-purple-500/20 text-xl font-bold">
            🦀
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-extrabold font-display tracking-tight text-slate-900">
                VocCrab
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                v1.5
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">CAT VARC Vocabulary</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-semibold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span>Study Focus</span>
          </div>
        </div>
      </div>
    </header>
  );
};
