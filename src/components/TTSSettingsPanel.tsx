import React, { useState, useEffect } from 'react';
import { TTSService, TTSSettings } from '../services/ttsService';
import { Volume2, RotateCcw, Play, CheckCircle2, Sliders } from 'lucide-react';

export const TTSSettingsPanel: React.FC = () => {
  const [settings, setSettings] = useState<TTSSettings>(TTSService.getSettings());
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(TTSService.getVoices());
  const [isSpeakingTest, setIsSpeakingTest] = useState(false);

  useEffect(() => {
    const unsubVoices = TTSService.subscribeVoices((newVoices) => {
      setVoices(newVoices);
      setSettings(TTSService.getSettings());
    });

    const unsubSpeaking = TTSService.subscribeSpeaking((speaking, text) => {
      setIsSpeakingTest(speaking && text?.includes('pronunciation test') === true);
    });

    return () => {
      unsubVoices();
      unsubSpeaking();
    };
  }, []);

  const handleSettingChange = (key: keyof TTSSettings, value: number | string) => {
    const updated = TTSService.saveSettings({ [key]: value });
    setSettings(updated);
  };

  const handleResetDefaults = () => {
    const defaultVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
    const reset = TTSService.saveSettings({
      voiceUri: defaultVoice?.voiceURI || '',
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0
    });
    setSettings(reset);
  };

  const handleTestSpeech = () => {
    const testText = 'Text-to-speech pronunciation test for CAT VARC vocabulary words: Ubiquitous, Perspicacious, Delineate.';
    TTSService.speak(testText);
  };

  return (
    <div className="space-y-4 bg-slate-50 dark:bg-slate-800/80 border-2 border-black dark:border-slate-700 p-4 rounded-xl font-sans">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b-2 border-black/10 dark:border-white/10 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#FFE600] border-2 border-black flex items-center justify-center text-black font-black">
            <Volume2 className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase text-slate-900 dark:text-white flex items-center gap-1.5">
              TTS Audio Settings
            </h3>
            <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
              Customize speech rate, pitch, volume & system voice
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleResetDefaults}
          title="Reset TTS settings to defaults"
          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-black text-[10px] uppercase border-2 border-black dark:border-white flex items-center gap-1 cursor-pointer transition-all shadow-[1.5px_1.5px_0px_0px_#000]"
        >
          <RotateCcw className="w-3 h-3 stroke-[2.5]" />
          Reset
        </button>
      </div>

      {!TTSService.isSupported() ? (
        <div className="p-3 bg-amber-100 border-2 border-black text-amber-900 rounded-xl text-xs font-bold">
          ⚠️ Speech Synthesis API is not supported in this browser environment.
        </div>
      ) : (
        <div className="space-y-3 text-xs">
          {/* Voice Selector Dropdown */}
          <div className="space-y-1">
            <label className="flex items-center justify-between text-[11px] font-black uppercase text-slate-900 dark:text-slate-200">
              <span>Browser Speech Voice</span>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                {voices.length} Available
              </span>
            </label>
            <select
              value={settings.voiceUri}
              onChange={(e) => handleSettingChange('voiceUri', e.target.value)}
              className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-xs border-2 border-black dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#A855F7] shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#A855F7]"
            >
              {voices.length === 0 ? (
                <option value="">Loading system voices...</option>
              ) : (
                voices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.lang}) {v.default ? '— Default' : ''}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Speed / Rate Slider */}
          <div className="space-y-1 bg-white dark:bg-slate-900 p-2.5 rounded-xl border-2 border-black dark:border-slate-700">
            <div className="flex items-center justify-between text-[11px] font-black uppercase">
              <span className="text-slate-900 dark:text-slate-200">Speed (Rate)</span>
              <span className="px-2 py-0.5 rounded bg-[#FFE600] border border-black text-black text-[10px]">
                {settings.rate.toFixed(1)}x
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-slate-500">0.5x</span>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={settings.rate}
                onChange={(e) => handleSettingChange('rate', parseFloat(e.target.value))}
                className="w-full accent-[#A855F7] cursor-pointer"
              />
              <span className="text-[10px] font-bold text-slate-500">2.0x</span>
            </div>
          </div>

          {/* Pitch Slider */}
          <div className="space-y-1 bg-white dark:bg-slate-900 p-2.5 rounded-xl border-2 border-black dark:border-slate-700">
            <div className="flex items-center justify-between text-[11px] font-black uppercase">
              <span className="text-slate-900 dark:text-slate-200">Pitch</span>
              <span className="px-2 py-0.5 rounded bg-[#A855F7] border border-black text-white text-[10px]">
                {settings.pitch.toFixed(1)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-slate-500">0.5 (Low)</span>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={settings.pitch}
                onChange={(e) => handleSettingChange('pitch', parseFloat(e.target.value))}
                className="w-full accent-[#A855F7] cursor-pointer"
              />
              <span className="text-[10px] font-bold text-slate-500">1.5 (High)</span>
            </div>
          </div>

          {/* Volume Slider */}
          <div className="space-y-1 bg-white dark:bg-slate-900 p-2.5 rounded-xl border-2 border-black dark:border-slate-700">
            <div className="flex items-center justify-between text-[11px] font-black uppercase">
              <span className="text-slate-900 dark:text-slate-200">Volume</span>
              <span className="px-2 py-0.5 rounded bg-[#4ADE80] border border-black text-black text-[10px]">
                {Math.round(settings.volume * 100)}%
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-slate-500">Mute</span>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={settings.volume}
                onChange={(e) => handleSettingChange('volume', parseFloat(e.target.value))}
                className="w-full accent-[#4ADE80] cursor-pointer"
              />
              <span className="text-[10px] font-bold text-slate-500">100%</span>
            </div>
          </div>

          {/* Test Speech Button */}
          <button
            type="button"
            onClick={handleTestSpeech}
            className={`w-full py-2.5 rounded-xl font-black text-xs uppercase border-2 border-black flex items-center justify-center gap-2 cursor-pointer shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all ${
              isSpeakingTest
                ? 'bg-[#A855F7] text-white animate-pulse'
                : 'bg-[#FFE600] hover:bg-yellow-300 text-black'
            }`}
          >
            <Play className={`w-4 h-4 stroke-[2.5] ${isSpeakingTest ? 'animate-spin' : ''}`} />
            {isSpeakingTest ? 'Testing Voice...' : 'Test Audio Pronunciation'}
          </button>
        </div>
      )}
    </div>
  );
};
