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

  // iOS Safari Fix: Keep explicit static and global reference to utterance to prevent Garbage Collection mid-speech
  private static activeUtterance: SpeechSynthesisUtterance | null = null;
  private static keepAliveTimer: any = null;
  private static activeAudioFallback: HTMLAudioElement | null = null;
  private static isUnlocked = false;

  public static isSupported(): boolean {
    return typeof window !== 'undefined' && ('speechSynthesis' in window || 'Audio' in window);
  }

  // Pre-warm / unlock audio context on iOS Safari PWA
  public static unlockAudio(): void {
    if (TTSService.isUnlocked || typeof window === 'undefined') return;
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.resume();
        const silent = new SpeechSynthesisUtterance('');
        silent.volume = 0;
        window.speechSynthesis.speak(silent);
      }
      TTSService.isUnlocked = true;
    } catch {
      // Ignore unlock errors
    }
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
    if (typeof window === 'undefined') return;

    // Attach unlock handlers to user interactions for iOS Safari
    const unlockHandler = () => {
      TTSService.unlockAudio();
      window.removeEventListener('touchstart', unlockHandler);
      window.removeEventListener('click', unlockHandler);
    };
    window.addEventListener('touchstart', unlockHandler, { passive: true, once: true });
    window.addEventListener('click', unlockHandler, { passive: true, once: true });

    if (!('speechSynthesis' in window)) return;

    const updateVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      if (allVoices.length > 0) {
        // Sort voices so natural / English / iOS Siri voices come first
        TTSService.voices = [...allVoices].sort((a, b) => {
          const aName = a.name.toLowerCase();
          const bName = b.name.toLowerCase();
          const aLang = a.lang.toLowerCase();
          const bLang = b.lang.toLowerCase();

          const aIsEn = aLang.startsWith('en');
          const bIsEn = bLang.startsWith('en');
          if (aIsEn && !bIsEn) return -1;
          if (!aIsEn && bIsEn) return 1;

          const aNatural = aName.includes('siri') || aName.includes('enhanced') || aName.includes('natural') || aName.includes('samantha') || aName.includes('daniel');
          const bNatural = bName.includes('siri') || bName.includes('enhanced') || bName.includes('natural') || bName.includes('samantha') || bName.includes('daniel');
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
    if (TTSService.voices.length === 0 && TTSService.isSupported() && 'speechSynthesis' in window) {
      TTSService.init();
      const direct = window.speechSynthesis.getVoices();
      if (direct.length > 0) {
        TTSService.voices = direct;
      }
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
    if (TTSService.activeAudioFallback && !TTSService.activeAudioFallback.paused) {
      return true;
    }
    return TTSService.isSupported() && 'speechSynthesis' in window && window.speechSynthesis.speaking;
  }

  public static getCurrentlySpeakingText(): string | null {
    return TTSService.currentlySpeakingText;
  }

  private static stopKeepAlive(): void {
    if (TTSService.keepAliveTimer) {
      clearInterval(TTSService.keepAliveTimer);
      TTSService.keepAliveTimer = null;
    }
  }

  private static startKeepAlive(): void {
    TTSService.stopKeepAlive();
    // iOS Safari keeps TTS alive if pause/resume pulse is sent every 4 seconds
    TTSService.keepAliveTimer = setInterval(() => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      } else {
        TTSService.stopKeepAlive();
      }
    }, 4000);
  }

  public static speak(text: string, onEnd?: () => void, onError?: () => void): void {
    if (!text) return;

    TTSService.unlockAudio();
    TTSService.stop();

    // Check if speechSynthesis is available in browser
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const settings = TTSService.getSettings();

      // Ensure fresh voice list
      const freshVoices = window.speechSynthesis.getVoices();
      const activeVoiceList = freshVoices.length > 0 ? freshVoices : TTSService.voices;

      const utterance = new SpeechSynthesisUtterance(text);
      TTSService.activeUtterance = utterance;
      (window as any)._ttsActiveUtterance = utterance; // Prevent GC on iOS Safari

      // Safely clamp rate and pitch for iOS Safari stability
      utterance.rate = Math.max(0.5, Math.min(1.5, settings.rate));
      utterance.pitch = Math.max(0.5, Math.min(1.5, settings.pitch));
      utterance.volume = Math.max(0.1, Math.min(1.0, settings.volume));

      // Always explicitly set language so iOS Safari has a native voice fallback
      utterance.lang = 'en-US';

      if (settings.voiceUri) {
        const selectedVoice = activeVoiceList.find(v => v.voiceURI === settings.voiceUri);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
          if (selectedVoice.lang) {
            utterance.lang = selectedVoice.lang;
          }
        }
      }

      let hasStarted = false;

      utterance.onstart = () => {
        hasStarted = true;
        TTSService.notifySpeakingState(true, text);
        TTSService.startKeepAlive();
      };

      utterance.onend = () => {
        TTSService.stopKeepAlive();
        TTSService.activeUtterance = null;
        (window as any)._ttsActiveUtterance = null;
        TTSService.notifySpeakingState(false, null);
        if (onEnd) onEnd();
      };

      utterance.onerror = (e) => {
        console.warn('[TTSService] SpeechSynthesis onerror, attempting audio fallback:', e);
        TTSService.stopKeepAlive();
        TTSService.activeUtterance = null;
        (window as any)._ttsActiveUtterance = null;

        // Attempt MP3 Audio fallback for iOS Safari
        TTSService.speakFallbackAudio(text, onEnd, onError);
      };

      try {
        window.speechSynthesis.cancel();
        window.speechSynthesis.resume();

        // iOS Safari needs a tiny delay after cancel() before calling speak()
        setTimeout(() => {
          try {
            window.speechSynthesis.speak(utterance);

            // Timeout check: if iOS Safari fails to trigger onstart within 600ms, use fallback audio
            setTimeout(() => {
              if (!hasStarted && TTSService.currentlySpeakingText === null) {
                console.warn('[TTSService] SpeechSynthesis timed out starting on iOS, switching to Audio fallback');
                TTSService.speakFallbackAudio(text, onEnd, onError);
              }
            }, 600);
          } catch (err) {
            console.warn('[TTSService] speak() thrown, falling back to Audio:', err);
            TTSService.speakFallbackAudio(text, onEnd, onError);
          }
        }, 50);

        return;
      } catch (e) {
        console.warn('[TTSService] Speech synthesis exception, using fallback audio:', e);
      }
    }

    // Direct fallback if speechSynthesis is absent or failed
    TTSService.speakFallbackAudio(text, onEnd, onError);
  }

  // High quality MP3 pronunciation fallback for iOS Safari / PWA when WebSpeech is muted or broken
  private static speakFallbackAudio(text: string, onEnd?: () => void, onError?: () => void): void {
    try {
      TTSService.stop();

      const encodedText = encodeURIComponent(text.trim());
      // Primary TTS endpoint (Youdao Dictionary voice API for English words) & fallback Google Translate TTS
      const primaryUrl = `https://dict.youdao.com/dictvoice?audio=${encodedText}&type=2`;
      const fallbackUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=en&client=tw-ob`;

      const audio = new Audio(primaryUrl);
      TTSService.activeAudioFallback = audio;

      audio.onplay = () => {
        TTSService.notifySpeakingState(true, text);
      };

      audio.onended = () => {
        TTSService.activeAudioFallback = null;
        TTSService.notifySpeakingState(false, null);
        if (onEnd) onEnd();
      };

      audio.onerror = () => {
        // Try fallback URL if primary fails
        const secondAudio = new Audio(fallbackUrl);
        TTSService.activeAudioFallback = secondAudio;

        secondAudio.onplay = () => {
          TTSService.notifySpeakingState(true, text);
        };

        secondAudio.onended = () => {
          TTSService.activeAudioFallback = null;
          TTSService.notifySpeakingState(false, null);
          if (onEnd) onEnd();
        };

        secondAudio.onerror = () => {
          TTSService.activeAudioFallback = null;
          TTSService.notifySpeakingState(false, null);
          if (onError) onError();
        };

        secondAudio.play().catch(() => {
          TTSService.activeAudioFallback = null;
          TTSService.notifySpeakingState(false, null);
          if (onError) onError();
        });
      };

      audio.play().catch((err) => {
        console.warn('[TTSService] Audio play failed:', err);
        TTSService.activeAudioFallback = null;
        TTSService.notifySpeakingState(false, null);
        if (onError) onError();
      });
    } catch (err) {
      console.error('[TTSService] Fallback audio exception:', err);
      TTSService.notifySpeakingState(false, null);
      if (onError) onError();
    }
  }

  public static stop(): void {
    TTSService.stopKeepAlive();

    if (TTSService.activeAudioFallback) {
      try {
        TTSService.activeAudioFallback.pause();
        TTSService.activeAudioFallback.currentTime = 0;
      } catch {
        // ignore
      }
      TTSService.activeAudioFallback = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }

    TTSService.activeUtterance = null;
    if (typeof window !== 'undefined') {
      (window as any)._ttsActiveUtterance = null;
    }

    TTSService.notifySpeakingState(false, null);
  }
}

// Auto init on import if window is present
if (typeof window !== 'undefined') {
  TTSService.init();
}
