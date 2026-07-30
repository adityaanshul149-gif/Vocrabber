import { VocabularyRecord, ProgressRecord, PracticeMode } from '../types';
import { StorageService } from './storage';

export class QueueService {
  private static calculatePriority(progress: ProgressRecord | null): number {
    if (!progress) return 30; // High priority for unpracticed words

    const attempts = progress.attempts || 0;
    const accuracy = progress.accuracy || 0;
    const state = StorageService.getLearningState(progress);

    const recent = progress.history?.length ? progress.history[progress.history.length - 1] : null;
    const recentlyWrong = recent && !recent.wasCorrect ? 8 : 0;
    const recentlyCorrect = recent && recent.wasCorrect ? -4 : 0;

    let stateWeight = 20;
    if (state === 'Needs Work') stateWeight = 35;
    else if (state === 'Learning') stateWeight = 25;
    else if (state === 'Mastered') stateWeight = 5;

    const unpracticedBonus = attempts === 0 ? 20 : 0;

    return Math.max(
      1,
      10 +
        stateWeight +
        unpracticedBonus +
        (1 - accuracy) * 15 +
        Math.max(0, 10 - attempts) +
        recentlyWrong +
        recentlyCorrect
    );
  }

  public static getEligibleWords(
    mode: PracticeMode,
    selectedSectors?: Set<string>
  ): VocabularyRecord[] {
    const vocab = StorageService.getVocabulary();
    const progressMap = new Map(StorageService.getProgress().map(p => [p.vocabularyId, p]));

    return vocab.filter(word => {
      if (selectedSectors && selectedSectors.size > 0 && !selectedSectors.has(word.sector)) {
        return false;
      }

      const p = progressMap.get(word.id) || null;
      const state = StorageService.getLearningState(p);

      if (mode === 'weak') {
        return state === 'Needs Work' || (p !== null && p.attempts > 0 && p.accuracy < 0.5);
      }
      if (mode === 'less') {
        return !p || p.attempts <= 1;
      }

      return true; // Random mode includes all
    });
  }

  public static buildQueue(
    eligibleWords: VocabularyRecord[],
    excludedWordId?: string
  ): VocabularyRecord[] {
    const progressMap = new Map(StorageService.getProgress().map(p => [p.vocabularyId, p]));
    const candidates = eligibleWords.filter(w => w.id !== excludedWordId);

    if (candidates.length === 0) return [];

    const weighted = candidates.map(word => ({
      word,
      weight: this.calculatePriority(progressMap.get(word.id) || null)
    }));

    const queue: VocabularyRecord[] = [];

    while (weighted.length > 0) {
      const totalWeight = weighted.reduce((sum, item) => sum + item.weight, 0);
      let randomTarget = Math.random() * totalWeight;
      let pickedIndex = weighted.length - 1;

      for (let i = 0; i < weighted.length; i++) {
        randomTarget -= weighted[i].weight;
        if (randomTarget <= 0) {
          pickedIndex = i;
          break;
        }
      }

      queue.push(weighted.splice(pickedIndex, 1)[0].word);
    }

    return queue;
  }
}
