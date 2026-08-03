import { VocabularyRecord } from '../types';

// Service to generate text-based phonetic respelling pronunciations (e.g., "pruh·skrip·shn")

const PRONUNCIATION_DICTIONARY: Record<string, string> = {
  prescription: 'pruh·skrip·shn',
  abate: 'uh·bayt',
  lucid: 'loo·sid',
  equanimity: 'ee·kweh·nih·mee·tee',
  ephemeral: 'ih·fem·er·uhl',
  anomaly: 'uh·nom·uh·lee',
  pragmatic: 'prag·mat·ik',
  ubiquitous: 'yoo·bik·wih·tuhs',
  perspicacious: 'per·spih·kay·shuhs',
  delineate: 'dih·lin·ee·ayt',
  obfuscate: 'ob·fuh·skayt',
  esoteric: 'eh·suh·tair·ik',
  fastidious: 'fuh·stid·ee·uhs',
  grandiloquent: 'gran·dil·uh·kwuhnt',
  laconic: 'luh·kon·ik',
  magnanimous: 'mag·nan·uh·muhs',
  garrulous: 'gair·uh·luhs',
  taciturn: 'tas·ih·tern',
  vindictive: 'vin·dik·tiv',
  zealot: 'zel·uht',
  acquiesce: 'ak·wee·es',
  alacrity: 'uh·lak·ruh·tee',
  amalgamate: 'uh·mal·guh·mayt',
  anachronism: 'uh·nak·ruh·niz·uhm',
  audacious: 'aw·day·shuhs',
  bolster: 'bohl·ster',
  cacophony: 'kuh·kof·uh·nee',
  capricious: 'kuh·prish·uhs',
  castigate: 'kas·tih·gayt',
  chicanery: 'shih·kay·nuh·ree',
  cogent: 'koh·juhnt',
  corroborate: 'kuh·rob·uh·rayt',
  deferential: 'def·er·en·shuhl',
  deride: 'dih·ryd',
  desiccate: 'des·ih·kayt',
  diatribe: 'dy·uh·tryb',
  disparate: 'dis·per·it',
  ebullient: 'ih·bul·yuhnt',
  enervate: 'en·er·vayt',
  engender: 'en·jen·der',
  erudite: 'air·yoo·dyt',
  exculpate: 'ek·skuhl·payt',
  gregarious: 'gruh·gair·ee·uhs',
  harangue: 'huh·rang',
  inchoate: 'in·koh·it',
  ingenuous: 'in·jen·yoo·uhs',
  intransigent: 'in·tran·sih·juhnt',
  inveigh: 'in·vay',
  loquacious: 'loh·kway·shuhs',
  malleable: 'mal·ee·uh·buhl',
  misanthrope: 'mis·uhn·throhp',
  obsequious: 'uhb·see·kwee·uhs',
  ostentatious: 'os·ten·tay·shuhs',
  pedantic: 'puh·dan·tik',
  perfunctory: 'per·fuhngk·tuh·ree',
  platitude: 'plat·ih·tood',
  prodigal: 'prod·ih·guhl',
  profligate: 'prof·lih·git',
  recondite: 'rek·uhn·dyt',
  sanctimonious: 'sangk·tih·moh·nee·uhs',
  sycophant: 'sik·uh·fuhnt',
  trenchant: 'tren·chuhnt',
  veracity: 'vuh·ras·ih·tee',
  vituperative: 'vy·too·per·uh·tiv',
  volatile: 'vol·uh·tuhl'
};

/**
 * Heuristic phonetic respeller fallback for words not in the explicit dictionary
 */
function generateFallbackPhonetic(word: string): string {
  let clean = word.toLowerCase().trim();
  if (!clean) return '';

  // Common suffix replacements for phonetic respelling
  clean = clean
    .replace(/tion$/g, 'shn')
    .replace(/sions$/g, 'zhnz')
    .replace(/sion$/g, 'zhn')
    .replace(/tions$/g, 'shnz')
    .replace(/tious$/g, 'shuhs')
    .replace(/cious$/g, 'shuhs')
    .replace(/gious$/g, 'juhs')
    .replace(/able$/g, 'uh·buhl')
    .replace(/ible$/g, 'ih·buhl')
    .replace(/ment$/g, 'muhnt')
    .replace(/ness$/g, 'nis')
    .replace(/less$/g, 'lis')
    .replace(/ology$/g, 'ol·uh·jee')
    .replace(/ity$/g, 'ih·tee')
    .replace(/ph/g, 'f')
    .replace(/ck/g, 'k');

  // Simple syllable splitter based on vowels
  const vowels = /[aeiouy]+/g;
  const parts: string[] = [];
  let lastIdx = 0;
  let match;

  while ((match = vowels.exec(clean)) !== null) {
    const end = match.index + match[0].length;
    let syl = clean.slice(lastIdx, end);
    // Include following consonant if not at end
    if (end < clean.length && !'aeiouy'.includes(clean[end])) {
      syl += clean[end];
      vowels.lastIndex++;
      lastIdx = end + 1;
    } else {
      lastIdx = end;
    }
    if (syl) parts.push(syl);
  }

  if (lastIdx < clean.length) {
    if (parts.length > 0) {
      parts[parts.length - 1] += clean.slice(lastIdx);
    } else {
      parts.push(clean.slice(lastIdx));
    }
  }

  if (parts.length <= 1) {
    return clean;
  }

  return parts.join('·');
}

/**
 * Returns phonetic text pronunciation (e.g., "pruh·skrip·shn")
 */
export function getPronunciation(word: string | VocabularyRecord | any, customPhonetic?: string): string {
  let wordStr = '';
  let customPhon = customPhonetic;

  if (word && typeof word === 'object') {
    if (typeof (word as any).phonetic === 'string' && (word as any).phonetic.trim()) {
      customPhon = (word as any).phonetic;
    }
    wordStr = typeof (word as any).word === 'string' ? (word as any).word : '';
  } else if (typeof word === 'string') {
    wordStr = word;
  } else if (word) {
    wordStr = String(word);
  }

  if (customPhon && typeof customPhon === 'string' && customPhon.trim()) {
    return customPhon.trim();
  }

  const normalized = wordStr.toLowerCase().trim();
  if (!normalized) return '';

  if (PRONUNCIATION_DICTIONARY[normalized]) {
    return PRONUNCIATION_DICTIONARY[normalized];
  }

  return generateFallbackPhonetic(normalized);
}
