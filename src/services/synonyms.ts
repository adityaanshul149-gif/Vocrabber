import { VocabularyRecord } from '../types';

// Built-in high-level synonyms dictionary (1 or 2 closest high level synonyms per word)
const SYNONYM_DICTIONARY: Record<string, string[]> = {
  prescription: ['remedy', 'directive'],
  abate: ['subside', 'dwindle'],
  lucid: ['coherent', 'articulate'],
  equanimity: ['composure', 'serenity'],
  ephemeral: ['transitory', 'fleeting'],
  anomaly: ['aberration', 'irregularity'],
  pragmatic: ['empirical', 'expedient'],
  fastidious: ['meticulous', 'scrupulous'],
  esoteric: ['recondite', 'abstruse'],
  ubiquitous: ['omnipresent', 'pervasive'],
  perspicacious: ['astute', 'discerning'],
  delineate: ['demarcate', 'depict'],
  obfuscate: ['befog', 'muddle'],
  grandiloquent: ['bombastic', 'pompous'],
  laconic: ['terse', 'concise'],
  magnanimous: ['benevolent', 'chivalrous'],
  garrulous: ['loquacious', 'voluble'],
  taciturn: ['reticent', 'reserved'],
  vindictive: ['vengeful', 'spiteful'],
  zealot: ['fanatic', 'partisan'],
  acquiesce: ['concede', 'comply'],
  alacrity: ['eagerness', 'promptness'],
  amalgamate: ['consolidate', 'fuse'],
  anachronism: ['misplacement', 'incongruity'],
  audacious: ['intrepid', 'bold'],
  bolster: ['fortify', 'buttress'],
  cacophony: ['dissonance', 'din'],
  capricious: ['fickle', 'whimsical'],
  castigate: ['chastise', 'reprove'],
  chicanery: ['duplicity', 'subterfuge'],
  cogent: ['compelling', 'persuasive'],
  corroborate: ['substantiate', 'validate'],
  deferential: ['reverent', 'respectful'],
  deride: ['disparage', 'mock'],
  desiccate: ['dehydrate', 'wither'],
  diatribe: ['harangue', 'tirade'],
  disparate: ['divergent', 'distinct'],
  ebullient: ['exuberant', 'buoyant'],
  enervate: ['debilitate', 'fatigue'],
  engender: ['instigate', 'generate'],
  erudite: ['scholarly', 'learned'],
  exculpate: ['vindicate', 'absolve'],
  gregarious: ['affable', 'convivial'],
  harangue: ['diatribe', 'fulmination'],
  inchoate: ['rudimentary', 'nascent'],
  ingenuous: ['artless', 'guileless'],
  intransigent: ['uncompromising', 'resolute'],
  inveigh: ['remonstrate', 'declaim'],
  loquacious: ['garrulous', 'voluble'],
  malleable: ['pliant', 'tractable'],
  misanthrope: ['cynic', 'recluse'],
  obsequious: ['fawning', 'servile'],
  ostentatious: ['flamboyant', 'pretentious'],
  pedantic: ['punctilious', 'dogmatic'],
  perfunctory: ['cursory', 'desultory'],
  platitude: ['truism', 'banality'],
  prodigal: ['extravagant', 'profligate'],
  profligate: ['wasteful', 'licentious'],
  recondite: ['esoteric', 'abstruse'],
  sanctimonious: ['piestic', 'hypocritical'],
  sycophant: ['flatterer', 'toady'],
  trenchant: ['incisive', 'cutting'],
  veracity: ['candor', 'truthfulness'],
  vituperative: ['scathing', 'invective'],
  volatile: ['capricious', 'erratic']
};

/**
 * Returns 1 or 2 closest high level synonyms for a given word or VocabularyRecord
 */
export function getSynonyms(word: string | VocabularyRecord | any, customSynonyms?: string[]): string[] {
  let wordStr = '';
  let customList = customSynonyms;

  if (word && typeof word === 'object') {
    if (Array.isArray((word as any).synonyms) && (word as any).synonyms.length > 0) {
      customList = (word as any).synonyms;
    }
    wordStr = typeof (word as any).word === 'string' ? (word as any).word : '';
  } else if (typeof word === 'string') {
    wordStr = word;
  } else if (word) {
    wordStr = String(word);
  }

  if (customList && Array.isArray(customList) && customList.length > 0) {
    const filtered = customList.filter(s => typeof s === 'string' && Boolean(s.trim()));
    if (filtered.length > 0) return filtered;
  }

  const normalized = wordStr.toLowerCase().trim();
  if (!normalized) return [];

  if (SYNONYM_DICTIONARY[normalized]) {
    return SYNONYM_DICTIONARY[normalized];
  }

  // Fallback heuristic for words not explicitly listed
  return ['equivalent', 'analogous'];
}
