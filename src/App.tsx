import React, { useState, useEffect, useCallback } from 'react';
import {
  VocabularyRecord,
  ProgressRecord,
  SessionData,
  PracticeMode,
  TabName
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
import { LibraryView } from './components/LibraryView';
import { AnalyticsView } from './components/AnalyticsView';
import { SectorAnalyticsView } from './components/SectorAnalyticsView';
import { SettingsModal } from './components/SettingsModal';
import { PlusCircle, FileText } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabName>('home');
  const [vocabulary, setVocabulary] = useState<VocabularyRecord[]>([]);
  const [progress, setProgress] = useState<ProgressRecord[]>([]);
  const [session, setSession] = useState<SessionData | null>(null);

  // Practice state
  const [isPracticeActive, setIsPracticeActive] = useState(false);
  const [practiceMode, setPracticeMode] = useState<PracticeMode>('random');
  const [selectedPracticeSectors, setSelectedPracticeSectors] = useState<Set<string>>(new Set());
  const [currentWord, setCurrentWord] = useState<VocabularyRecord | null>(null);
  const [activeQueue, setActiveQueue] = useState<VocabularyRecord[]>([]);

  // Modals
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isSentenceModalOpen, setIsSentenceModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Refresh local data state
  const reloadData = useCallback(() => {
    StorageService.initialize();
    setVocabulary(StorageService.getVocabulary());
    setProgress(StorageService.getProgress());
    setSession(StorageService.getSession());
  }, []);

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  // Tab change handler
  const handleTabChange = (tab: TabName) => {
    if (isPracticeActive) {
      if (
        !window.confirm(
          'Leave practice session? Your current progress in this session will be saved.'
        )
      ) {
        return;
      }
      setIsPracticeActive(false);
    }

    if (tab === 'import') {
      setIsImportModalOpen(true);
      return;
    }
    if (tab === 'settings') {
      setIsSettingsModalOpen(true);
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
    const queue = QueueService.buildQueue(targetWords);

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
  };

  // Start practice session
  const handleStartPracticeSession = (mode: PracticeMode, sectors: Set<string>) => {
    setPracticeMode(mode);
    setSelectedPracticeSectors(sectors);
    setIsConfigModalOpen(false);

    const eligible = QueueService.getEligibleWords(mode, sectors);
    const queue = QueueService.buildQueue(eligible);

    if (queue.length === 0) {
      alert('No eligible words found for the selected mode and sectors.');
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
  };

  // Record answer review
  const handleAnswerSubmit = (word: VocabularyRecord, isCorrect: boolean) => {
    StorageService.recordReview(word.id, isCorrect, word.sector);

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
    setProgress(StorageService.getProgress());
    setSession(sess);
  };

  // Next word in queue
  const handleNextWord = () => {
    let nextQueue = [...activeQueue];
    if (nextQueue.length === 0) {
      // Rebuild queue if empty
      const eligible = QueueService.getEligibleWords(practiceMode, selectedPracticeSectors);
      nextQueue = QueueService.buildQueue(eligible, currentWord?.id);
    }

    if (nextQueue.length === 0) {
      alert('All words in queue completed!');
      setIsPracticeActive(false);
      return;
    }

    const nextWord = nextQueue[0];
    setCurrentWord(nextWord);
    setActiveQueue(nextQueue.slice(1));
  };

  // End practice session
  const handleEndPractice = () => {
    setIsPracticeActive(false);
    setActiveTab('home');
  };

  // Calculated summary statistics
  const masteredCount = vocabulary.filter(
    v => StorageService.getLearningState(progress.find(p => p.vocabularyId === v.id) || null) === 'Mastered'
  ).length;

  const needsWorkCount = vocabulary.filter(
    v => StorageService.getLearningState(progress.find(p => p.vocabularyId === v.id) || null) === 'Needs Work'
  ).length;

  let totalAttempts = 0;
  let totalCorrect = 0;
  progress.forEach(p => {
    totalAttempts += p.attempts || 0;
    totalCorrect += p.correct || 0;
  });
  const accuracyPercent = totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#F6F5FB] text-[#1E1B2E] flex flex-col font-sans selection:bg-[#7C3AED] selection:text-white">
      {!isPracticeActive && <Header />}

      <main className={`flex-1 w-full mx-auto ${isPracticeActive ? 'p-0' : 'max-w-md px-4 py-5 pb-28'}`}>
        {isPracticeActive && currentWord ? (
          <PracticeScreen
            currentWord={currentWord}
            modeTitle={
              practiceMode === 'weak'
                ? 'Weak Words'
                : practiceMode === 'less'
                ? 'Less Attempted'
                : 'Random Practice'
            }
            onAnswerSubmit={handleAnswerSubmit}
            onNextWord={handleNextWord}
            onEndPractice={handleEndPractice}
          />
        ) : (
          <>
            {/* Active Tab View */}
            {activeTab === 'home' && (
              <HomeView
                vocabularyCount={vocabulary.length}
                masteredCount={masteredCount}
                needsWorkCount={needsWorkCount}
                accuracyPercent={accuracyPercent}
                onOpenPracticeConfig={handleOpenPracticeConfig}
              />
            )}

            {activeTab === 'library' && (
              <LibraryView
                vocabulary={vocabulary}
                progress={progress}
                onDataChanged={reloadData}
                onPracticeSelectedWords={handleStartCustomPractice}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsView
                vocabulary={vocabulary}
                progress={progress}
                session={session}
              />
            )}

            {activeTab === 'sector' && (
              <SectorAnalyticsView
                vocabulary={vocabulary}
                progress={progress}
                onDataChanged={reloadData}
              />
            )}
          </>
        )}
      </main>

      {/* Navigation Bar - Hidden during practice mode for immersive full screen */}
      {!isPracticeActive && <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />}

      {/* Modals */}
      <PracticeConfigModal
        isOpen={isConfigModalOpen}
        mode={practiceMode}
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

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onRestoreComplete={reloadData}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onOpenSentenceModal={() => setIsSentenceModalOpen(true)}
      />
    </div>
  );
}
