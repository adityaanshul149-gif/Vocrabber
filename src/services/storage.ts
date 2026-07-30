import {
  VocabularyRecord,
  ProgressRecord,
  SessionData,
  SettingsData,
  FullBackup,
  IntegrityReport,
  LearningState
} from '../types';
import { DEFAULT_VOCABULARY, VALID_SECTORS } from '../data/defaultVocabulary';

const KEYS = {
  schema: 'voccrab.schemaVersion',
  application: 'voccrab.applicationVersion',
  vocabulary: 'voccrab.vocabulary',
  progress: 'voccrab.progress',
  session: 'voccrab.session',
  settings: 'voccrab.settings',
  lastBackup: 'voccrab.lastBackup'
};

const DEFAULT_SETTINGS: SettingsData = {
  theme: 'system',
  cooldownLength: 0,
  defaultPracticeMode: 'random',
  sectorPreferences: {
    enabled: [...VALID_SECTORS],
    order: [...VALID_SECTORS]
  },
  version: '1.5.0',
  dataSchemaVersion: '1.0.0',
  preferences: {},
  updatedAt: new Date().toISOString()
};

export class StorageService {
  private static read<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return null;
      return JSON.parse(raw) as T;
    } catch {
      console.warn(`[StorageService] Failed to read/parse key: ${key}`);
      return null;
    }
  }

  private static write<T>(key: string, value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`[StorageService] Failed to write key: ${key}`, e);
      return false;
    }
  }

  public static initialize(): void {
    if (!localStorage.getItem(KEYS.schema)) {
      this.write(KEYS.schema, '1.0.0');
    }
    this.write(KEYS.application, '1.5.0');

    if (!localStorage.getItem(KEYS.vocabulary)) {
      this.write(KEYS.vocabulary, DEFAULT_VOCABULARY);
    }
    if (!localStorage.getItem(KEYS.progress)) {
      this.write(KEYS.progress, []);
    }
    if (!localStorage.getItem(KEYS.settings)) {
      this.write(KEYS.settings, DEFAULT_SETTINGS);
    }
  }

  public static getVocabulary(): VocabularyRecord[] {
    const data = this.read<VocabularyRecord[]>(KEYS.vocabulary);
    if (!Array.isArray(data)) return DEFAULT_VOCABULARY;
    
    // Normalize visualAnchor to exampleUsage if needed
    return data.map(record => {
      if (!record.exampleUsage && (record as unknown as { visualAnchor?: string }).visualAnchor) {
        record.exampleUsage = (record as unknown as { visualAnchor: string }).visualAnchor;
      }
      return record;
    });
  }

  public static setVocabulary(records: VocabularyRecord[]): boolean {
    return this.write(KEYS.vocabulary, records);
  }

  public static getProgress(): ProgressRecord[] {
    const data = this.read<ProgressRecord[]>(KEYS.progress);
    return Array.isArray(data) ? data : [];
  }

  public static setProgress(records: ProgressRecord[]): boolean {
    return this.write(KEYS.progress, records);
  }

  public static getSession(): SessionData | null {
    return this.read<SessionData>(KEYS.session);
  }

  public static setSession(session: SessionData | null): boolean {
    return this.write(KEYS.session, session);
  }

  public static getSettings(): SettingsData {
    const data = this.read<SettingsData>(KEYS.settings);
    return data || DEFAULT_SETTINGS;
  }

  public static setSettings(settings: SettingsData): boolean {
    return this.write(KEYS.settings, settings);
  }

  public static getLastBackupMetadata(): { exportedAt: string; size: number } | null {
    return this.read<{ exportedAt: string; size: number }>(KEYS.lastBackup);
  }

  public static createProgressRecord(vocabularyId: string): ProgressRecord {
    return {
      vocabularyId,
      attempts: 0,
      correct: 0,
      accuracy: 0,
      history: [],
      consecutiveCorrect: 0,
      lastReviewed: null,
      lastAppeared: null,
      cooldownUntil: null,
      queueScore: 0,
      bookmark: false,
      mastered: false,
      weak: false,
      encounterCount: 0,
      overdueSince: null,
      lastSectorServed: null,
      queueMetadata: {},
      updatedAt: new Date().toISOString()
    };
  }

  public static getLearningState(progress: ProgressRecord | null): LearningState {
    if (!progress || progress.attempts === 0) return 'Never Practiced';
    const stored = progress.queueMetadata?.learningState;
    if (stored && ['Never Practiced', 'Learning', 'Needs Work', 'Mastered'].includes(stored)) {
      return stored as LearningState;
    }
    if (progress.mastered) return 'Mastered';
    if (progress.weak || progress.accuracy < 0.5) return 'Needs Work';
    return 'Learning';
  }

  public static recordReview(vocabularyId: string, wasCorrect: boolean, sector: string): ProgressRecord {
    const progressList = this.getProgress();
    const map = new Map(progressList.map(p => [p.vocabularyId, p]));
    const record = map.get(vocabularyId) || this.createProgressRecord(vocabularyId);

    const prevAttempts = record.attempts;
    record.attempts += 1;
    if (wasCorrect) record.correct += 1;
    record.accuracy = record.attempts > 0 ? record.correct / record.attempts : 0;
    record.consecutiveCorrect = wasCorrect ? record.consecutiveCorrect + 1 : 0;
    const now = new Date().toISOString();
    record.lastReviewed = now;
    record.lastAppeared = now;
    record.encounterCount = (record.encounterCount || 0) + 1;
    record.lastSectorServed = sector;

    record.history = [
      ...(record.history || []),
      {
        reviewedAt: now,
        wasCorrect,
        practiceMode: 'adaptive-practice',
        sessionId: this.getSession()?.sessionId || 'session'
      }
    ];

    const state: LearningState = wasCorrect
      ? (prevAttempts === 0 || record.consecutiveCorrect >= 2 ? 'Mastered' : 'Learning')
      : 'Needs Work';

    record.queueMetadata = { ...(record.queueMetadata || {}), learningState: state };
    record.mastered = state === 'Mastered';
    record.weak = state === 'Needs Work';
    record.updatedAt = now;

    map.set(vocabularyId, record);
    this.setProgress(Array.from(map.values()));
    return record;
  }

  public static createFullBackup(): FullBackup {
    const vocabulary = this.getVocabulary();
    const progress = this.getProgress();
    const session = this.getSession();
    const settings = this.getSettings();

    const backup: FullBackup = {
      backupType: 'voccrab-full-backup',
      appVersion: '1.5.0',
      schemaVersion: '1.0.0',
      exportedAt: new Date().toISOString(),
      totalWords: vocabulary.length,
      vocabulary,
      progress,
      session,
      settings
    };

    this.write(KEYS.lastBackup, {
      exportedAt: backup.exportedAt,
      size: JSON.stringify(backup).length
    });

    return backup;
  }

  public static restoreBackup(backup: FullBackup): { success: boolean; error?: string } {
    if (!backup || backup.backupType !== 'voccrab-full-backup') {
      return { success: false, error: 'Invalid backup file format.' };
    }
    if (!Array.isArray(backup.vocabulary) || !Array.isArray(backup.progress)) {
      return { success: false, error: 'Backup contains corrupt vocabulary or progress lists.' };
    }

    try {
      this.setVocabulary(backup.vocabulary);
      this.setProgress(backup.progress);
      if (backup.session) this.setSession(backup.session);
      if (backup.settings) this.setSettings(backup.settings);
      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  public static verifyIntegrity(): IntegrityReport {
    const report: IntegrityReport = { passed: [], warnings: [], errors: [] };
    const vocab = this.getVocabulary();
    const progress = this.getProgress();
    const session = this.getSession();

    if (vocab.length > 0) {
      report.passed.push(`Vocabulary database contains ${vocab.length} valid record(s).`);
    } else {
      report.warnings.push('Vocabulary database is empty.');
    }

    const vocabIds = new Set<string>();
    vocab.forEach(record => {
      if (!record.id || !/^VOC\d{6,}$/.test(record.id)) {
        report.errors.push(`Invalid record ID: ${record.id}`);
      }
      if (vocabIds.has(record.id)) {
        report.errors.push(`Duplicate ID found: ${record.id}`);
      }
      vocabIds.add(record.id);

      if (!record.sentences || record.sentences.length !== 6) {
        report.errors.push(`Word ${record.id} (${record.word}) does not have 6 sentences.`);
      }
    });

    progress.forEach(p => {
      if (!vocabIds.has(p.vocabularyId)) {
        report.errors.push(`Orphan progress record found for ID: ${p.vocabularyId}`);
      }
      if (p.attempts < 0 || p.correct < 0 || p.correct > p.attempts) {
        report.errors.push(`Invalid attempt stats for ID: ${p.vocabularyId}`);
      }
    });

    if (session && session.currentWordId && !vocabIds.has(session.currentWordId)) {
      report.errors.push(`Session refers to non-existent word ID: ${session.currentWordId}`);
    }

    if (report.errors.length === 0) {
      report.passed.push('All IDs, sentence structures, and progress pointers passed verification.');
    }

    return report;
  }
}
