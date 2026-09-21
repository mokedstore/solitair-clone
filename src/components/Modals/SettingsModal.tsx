import React, { useState } from 'react';
import { Settings, X, Volume2, VolumeX, Sparkles, Dices, Globe } from 'lucide-react';
import { GameSettings, SuitMode } from '../../engine/types';
import { Translations } from '../../i18n/translations';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onPlayCustomSeed: (seed: string, suitMode: SuitMode) => void;
  t: Translations;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onPlayCustomSeed,
  t,
}) => {
  const [customSeedInput, setCustomSeedInput] = useState<string>('');

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings className="modal-icon" size={20} color="#d4af37" />
            <h2 className="modal-title">{t.settingsTitle}</h2>
          </div>
          <button className="btn-action" onClick={onClose} style={{ padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Language Selection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.84rem', color: '#d4af37', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Globe size={16} />
              <span>{t.languageLabel}</span>
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className={`btn-action ${settings.language === 'en' ? 'btn-gold' : ''}`}
                style={{ flex: 1, padding: '8px' }}
                onClick={() => onUpdateSettings({ language: 'en' })}
              >
                {t.langEn}
              </button>
              <button
                className={`btn-action ${settings.language === 'he' ? 'btn-gold' : ''}`}
                style={{ flex: 1, padding: '8px' }}
                onClick={() => onUpdateSettings({ language: 'he' })}
              >
                {t.langHe}
              </button>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.08)' }} />

          {/* Difficulty / Suit Mode */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.84rem', color: '#d4af37', fontWeight: 600 }}>
              {t.difficultyLabel}
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {([1, 2, 4] as const).map((mode) => (
                <button
                  key={mode}
                  className={`btn-action ${settings.suitMode === mode ? 'btn-gold' : ''}`}
                  style={{ flex: 1, padding: '8px' }}
                  onClick={() => onUpdateSettings({ suitMode: mode })}
                >
                  {mode === 1 ? t.suitMode1 : mode === 2 ? t.suitMode2 : t.suitMode4}
                </button>
              ))}
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.08)' }} />

          {/* Dealing Rules */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#fff' }}>
                {t.relaxedDealing}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#9bb3a6' }}>
                {t.relaxedDealingDesc}
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.relaxedDealing}
              onChange={(e) => onUpdateSettings({ relaxedDealing: e.target.checked })}
              style={{ width: '18px', height: '18px', accentColor: '#d4af37', cursor: 'pointer' }}
            />
          </div>

          {/* Sound Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {settings.soundEnabled ? <Volume2 size={18} color="#d4af37" /> : <VolumeX size={18} color="#888" />}
                <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#fff' }}>{t.proceduralSound}</span>
              </div>
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => onUpdateSettings({ soundEnabled: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: '#d4af37', cursor: 'pointer' }}
              />
            </div>

            {settings.soundEnabled && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '0.75rem', color: '#9bb3a6' }}>{t.volume}</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.soundVolume}
                  onChange={(e) => onUpdateSettings({ soundVolume: parseFloat(e.target.value) })}
                  style={{ flex: 1, accentColor: '#d4af37', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.8rem', color: '#fff', width: '36px', textAlign: 'right' }}>
                  {Math.round(settings.soundVolume * 100)}%
                </span>
              </div>
            )}
          </div>

          {/* Twists & Modifiers Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} color="#d4af37" />
                <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#fff' }}>{t.twistsEngine}</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#9bb3a6' }}>
                {t.twistsEngineDesc}
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.twistsEnabled}
              onChange={(e) => onUpdateSettings({ twistsEnabled: e.target.checked })}
              style={{ width: '18px', height: '18px', accentColor: '#d4af37', cursor: 'pointer' }}
            />
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.08)' }} />

          {/* Custom Seed Loader */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.84rem', color: '#d4af37', fontWeight: 600 }}>
              {t.loadSeedLabel}
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="e.g. SPIDER-20260921-2S"
                value={customSeedInput}
                onChange={(e) => setCustomSeedInput(e.target.value)}
                style={{
                  flex: 1,
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  borderRadius: '6px',
                  padding: '8px 10px',
                  color: '#fff',
                  fontSize: '0.88rem',
                }}
              />
              <button
                className="btn-action btn-gold"
                disabled={!customSeedInput.trim()}
                onClick={() => {
                  if (customSeedInput.trim()) {
                    onPlayCustomSeed(customSeedInput.trim(), settings.suitMode);
                    onClose();
                  }
                }}
              >
                <Dices size={16} />
                <span>{t.loadButton}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-action btn-gold" onClick={onClose}>
            {t.done}
          </button>
        </div>
      </div>
    </div>
  );
};
