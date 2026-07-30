import React, { useState, useEffect } from 'react';
import { PracticeMode, VocabularyRecord } from '../types';
import { QueueService } from '../services/queue';
import { VALID_SECTORS } from '../data/defaultVocabulary';
import { X, Play } from 'lucide-react';

interface PracticeConfigModalProps {
  isOpen: boolean;
  mode: PracticeMode;
  onClose: () => void;
  onStart: (mode: PracticeMode, selectedSectors: Set<string>) => void;
}

export const PracticeConfigModal: React.FC<PracticeConfigModalProps> = ({
  isOpen,
  mode,
  onClose,
  onStart
}) => {
  const [selectedSectors, setSelectedSectors] = useState<Set<string>>(new Set(VALID_SECTORS));
  const [eligibleList, setEligibleList] = useState<VocabularyRecord[]>([]);

  useEffect(() => {
    if (isOpen) {
      const eligible = QueueService.getEligibleWords(mode);
      const availableSectors = new Set(eligible.map(w => w.sector));
      setSelectedSectors(availableSectors.size > 0 ? availableSectors : new Set(VALID_SECTORS));
      setEligibleList(eligible);
    }
  }, [isOpen, mode]);

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

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-in fade-in">
      <div className="bg-white border border-purple-100 max-w-md w-full p-6 rounded-3xl space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[11px] font-extrabold uppercase text-purple-600 tracking-wider">
              Study Session Setup
            </span>
            <h2 className="text-xl font-black font-display text-slate-900">{modeTitle}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <span className="text-xs font-bold text-slate-700 block mb-2">
            Select Active Sectors ({selectedSectors.size} Selected · {activeCount} Word{activeCount === 1 ? '' : 's'})
          </span>

          {eligibleList.length === 0 ? (
            <p className="text-rose-600 text-xs bg-rose-50 border border-rose-200 rounded-2xl p-3 font-semibold">
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
                    className={`flex items-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all ${
                      !isAvailable
                        ? 'opacity-30 border-slate-100 bg-slate-50 cursor-not-allowed'
                        : isChecked
                        ? 'border-purple-500 bg-purple-50 text-purple-900 shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      disabled={!isAvailable}
                      checked={isChecked && isAvailable}
                      onChange={() => isAvailable && toggleSector(sector)}
                      className="accent-purple-600 rounded-md w-4 h-4 cursor-pointer"
                    />
                    <span className="truncate flex-1">{sector}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">({countInSector})</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={activeCount === 0}
            onClick={() => onStart(mode, selectedSectors)}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-extrabold font-display text-sm rounded-2xl flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-600/30 transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            Start Session ({activeCount})
          </button>
        </div>
      </div>
    </div>
  );
};
