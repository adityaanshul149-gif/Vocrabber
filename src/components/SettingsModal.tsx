import React, { useState, useRef } from 'react';
import { StorageService } from '../services/storage';
import { FullBackup, IntegrityReport } from '../types';
import { X, Download, Upload, ShieldCheck, Database, PlusCircle, FileText, Sparkles, Sun, Moon } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestoreComplete: () => void;
  onOpenImportModal?: () => void;
  onOpenSentenceModal?: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onRestoreComplete,
  onOpenImportModal,
  onOpenSentenceModal,
  theme = 'light',
  onToggleTheme
}) => {
  const [integrityReport, setIntegrityReport] = useState<IntegrityReport | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const vocabulary = StorageService.getVocabulary();
  const backupMeta = StorageService.getLastBackupMetadata();

  const handleDownloadBackup = () => {
    const backup = StorageService.createFullBackup();
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'voccrab-full-backup.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);

    setStatusMessage({
      text: 'Full backup exported successfully.',
      isError: false
    });
  };

  const handleRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const backup = JSON.parse(text) as FullBackup;

      if (
        window.confirm(
          'Restore full backup? Current vocabulary, progress, and settings will be replaced.'
        )
      ) {
        const result = StorageService.restoreBackup(backup);
        if (result.success) {
          setStatusMessage({
            text: 'Backup restored successfully.',
            isError: false
          });
          onRestoreComplete();
        } else {
          setStatusMessage({
            text: `Restore failed: ${result.error}`,
            isError: true
          });
        }
      }
    } catch (err) {
      setStatusMessage({
        text: `Error reading backup file: ${(err as Error).message}`,
        isError: true
      });
    } finally {
      e.target.value = '';
    }
  };

  const handleVerifyIntegrity = () => {
    const report = StorageService.verifyIntegrity();
    setIntegrityReport(report);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border-3 border-black dark:border-white rounded-2xl max-w-lg w-full p-6 shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#A855F7] space-y-5 max-h-[90vh] overflow-y-auto font-sans">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2.5 border-black dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FFE600] border-2 border-black text-black flex items-center justify-center font-black">
              ⚙️
            </div>
            <div>
              <h2 className="text-xl font-black font-display text-slate-900 dark:text-white uppercase">App Settings</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-bold">Vocabulary & System Configuration</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-2 border-black dark:border-white text-black dark:text-white hover:bg-slate-200 transition-all cursor-pointer shadow-[2px_2px_0px_0px_#000]"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Appearance Theme Selector */}
        <div className="space-y-3 bg-slate-50 dark:bg-slate-800/60 border-2 border-black dark:border-slate-700 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black font-display uppercase text-slate-900 dark:text-white flex items-center gap-2">
              {theme === 'dark' ? <Moon className="w-4 h-4 text-purple-400 stroke-[2.5]" /> : <Sun className="w-4 h-4 text-amber-500 stroke-[2.5]" />}
              Appearance Theme
            </h3>
            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-md bg-[#FFE600] border border-black text-black">
              {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </span>
          </div>

          <p className="text-xs text-slate-700 dark:text-slate-300 font-bold">
            Switch theme for comfortable viewing on mobile and desktop screens.
          </p>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                if (theme !== 'light' && onToggleTheme) onToggleTheme();
              }}
              className={`py-2.5 px-3 rounded-xl font-black uppercase text-xs flex items-center justify-center gap-2 cursor-pointer transition-all border-2 border-black ${
                theme === 'light'
                  ? 'bg-[#FFE600] text-black shadow-[2px_2px_0px_0px_#000]'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-500 stroke-[2.5]" />
              Light Mode
            </button>

            <button
              type="button"
              onClick={() => {
                if (theme !== 'dark' && onToggleTheme) onToggleTheme();
              }}
              className={`py-2.5 px-3 rounded-xl font-black uppercase text-xs flex items-center justify-center gap-2 cursor-pointer transition-all border-2 border-black ${
                theme === 'dark'
                  ? 'bg-[#A855F7] text-white shadow-[2px_2px_0px_0px_#000]'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
              }`}
            >
              <Moon className="w-4 h-4 text-purple-200 stroke-[2.5]" />
              Dark Mode
            </button>
          </div>
        </div>

        {/* Vocabulary Management Section */}
        <div className="space-y-3 bg-[#FFE600]/20 dark:bg-slate-800/80 border-2 border-black dark:border-slate-700 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black font-display uppercase text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-700 dark:text-purple-400 stroke-[2.5]" />
              Vocabulary Management Tools
            </h3>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#A855F7] text-white border border-black">
              Content
            </span>
          </div>

          <p className="text-xs text-slate-800 dark:text-slate-200 font-bold">
            Paste custom word packs or update sentence context examples for your CAT VARC practice.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenImportModal) onOpenImportModal();
              }}
              className="py-2.5 px-3.5 rounded-xl bg-[#A855F7] hover:bg-[#9333EA] text-white font-black text-xs uppercase border-2 border-black flex items-center justify-center gap-2 cursor-pointer shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              Paste Word Pack
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenSentenceModal) onOpenSentenceModal();
              }}
              className="py-2.5 px-3.5 rounded-xl bg-white text-slate-900 font-black text-xs uppercase border-2 border-black flex items-center justify-center gap-2 cursor-pointer shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            >
              <FileText className="w-4 h-4 text-purple-600 stroke-[2.5]" />
              Update Sentences
            </button>
          </div>
        </div>

        {/* Adaptive Queue Engine */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black font-display uppercase text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
              Adaptive Queue Engine
            </h3>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#4ADE80] text-black border border-black">
              Active
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800 p-3 rounded-xl border-2 border-black dark:border-slate-700 text-xs font-bold">
            <div>
              <span className="text-black dark:text-slate-400 block text-[10px] font-black uppercase">System Status</span>
              <span className="font-black text-emerald-700 dark:text-emerald-400">Running smoothly</span>
            </div>
            <div>
              <span className="text-black dark:text-slate-400 block text-[10px] font-black uppercase">Loaded Vocabulary</span>
              <span className="font-black text-slate-900 dark:text-white">{vocabulary.length} words</span>
            </div>
          </div>
        </div>

        {/* Backup & Restore */}
        <div className="space-y-3 pt-3 border-t-2 border-black dark:border-slate-800">
          <h3 className="text-sm font-black font-display uppercase text-slate-900 dark:text-white">Backup & Data Recovery</h3>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDownloadBackup}
              className="flex-1 py-2.5 rounded-xl bg-[#4ADE80] hover:bg-[#22C55E] text-black font-black text-xs uppercase border-2 border-black flex items-center justify-center gap-2 cursor-pointer shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              Download Backup
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-black dark:text-white font-black text-xs uppercase border-2 border-black dark:border-white flex items-center justify-center gap-2 cursor-pointer shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#A855F7] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            >
              <Upload className="w-4 h-4 stroke-[2.5]" />
              Restore Backup
            </button>

            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleRestoreFile}
              className="hidden"
            />
          </div>

          <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl border-2 border-black dark:border-slate-700 text-xs grid grid-cols-2 gap-2 font-bold">
            <div>
              <span className="text-black dark:text-slate-400 block text-[10px] font-black uppercase">Last Backup</span>
              <span className="font-black text-slate-900 dark:text-white">
                {backupMeta ? new Date(backupMeta.exportedAt).toLocaleDateString() : 'Never'}
              </span>
            </div>
            <div>
              <span className="text-black dark:text-slate-400 block text-[10px] font-black uppercase">Schema Version</span>
              <span className="font-black text-slate-900 dark:text-white">1.0.0</span>
            </div>
          </div>
        </div>

        {statusMessage && (
          <p
            className={`p-3 rounded-xl text-xs border-2 font-black uppercase shadow-[2px_2px_0px_0px_#000] ${
              statusMessage.isError
                ? 'bg-[#FF6B6B] border-black text-black'
                : 'bg-[#4ADE80] border-black text-black'
            }`}
          >
            {statusMessage.text}
          </p>
        )}

        {/* Data Integrity Audit */}
        <div className="space-y-3 pt-3 border-t-2 border-black dark:border-slate-800">
          <h3 className="text-sm font-black font-display uppercase text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 stroke-[2.5]" />
            Data Integrity Verification
          </h3>

          <button
            type="button"
            onClick={handleVerifyIntegrity}
            className="w-full py-2.5 rounded-xl bg-[#FFE600] text-black font-black text-xs uppercase border-2 border-black cursor-pointer shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
          >
            Run Integrity Audit
          </button>

          {integrityReport && (
            <div className="bg-slate-50 dark:bg-slate-800 p-3.5 rounded-xl border-2 border-black dark:border-slate-700 text-xs space-y-2 font-bold">
              <div className="text-emerald-700 dark:text-emerald-400 font-black uppercase">
                ✔ Passed Checks ({integrityReport.passed.length})
              </div>
              <ul className="list-disc list-inside text-slate-800 dark:text-slate-200 space-y-1">
                {integrityReport.passed.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>

              {integrityReport.warnings.length > 0 && (
                <>
                  <div className="text-amber-700 dark:text-amber-400 font-black uppercase mt-2">
                    ⚠ Warnings ({integrityReport.warnings.length})
                  </div>
                  <ul className="list-disc list-inside text-slate-800 dark:text-slate-200 space-y-1">
                    {integrityReport.warnings.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </>
              )}

              {integrityReport.errors.length > 0 && (
                <>
                  <div className="text-rose-700 dark:text-rose-400 font-black uppercase mt-2">
                    ❌ Errors ({integrityReport.errors.length})
                  </div>
                  <ul className="list-disc list-inside text-rose-700 dark:text-rose-400 space-y-1">
                    {integrityReport.errors.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>

        <div className="pt-2 border-t-2 border-black dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black font-black text-xs uppercase cursor-pointer border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#A855F7] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
          >
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
};
