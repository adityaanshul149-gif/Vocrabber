import { VocabularyRecord, ProgressRecord, PracticeMode, AppLevel } from '../types';
import { StorageService } from './storage';

export class QueueService {
  private static calculatePriority(progress: ProgressRecord | null): number {
    if (!progress || progress.attempts === 0) return 30; // High priority for unpracticed words

    const score = StorageService.getWordScore(progress);
    const state = StorageService.getLearningState(progress);

    const recent = progress.history?.length ? progress.history[progress.history.length - 1] : null;
    const recentlyWrong = recent && !recent.wasCorrect ? 12 : 0;
    const recentlyCorrect = recent && recent.wasCorrect ? -6 : 0;

    let stateWeight = 20;
    if (state === 'Needs Work') stateWeight = 40;
    else if (state === 'Learning') stateWeight = 20;
    else if (state === 'Mastered') stateWeight = 5;

    // Words with negative scores get a strong priority boost! (e.g., -4 pts => +24 priority)
    const negativeScoreBoost = score < 0 ? Math.abs(score) * 6 : 0;

    return Math.max(
      1,
      10 +
        stateWeight +
        negativeScoreBoost +
        Math.max(0, 10 - score) +
        recentlyWrong +
        recentlyCorrect
    );
  }

  public static getEligibleWords(
    mode: PracticeMode,
    selectedSectors?: Set<string>,
    level: AppLevel = 'lvl1'
  ): VocabularyRecord[] {
    const vocab = StorageService.getVocabulary();
    const progressLvl1Map = new Map(StorageService.getProgress('lvl1').map(p => [p.vocabularyId, p]));
    const progressLvl2Map = new Map(StorageService.getProgress('lvl2').map(p => [p.vocabularyId, p]));

    return vocab.filter(word => {
      if (selectedSectors && selectedSectors.size > 0 && !selectedSectors.has(word.sector)) {
        return false;
      }

      if (level === 'lvl2') {
        // Level 2 eligibility: MUST be Mastered in Level 1
        const p1 = progressLvl1Map.get(word.id) || null;
        const state1 = StorageService.getLearningState(p1);
        if (state1 !== 'Mastered') {
          return false;
        }

        const p2 = progressLvl2Map.get(word.id) || null;
        const score2 = StorageService.getWordScore(p2);
        const state2 = StorageService.getLearningState(p2);
        if (mode === 'weak') {
          return state2 === 'Needs Work';
        }
        if (mode === 'less') {
          return !p2 || p2.attempts <= 1;
        }
        return true;
      }

      // Level 1 logic
      const p = progressLvl1Map.get(word.id) || null;
      const score = StorageService.getWordScore(p);
      const state = StorageService.getLearningState(p);

      if (mode === 'weak') {
        return state === 'Needs Work';
      }
      if (mode === 'less') {
        return !p || p.attempts <= 1;
      }

      return true; // Random mode includes all
    });
  }

  public static buildQueue(
    eligibleWords: VocabularyRecord[],
    excludedWordId?: string,
    level: AppLevel = 'lvl1'
  ): VocabularyRecord[] {
    const progressMap = new Map(StorageService.getProgress(level).map(p => [p.vocabularyId, p]));
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
