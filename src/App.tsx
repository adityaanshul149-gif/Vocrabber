import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  VocabularyRecord,
  ProgressRecord,
  SessionData,
  PracticeMode,
  TabName,
  AppLevel
} from './types';
import { StorageService } from './services/storage';
import { QueueService } from './services/queue';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeView } from './components/HomeView';
import { PracticeConfigModal } from './components/PracticeConfigModal';
import { PracticeScreen } from './components/PracticeScreen';
import { ImportModal } from './components/ImportModal';
import { SentencePackModal } from './components/SentencePackModal';
import { Level2PackModal } from './components/Level2PackModal';
import { LibraryView } from './components/LibraryView';
import { AnalyticsView } from './components/AnalyticsView';
import { SectorAnalyticsView } from './components/SectorAnalyticsView';
import { SettingsView } from './components/SettingsView';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabName>(() => {
    const saved = localStorage.getItem('voccrab_active_tab') as TabName;
    return (saved && ['home', 'library', 'analytics', 'sector', 'settings'].includes(saved)) ? saved : 'home';
  });

  useEffect(() => {
    localStorage.setItem('voccrab_active_tab', activeTab);
  }, [activeTab]);

  const [vocabulary, setVocabulary] = useState<VocabularyRecord[]>([]);
  const [progress, setProgress] = useState<ProgressRecord[]>([]);
  const [session, setSession] = useState<SessionData | null>(null);

  // Active App Level ('lvl1' | 'lvl2')
  const [appLevel, setAppLevel] = useState<AppLevel>(() => {
    const saved = localStorage.getItem('voccrab_appLevel');
    return saved === 'lvl2' ? 'lvl2' : 'lvl1';
  });

  const handleToggleLevel = (level: AppLevel) => {
    setAppLevel(level);
    localStorage.setItem('voccrab_appLevel', level);
  };

  // Theme state ('light' | 'dark')
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('voccrab_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark' || appLevel === 'lvl2') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('voccrab_theme', theme);
  }, [theme, appLevel]);

  // Practice state
  const [isPracticeActive, setIsPracticeActive] = useState<boolean>(() => {
    return localStorage.getItem('voccrab_practice_active') === 'true';
  });
  const [practiceMode, setPracticeMode] = useState<PracticeMode>(() => {
    const saved = localStorage.getItem('voccrab_practice_mode') as PracticeMode;
    return saved || 'random';
  });
  const [selectedPracticeSectors, setSelectedPracticeSectors] = useState<Set<string>>(new Set());
  const [currentWord, setCurrentWord] = useState<VocabularyRecord | null>(null);
  const [activeQueue, setActiveQueue] = useState<VocabularyRecord[]>([]);

  // Modals
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isSentenceModalOpen, setIsSentenceModalOpen] = useState(false);
  const [isLevel2ModalOpen, setIsLevel2ModalOpen] = useState(false);

  // Refresh local data state
  const reloadData = useCallback(() => {
    StorageService.initialize();
    const voc = StorageService.getVocabulary();
    const prog = StorageService.getProgress(appLevel);
    const sess = StorageService.getSession();
    setVocabulary(voc);
    setProgress(prog);
    setSession(sess);

    // Restore active practice session state if preserved
    const savedActive = localStorage.getItem('voccrab_practice_active') === 'true';
    if (savedActive && voc.length > 0) {
      const savedWordId = localStorage.getItem('voccrab_current_word_id') || sess?.currentWordId;
      const targetWord = savedWordId ? voc.find(v => v.id === savedWordId) : null;
      if (targetWord) {
        setCurrentWord(targetWord);
        setIsPracticeActive(true);
        if (sess?.remainingQueue && sess.remainingQueue.length > 0) {
          const queueWords = voc.filter(v => sess.remainingQueue.includes(v.id));
          setActiveQueue(queueWords);
        }
      }
    }
  }, [appLevel]);

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  // Save background visibility state
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        if (isPracticeActive && currentWord) {
          localStorage.setItem('voccrab_practice_active', 'true');
          localStorage.setItem('voccrab_current_word_id', currentWord.id);
          localStorage.setItem('voccrab_practice_mode', practiceMode);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isPracticeActive, currentWord, practiceMode]);

  // Tab change handler (preserves practice session without wiping memory)
  const handleTabChange = (tab: TabName) => {
    if (tab === 'import') {
      setIsImportModalOpen(true);
      return;
    }
    setActiveTab(tab);
  };

  // Open config modal
  const handleOpenPracticeConfig = (mode: PracticeMode) => {
    setPracticeMode(mode);
    setIsConfigModalOpen(true);
  };

  // Start practice session for custom word selection
  const handleStartCustomPractice = (wordIds: string[]) => {
    if (!wordIds || wordIds.length === 0) return;
    const targetWords = vocabulary.filter(v => wordIds.includes(v.id));
    if (targetWords.length === 0) return;

    setPracticeMode('random');
    localStorage.setItem('voccrab_practice_mode', 'random');
    const queue = QueueService.buildQueue(targetWords, undefined, appLevel);

    const newSessionData: SessionData = {
      sessionId: `SESSION-${Date.now()}`,
      startedAt: new Date().toISOString(),
      currentPracticeMode: 'selected-words',
      currentQueue: queue.map(w => w.id),
      remainingQueue: queue.slice(1).map(w => w.id),
      reviewedCount: 0,
      correctCount: 0,
      wrongCount: 0,
      currentSectorFilter: null,
      elapsedTimeMs: 0,
      currentWordId: queue[0].id,
      sessionStatistics: { recentActivity: [] },
      updatedAt: new Date().toISOString()
    };
    StorageService.setSession(newSessionData);
    setSession(newSessionData);

    setActiveQueue(queue.slice(1));
    setCurrentWord(queue[0]);
    setIsPracticeActive(true);
    setActiveTab('home');

    localStorage.setItem('voccrab_practice_active', 'true');
    localStorage.setItem('voccrab_current_word_id', queue[0].id);
  };

  // Start practice session
  const handleStartPracticeSession = (mode: PracticeMode, sectors: Set<string>) => {
    setPracticeMode(mode);
    localStorage.setItem('voccrab_practice_mode', mode);
    setSelectedPracticeSectors(sectors);
    setIsConfigModalOpen(false);

    const eligible = QueueService.getEligibleWords(mode, sectors, appLevel);
    const queue = QueueService.buildQueue(eligible, undefined, appLevel);

    if (queue.length === 0) {
      alert(`No eligible words found for Level ${appLevel === 'lvl2' ? 'II' : 'I'} with selected filters.${appLevel === 'lvl2' ? ' (Note: Level II requires words to be Mastered in Level I or have Level II distractors).' : ''}`);
      return;
    }

    // Start fresh session data
    const newSessionData: SessionData = {
      sessionId: `SESSION-${Date.now()}`,
      startedAt: new Date().toISOString(),
      currentPracticeMode: mode,
      currentQueue: queue.map(w => w.id),
      remainingQueue: queue.slice(1).map(w => w.id),
      reviewedCount: 0,
      correctCount: 0,
      wrongCount: 0,
      currentSectorFilter: null,
      elapsedTimeMs: 0,
      currentWordId: queue[0].id,
      sessionStatistics: { recentActivity: [] },
      updatedAt: new Date().toISOString()
    };
    StorageService.setSession(newSessionData);
    setSession(newSessionData);

    setActiveQueue(queue.slice(1));
    setCurrentWord(queue[0]);
    setIsPracticeActive(true);
    setActiveTab('home');

    localStorage.setItem('voccrab_practice_active', 'true');
    localStorage.setItem('voccrab_current_word_id', queue[0].id);
  };

  // Record answer review
  const handleAnswerSubmit = (word: VocabularyRecord, isCorrect: boolean) => {
    StorageService.recordReview(word.id, isCorrect, word.sector, appLevel);

    // Update active session stats
    const sess = StorageService.getSession() || {
      sessionId: `SESSION-${Date.now()}`,
      startedAt: new Date().toISOString(),
      currentPracticeMode: practiceMode,
      currentQueue: [],
      remainingQueue: [],
      reviewedCount: 0,
      correctCount: 0,
      wrongCount: 0,
      currentSectorFilter: null,
      elapsedTimeMs: 0,
      currentWordId: word.id,
      sessionStatistics: { recentActivity: [] },
      updatedAt: new Date().toISOString()
    };

    sess.reviewedCount += 1;
    if (isCorrect) sess.correctCount += 1;
    else sess.wrongCount += 1;
    sess.currentWordId = word.id;

    sess.sessionStatistics.recentActivity = [
      {
        vocabularyId: word.id,
        word: word.word,
        wasCorrect: isCorrect,
        reviewedAt: new Date().toISOString()
      },
      ...(sess.sessionStatistics.recentActivity || [])
    ].slice(0, 10);

    StorageService.setSession(sess);

    // Update state
    setProgress(StorageService.getProgress(appLevel));
    setSession(sess);
  };

  // Next word in queue
  const handleNextWord = () => {
    let nextQueue = [...activeQueue];
    if (nextQueue.length === 0) {
      // Rebuild queue if empty
      const eligible = QueueService.getEligibleWords(practiceMode, selectedPracticeSectors, appLevel);
      nextQueue = QueueService.buildQueue(eligible, currentWord?.id, appLevel);
    }

    if (nextQueue.length === 0) {
      alert('All words in queue completed!');
      setIsPracticeActive(false);
      localStorage.removeItem('voccrab_practice_active');
      localStorage.removeItem('voccrab_current_word_id');
      return;
    }

    const nextWord = nextQueue[0];
    setCurrentWord(nextWord);
    setActiveQueue(nextQueue.slice(1));

    localStorage.setItem('voccrab_current_word_id', nextWord.id);
    if (session) {
      const updatedSess = {
        ...session,
        currentWordId: nextWord.id,
        remainingQueue: nextQueue.slice(1).map(w => w.id),
        updatedAt: new Date().toISOString()
      };
      StorageService.setSession(updatedSess);
      setSession(updatedSess);
    }
  };

  // End practice session
  const handleEndPractice = () => {
    setIsPracticeActive(false);
    localStorage.removeItem('voccrab_practice_active');
    localStorage.removeItem('voccrab_current_word_id');
    setActiveTab('home');
  };

  // Active Vocabulary deck based on App Level
  const activeLevelVocabulary = useMemo(() => {
    if (appLevel === 'lvl2') {
      const lvl1ProgressMap = new Map(StorageService.getProgress('lvl1').map(p => [p.vocabularyId, p]));
      return vocabulary.filter(v => {
        const p1 = lvl1ProgressMap.get(v.id) || null;
        return StorageService.getLearningState(p1) === 'Mastered';
      });
    }
    return vocabulary;
  }, [vocabulary, progress, appLevel]);

  const vocabularyCount = activeLevelVocabulary.length;

  const progressMap = useMemo(() => new Map(progress.map(p => [p.vocabularyId, p])), [progress]);

  const masteredCount = activeLevelVocabulary.filter(
    v => StorageService.getLearningState(progressMap.get(v.id) || null) === 'Mastered'
  ).length;

  const needsWorkCount = activeLevelVocabulary.filter(
    v => StorageService.getLearningState(progressMap.get(v.id) || null) === 'Needs Work'
  ).length;

  let totalPoints = 0;
  let practicedWordsCount = 0;
  activeLevelVocabulary.forEach(v => {
    const p = progressMap.get(v.id);
    if (p && p.attempts > 0) {
      practicedWordsCount += 1;
      totalPoints += StorageService.getWordScore(p);
    }
  });
  const averageScore = practicedWordsCount > 0 ? totalPoints / practicedWordsCount : 0;

  const isLvl2 = appLevel === 'lvl2';
  const showPracticeScreen = isPracticeActive && currentWord && activeTab === 'home';

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-[#7C3AED] selection:text-white transition-colors ${
      isLvl2 ? 'bg-[#0B0F19] text-slate-100' : 'bg-[#F6F5FB] dark:bg-slate-950 text-[#1E1B2E] dark:text-slate-100'
    }`}>
      {!showPracticeScreen && (
        <Header
          appLevel={appLevel}
          onToggleLevel={handleToggleLevel}
          theme={theme}
        />
      )}

      <main className={`flex-1 w-full mx-auto ${showPracticeScreen ? 'p-0' : 'max-w-md px-4 py-5 pb-28'}`}>
        {showPracticeScreen ? (
          <PracticeScreen
            currentWord={currentWord}
            modeTitle={
              practiceMode === 'weak'
                ? 'Weak Words'
                : practiceMode === 'less'
                ? 'Less Attempted'
                : 'Random Practice'
            }
            appLevel={appLevel}
            allVocabulary={vocabulary}
            onAnswerSubmit={handleAnswerSubmit}
            onNextWord={handleNextWord}
            onEndPractice={handleEndPractice}
          />
        ) : (
          <>
            {/* Active Tab View */}
            {activeTab === 'home' && (
              <HomeView
                vocabularyCount={vocabularyCount}
                masteredCount={masteredCount}
                needsWorkCount={needsWorkCount}
                totalPoints={totalPoints}
                averageScore={averageScore}
                appLevel={appLevel}
                onOpenPracticeConfig={handleOpenPracticeConfig}
              />
            )}

            {activeTab === 'library' && (
              <LibraryView
                vocabulary={vocabulary}
                progress={progress}
                appLevel={appLevel}
                onDataChanged={reloadData}
                onPracticeSelectedWords={handleStartCustomPractice}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsView
                vocabulary={vocabulary}
                progress={progress}
                session={session}
                appLevel={appLevel}
              />
            )}

            {activeTab === 'sector' && (
              <SectorAnalyticsView
                vocabulary={vocabulary}
                progress={progress}
                appLevel={appLevel}
                onDataChanged={reloadData}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                onRestoreComplete={reloadData}
                onOpenImportModal={() => setIsImportModalOpen(true)}
                onOpenSentenceModal={() => setIsSentenceModalOpen(true)}
              />
            )}
          </>
        )}
      </main>

      {/* Navigation Bar - Hidden during practice mode screen for immersive practice */}
      {!showPracticeScreen && <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />}

      {/* Modals */}
      <PracticeConfigModal
        isOpen={isConfigModalOpen}
        mode={practiceMode}
        appLevel={appLevel}
        onClose={() => setIsConfigModalOpen(false)}
        onStart={handleStartPracticeSession}
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportComplete={reloadData}
      />

      <SentencePackModal
        isOpen={isSentenceModalOpen}
        onClose={() => setIsSentenceModalOpen(false)}
        onUpdateComplete={reloadData}
      />

      <Level2PackModal
        isOpen={isLevel2ModalOpen}
        onClose={() => setIsLevel2ModalOpen(false)}
        onUpdateComplete={reloadData}
      />
    </div>
  );
}

