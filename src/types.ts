export type AppLevel = 'lvl1' | 'lvl2';

export interface Sentence {
  text: string;
  correct: boolean;
}

export type SectorName =
  | 'Psychology'
  | 'Philosophy'
  | 'Economics'
  | 'Politics'
  | 'History'
  | 'Science'
  | 'Sociology'
  | 'Anthropology'
  | 'Environment'
  | 'Technology'
  | 'Research'
  | 'Linguistics'
  | 'Literature'
  | 'Ethics'
  | 'Evolution'
  | 'General';

export interface VocabularyRecord {
  id: string;
  word: string;
  sector: SectorName | string;
  definition: string;
  exampleUsage: string;
  sentences: Sentence[];
  phonetic?: string;
  level2Distractors?: string[];
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'archived';
}

export type LearningState = 'Never Practiced' | 'Learning' | 'Needs Work' | 'Mastered';

export interface ReviewHistoryItem {
  reviewedAt: string;
  wasCorrect: boolean;
  practiceMode: string;
  sessionId: string;
}

export interface ProgressRecord {
  vocabularyId: string;
  attempts: number;
  correct: number;
  accuracy: number;
  score: number;
  history: ReviewHistoryItem[];
  consecutiveCorrect: number;
  lastReviewed: string | null;
  lastAppeared: string | null;
  cooldownUntil: string | null;
  queueScore: number;
  bookmark: boolean;
  mastered: boolean;
  weak: boolean;
  encounterCount: number;
  overdueSince: string | null;
  lastSectorServed: string | null;
  queueMetadata: {
    learningState?: LearningState;
  };
  updatedAt: string;
}

export interface SessionActivityItem {
  vocabularyId: string;
  word: string;
  wasCorrect: boolean;
  reviewedAt: string;
}

export interface SessionData {
  sessionId: string;
  startedAt: string;
  currentPracticeMode: string;
  currentQueue: string[];
  remainingQueue: string[];
  reviewedCount: number;
  correctCount: number;
  wrongCount: number;
  currentSectorFilter: string | null;
  elapsedTimeMs: number;
  currentWordId: string | null;
  sessionStatistics: {
    recentActivity: SessionActivityItem[];
  };
  updatedAt: string;
}

export interface SettingsData {
  theme: string;
  cooldownLength: number;
  defaultPracticeMode: string;
  sectorPreferences: {
    enabled: string[];
    order: string[];
  };
  version: string;
  dataSchemaVersion: string;
  preferences: Record<string, unknown>;
  updatedAt: string;
}

export interface FullBackup {
  backupType: 'voccrab-full-backup';
  appVersion: string;
  schemaVersion: string;
  exportedAt: string;
  totalWords: number;
  vocabulary: VocabularyRecord[];
  progress: ProgressRecord[];
  session: SessionData | null;
  settings: SettingsData;
}

export interface IntegrityReport {
  passed: string[];
  warnings: string[];
  errors: string[];
}

export type PracticeMode = 'random' | 'weak' | 'less';
export type TabName = 'home' | 'import' | 'library' | 'analytics' | 'sector' | 'settings';
