import React, { useState, useRef } from 'react';
import { StorageService } from '../services/storage';
import { FullBackup, IntegrityReport } from '../types';
import { TTSSettingsPanel } from './TTSSettingsPanel';
import { Download, Upload, ShieldCheck, Database, PlusCircle, FileText, Sparkles, Settings as SettingsIcon } from 'lucide-react';

interface SettingsViewProps {
  onRestoreComplete: () => void;
  onOpenImportModal: () => void;
  onOpenSentenceModal: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onRestoreComplete,
  onOpenImportModal,
  onOpenSentenceModal
}) => {
  const [integrityReport, setIntegrityReport] = useState<IntegrityReport | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    <div className="min-h-screen font-sans max-w-md mx-auto p-4 sm:p-6 pb-24 space-y-4 text-slate-900 dark:text-slate-100">
      {/* View Header */}
      <div className="bg-white dark:bg-slate-900 border-3 border-black dark:border-white rounded-2xl p-4 shadow-[5px_5px_0px_0px_#000] dark:shadow-[5px_5px_0px_0px_#A855F7]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFE600] border-2 border-black text-black flex items-center justify-center font-black">
            <SettingsIcon className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl font-black font-display text-slate-900 dark:text-white uppercase leading-tight">
              App Configuration
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-bold">
              Vocabulary & Audio Settings
            </p>
          </div>
        </div>
      </div>

      {/* Text-To-Speech Configuration Panel */}
      <TTSSettingsPanel />

      {/* Vocabulary Management Section */}
      <div className="space-y-3 bg-[#FFE600]/20 dark:bg-slate-800/80 border-2.5 border-black dark:border-slate-700 p-4 rounded-2xl shadow-[4px_4px_0px_0px_#000]">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black font-display uppercase text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-700 dark:text-purple-400 stroke-[2.5]" />
            Vocabulary Tools
          </h2>
          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#A855F7] text-white border border-black">
            Content
          </span>
        </div>

        <p className="text-xs text-slate-800 dark:text-slate-200 font-bold">
          Paste custom word packs or update sentence context examples for your CAT VARC practice.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            onClick={onOpenImportModal}
            className="py-2.5 px-3.5 rounded-xl bg-[#A855F7] hover:bg-[#9333EA] text-white font-black text-xs uppercase border-2 border-black flex items-center justify-center gap-2 cursor-pointer shadow-[2.5px_2.5px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            Paste Word Pack
          </button>

          <button
            type="button"
            onClick={onOpenSentenceModal}
            className="py-2.5 px-3.5 rounded-xl bg-white text-slate-900 font-black text-xs uppercase border-2 border-black flex items-center justify-center gap-2 cursor-pointer shadow-[2.5px_2.5px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
          >
            <FileText className="w-4 h-4 text-purple-600 stroke-[2.5]" />
            Update Sentences
          </button>
        </div>
      </div>

      {/* Adaptive Queue Engine */}
      <div className="bg-white dark:bg-slate-900 border-2.5 border-black dark:border-white rounded-2xl p-4 space-y-3 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#A855F7]">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black font-display uppercase text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
            Adaptive Queue Engine
          </h2>
          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#4ADE80] text-black border border-black">
            Active
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 bg-slate-100 dark:bg-slate-800 p-3 rounded-xl border-2 border-black dark:border-slate-700 text-xs font-bold">
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
      <div className="bg-white dark:bg-slate-900 border-2.5 border-black dark:border-white rounded-2xl p-4 space-y-3 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#A855F7]">
        <h2 className="text-sm font-black font-display uppercase text-slate-900 dark:text-white">Backup & Data Recovery</h2>

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
      <div className="bg-white dark:bg-slate-900 border-2.5 border-black dark:border-white rounded-2xl p-4 space-y-3 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#A855F7]">
        <h2 className="text-sm font-black font-display uppercase text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 stroke-[2.5]" />
          Data Integrity Verification
        </h2>

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
    </div>
  );
};
