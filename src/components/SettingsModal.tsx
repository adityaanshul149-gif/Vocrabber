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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-purple-100 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto font-sans">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300 flex items-center justify-center font-bold">
              ⚙️
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">App Settings</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Vocabulary & System Configuration</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Appearance Theme Selector */}
        <div className="space-y-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {theme === 'dark' ? <Moon className="w-4 h-4 text-purple-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
              Appearance Theme
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/80 text-purple-800 dark:text-purple-200">
              {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300">
            Switch theme for comfortable viewing on mobile and desktop screens.
          </p>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                if (theme !== 'light' && onToggleTheme) onToggleTheme();
              }}
              className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                theme === 'light'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-400" />
              Light Mode
            </button>

            <button
              type="button"
              onClick={() => {
                if (theme !== 'dark' && onToggleTheme) onToggleTheme();
              }}
              className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                theme === 'dark'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Moon className="w-4 h-4 text-purple-400" />
              Dark Mode
            </button>
          </div>
        </div>

        {/* Vocabulary Management Section */}
        <div className="space-y-3 bg-purple-50/60 border border-purple-100 p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              Vocabulary Management Tools
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-200/80 text-purple-800">
              Content Tools
            </span>
          </div>

          <p className="text-xs text-slate-600">
            Paste custom word packs or update sentence context examples for your CAT VARC practice.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenImportModal) onOpenImportModal();
              }}
              className="py-2.5 px-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-purple-500/20 active:scale-95 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              Paste Vocabulary Pack
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenSentenceModal) onOpenSentenceModal();
              }}
              className="py-2.5 px-3.5 rounded-xl bg-white hover:bg-purple-50 text-slate-800 font-bold text-xs border border-purple-200 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
            >
              <FileText className="w-4 h-4 text-purple-600" />
              Update Sentence Pack
            </button>
          </div>
        </div>

        {/* Adaptive Queue Engine */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              Adaptive Queue Engine
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
              Active
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">System Status</span>
              <span className="font-bold text-emerald-600">Running smoothly</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Loaded Vocabulary</span>
              <span className="font-bold text-slate-900">{vocabulary.length} words</span>
            </div>
          </div>
        </div>

        {/* Backup & Restore */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Backup & Data Recovery</h3>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDownloadBackup}
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95 transition-all"
            >
              <Download className="w-4 h-4" />
              Download Backup
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer border border-slate-200 active:scale-95 transition-all"
            >
              <Upload className="w-4 h-4" />
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

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs grid grid-cols-2 gap-2">
            <div>
              <span className="text-slate-500 block text-[11px]">Last Backup</span>
              <span className="font-bold text-slate-700">
                {backupMeta ? new Date(backupMeta.exportedAt).toLocaleDateString() : 'Never'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Schema Version</span>
              <span className="font-bold text-slate-700">1.0.0</span>
            </div>
          </div>
        </div>

        {statusMessage && (
          <p
            className={`p-3 rounded-xl text-xs border font-medium ${
              statusMessage.isError
                ? 'bg-rose-50 border-rose-200 text-rose-700'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}
          >
            {statusMessage.text}
          </p>
        )}

        {/* Data Integrity Audit */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            Data Integrity Verification
          </h3>

          <button
            type="button"
            onClick={handleVerifyIntegrity}
            className="w-full py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs border border-purple-200 cursor-pointer active:scale-95 transition-all"
          >
            Run Integrity Audit
          </button>

          {integrityReport && (
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-2">
              <div className="text-emerald-600 font-bold">
                ✔ Passed Checks ({integrityReport.passed.length})
              </div>
              <ul className="list-disc list-inside text-slate-600 space-y-1">
                {integrityReport.passed.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>

              {integrityReport.warnings.length > 0 && (
                <>
                  <div className="text-amber-600 font-bold mt-2">
                    ⚠ Warnings ({integrityReport.warnings.length})
                  </div>
                  <ul className="list-disc list-inside text-slate-600 space-y-1">
                    {integrityReport.warnings.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </>
              )}

              {integrityReport.errors.length > 0 && (
                <>
                  <div className="text-rose-600 font-bold mt-2">
                    ❌ Errors ({integrityReport.errors.length})
                  </div>
                  <ul className="list-disc list-inside text-rose-600 space-y-1">
                    {integrityReport.errors.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer active:scale-95 transition-all"
          >
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
};
