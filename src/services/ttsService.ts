export interface TTSSettings {
  voiceUri: string;
  rate: number;   // 0.5 - 2.0
  pitch: number;  // 0.5 - 1.5
  volume: number; // 0.0 - 1.0 (0% - 100%)
}

const STORAGE_KEY = 'voccrab.ttsSettings';

const DEFAULT_SETTINGS: TTSSettings = {
  voiceUri: '',
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0
};

type SpeakingListener = (isSpeaking: boolean, speakingText: string | null) => void;
type VoicesListener = (voices: SpeechSynthesisVoice[]) => void;

export class TTSService {
  private static settings: TTSSettings = TTSService.loadSettings();
  private static voices: SpeechSynthesisVoice[] = [];
  private static speakingListeners: Set<SpeakingListener> = new Set();
  private static voicesListeners: Set<VoicesListener> = new Set();
  private static currentlySpeakingText: string | null = null;

  public static isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public static loadSettings(): TTSSettings {
    if (typeof localStorage === 'undefined') return { ...DEFAULT_SETTINGS };
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          voiceUri: parsed.voiceUri ?? DEFAULT_SETTINGS.voiceUri,
          rate: typeof parsed.rate === 'number' ? Math.min(2.0, Math.max(0.5, parsed.rate)) : DEFAULT_SETTINGS.rate,
          pitch: typeof parsed.pitch === 'number' ? Math.min(1.5, Math.max(0.5, parsed.pitch)) : DEFAULT_SETTINGS.pitch,
          volume: typeof parsed.volume === 'number' ? Math.min(1.0, Math.max(0.0, parsed.volume)) : DEFAULT_SETTINGS.volume
        };
      }
    } catch {
      // Fallback
    }
    return { ...DEFAULT_SETTINGS };
  }

  public static saveSettings(newSettings: Partial<TTSSettings>): TTSSettings {
    TTSService.settings = { ...TTSService.settings, ...newSettings };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(TTSService.settings));
    } catch (e) {
      console.warn('[TTSService] Failed to save settings to localStorage', e);
    }
    return TTSService.settings;
  }

  public static getSettings(): TTSSettings {
    return { ...TTSService.settings };
  }

  public static init(): void {
    if (!TTSService.isSupported()) return;

    const updateVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      if (allVoices.length > 0) {
        // Sort voices so natural / English voices come first
        TTSService.voices = [...allVoices].sort((a, b) => {
          const aName = a.name.toLowerCase();
          const bName = b.name.toLowerCase();
          const aLang = a.lang.toLowerCase();
          const bLang = b.lang.toLowerCase();

          const aIsEn = aLang.startsWith('en');
          const bIsEn = bLang.startsWith('en');
          if (aIsEn && !bIsEn) return -1;
          if (!aIsEn && bIsEn) return 1;

          const aNatural = aName.includes('natural') || aName.includes('google') || aName.includes('siri') || aName.includes('enhanced');
          const bNatural = bName.includes('natural') || bName.includes('google') || bName.includes('siri') || bName.includes('enhanced');
          if (aNatural && !bNatural) return -1;
          if (!aNatural && bNatural) return 1;

          return a.name.localeCompare(b.name);
        });

        // Set default voice if none selected or selected voice not in list
        if (!TTSService.settings.voiceUri || !TTSService.voices.some(v => v.voiceURI === TTSService.settings.voiceUri)) {
          const defaultEnVoice = TTSService.voices.find(v => v.lang.startsWith('en')) || TTSService.voices[0];
          if (defaultEnVoice) {
            TTSService.saveSettings({ voiceUri: defaultEnVoice.voiceURI });
          }
        }

        TTSService.notifyVoicesChanged();
      }
    };

    updateVoices();

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }

  public static getVoices(): SpeechSynthesisVoice[] {
    if (TTSService.voices.length === 0 && TTSService.isSupported()) {
      TTSService.init();
    }
    return TTSService.voices;
  }

  public static subscribeVoices(listener: VoicesListener): () => void {
    TTSService.voicesListeners.add(listener);
    if (TTSService.voices.length > 0) {
      listener(TTSService.voices);
    }
    return () => TTSService.voicesListeners.delete(listener);
  }

  private static notifyVoicesChanged(): void {
    TTSService.voicesListeners.forEach(fn => fn(TTSService.voices));
  }

  public static subscribeSpeaking(listener: SpeakingListener): () => void {
    TTSService.speakingListeners.add(listener);
    listener(TTSService.isSpeaking(), TTSService.currentlySpeakingText);
    return () => TTSService.speakingListeners.delete(listener);
  }

  private static notifySpeakingState(isSpeaking: boolean, text: string | null): void {
    TTSService.currentlySpeakingText = isSpeaking ? text : null;
    TTSService.speakingListeners.forEach(fn => fn(isSpeaking, text));
  }

  public static isSpeaking(): boolean {
    return TTSService.isSupported() && window.speechSynthesis.speaking;
  }

  public static getCurrentlySpeakingText(): string | null {
    return TTSService.currentlySpeakingText;
  }

  public static speak(text: string, onEnd?: () => void, onError?: () => void): void {
    if (!TTSService.isSupported() || !text) return;

    // Stop current speech if any
    TTSService.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    const settings = TTSService.getSettings();

    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    utterance.volume = settings.volume;

    const voices = TTSService.getVoices();
    const selectedVoice = voices.find(v => v.voiceURI === settings.voiceUri);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => {
      TTSService.notifySpeakingState(true, text);
    };

    utterance.onend = () => {
      TTSService.notifySpeakingState(false, null);
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('[TTSService] Speech synthesis error:', e);
      TTSService.notifySpeakingState(false, null);
      if (onError) onError();
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error('[TTSService] Exception during speak():', e);
      TTSService.notifySpeakingState(false, null);
    }
  }

  public static stop(): void {
    if (!TTSService.isSupported()) return;
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
    TTSService.notifySpeakingState(false, null);
  }
}

// Auto init on import if window is present
if (typeof window !== 'undefined') {
  TTSService.init();
}
