import React, { useState, useEffect } from 'react';
import { PracticeMode, VocabularyRecord, AppLevel } from '../types';
import { QueueService } from '../services/queue';
import { VALID_SECTORS } from '../data/defaultVocabulary';
import { X, Play } from 'lucide-react';

interface PracticeConfigModalProps {
  isOpen: boolean;
  mode: PracticeMode;
  appLevel?: AppLevel;
  onClose: () => void;
  onStart: (mode: PracticeMode, selectedSectors: Set<string>) => void;
}

export const PracticeConfigModal: React.FC<PracticeConfigModalProps> = ({
  isOpen,
  mode,
  appLevel = 'lvl1',
  onClose,
  onStart
}) => {
  const [selectedSectors, setSelectedSectors] = useState<Set<string>>(new Set(VALID_SECTORS));
  const [eligibleList, setEligibleList] = useState<VocabularyRecord[]>([]);

  useEffect(() => {
    if (isOpen) {
      const eligible = QueueService.getEligibleWords(mode, undefined, appLevel as AppLevel);
      const availableSectors = new Set(eligible.map(w => w.sector));
      setSelectedSectors(availableSectors.size > 0 ? availableSectors : new Set<string>(VALID_SECTORS));
      setEligibleList(eligible);
    }
  }, [isOpen, mode, appLevel]);

  if (!isOpen) return null;

  const modeTitle =
    mode === 'weak' ? 'Weak Words Practice' : mode === 'less' ? 'Less Attempted Practice' : 'Random Practice';

  const toggleSector = (sector: string) => {
    const next = new Set(selectedSectors);
    if (next.has(sector)) {
      next.delete(sector);
    } else {
      next.add(sector);
    }
    setSelectedSectors(next);
  };

  const activeCount = eligibleList.filter(w => selectedSectors.has(w.sector)).length;
  const selectedAvailableCount = Array.from(selectedSectors).filter(s => eligibleList.some(w => w.sector === s)).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border-3 border-black dark:border-white max-w-md w-full p-6 rounded-2xl space-y-5 shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#A855F7]">
        <div className="flex items-center justify-between border-b-2.5 border-black dark:border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-black uppercase text-purple-700 dark:text-purple-400 tracking-wider block">
              Study Session Setup
            </span>
            <h2 className="text-xl font-black font-display uppercase text-slate-900 dark:text-white">{modeTitle}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-2 border-black dark:border-white text-black dark:text-white hover:bg-slate-200 transition-all cursor-pointer shadow-[2px_2px_0px_0px_#000]"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        <div>
          <span className="text-xs font-black text-slate-900 dark:text-slate-100 block mb-2 uppercase">
            Select Active Sectors ({selectedAvailableCount} Selected · {activeCount} Word{activeCount === 1 ? '' : 's'})
          </span>

          {eligibleList.length === 0 ? (
            <p className="text-black text-xs bg-[#FF6B6B] border-2 border-black rounded-xl p-3 font-black uppercase shadow-[2px_2px_0px_0px_#000]">
              No eligible words match this criteria. Try another mode or add more vocabulary!
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1">
              {VALID_SECTORS.map(sector => {
                const countInSector = eligibleList.filter(w => w.sector === sector).length;
                const isAvailable = countInSector > 0;
                const isChecked = selectedSectors.has(sector);

                return (
                  <label
                    key={sector}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 text-xs font-black uppercase transition-all cursor-pointer ${
                      !isAvailable
                        ? 'opacity-30 border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/40 text-slate-400 cursor-not-allowed'
                        : isChecked
                        ? 'border-black bg-[#FFE600] text-black shadow-[2px_2px_0px_0px_#000]'
                        : 'border-black/30 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      disabled={!isAvailable}
                      checked={isChecked && isAvailable}
                      onChange={() => isAvailable && toggleSector(sector)}
                      className="accent-black w-4 h-4 cursor-pointer"
                    />
                    <span className="truncate flex-1">{sector}</span>
                    <span className="text-[10px] font-black opacity-80">({countInSector})</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2.5 pt-3 border-t-2 border-black dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border-2 border-black text-black dark:text-white dark:border-white font-black text-xs uppercase cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={activeCount === 0}
            onClick={() => onStart(mode, selectedSectors)}
            className="px-5 py-2.5 bg-[#A855F7] hover:bg-[#9333EA] disabled:bg-slate-300 disabled:text-slate-500 disabled:border-slate-400 text-white font-black font-display text-xs uppercase rounded-xl border-2.5 border-black flex items-center gap-2 cursor-pointer shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
          >
            <Play className="w-4 h-4 fill-current stroke-[2]" />
            Start Session ({activeCount})
          </button>
        </div>
      </div>
    </div>
  );
};
