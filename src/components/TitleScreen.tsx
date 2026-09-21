import React, { useState } from 'react';
import { Play, Calendar, Globe, Sparkles, Volume2, VolumeX, Music, Palette } from 'lucide-react';
import { SuitMode, Language } from '../engine/types';
import { Translations } from '../i18n/translations';
import { sound } from '../audio/soundManager';
import { AVAILABLE_DECKS } from '../engine/decks';

interface TitleScreenProps {
  suitMode: SuitMode;
  language: Language;
  soundEnabled: boolean;
  musicEnabled: boolean;
  deckTheme: string;
  onlineCount: number;
  t: Translations;
  onStartGame: (mode: SuitMode) => void;
  onOpenDaily: () => void;
  onToggleLanguage: () => void;
  onToggleSound: () => void;
  onToggleMusic: () => void;
  onSelectDeckTheme: (deckId: string) => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  suitMode,
  language,
  soundEnabled,
  musicEnabled,
  deckTheme,
  onlineCount,
  t,
  onStartGame,
  onOpenDaily,
  onToggleLanguage,
  onToggleSound,
  onToggleMusic,
  onSelectDeckTheme,
}) => {
  const [selectedMode, setSelectedMode] = useState<SuitMode>(suitMode);
  const [isDismissing, setIsDismissing] = useState(false);

  const handlePlay = (mode: SuitMode) => {
    sound.playCardSnap();
    setIsDismissing(true);
    setTimeout(() => {
      onStartGame(mode);
    }, 450);
  };

  return (
    <div className={`title-screen-overlay ${isDismissing ? 'dismissing' : ''}`}>
      {/* Background Graphic with Vignette */}
      <div className="title-bg-image" />
      <div className="title-bg-vignette" />

      {/* Top Utility Bar */}
      <div className="title-top-bar">
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="title-util-btn"
            onClick={onToggleSound}
            title={soundEnabled ? t.mute : t.unmute}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          <button
            className="title-util-btn"
            onClick={onToggleMusic}
            title={musicEnabled ? t.musicMute : t.musicUnmute}
            style={{ color: musicEnabled ? '#d4af37' : '#999' }}
          >
            <Music size={18} />
          </button>
        </div>

        <button
          className="title-util-btn"
          onClick={onToggleLanguage}
          title="Switch Language / החלף שפה"
        >
          <Globe size={18} />
          <span>{language === 'en' ? 'עברית' : 'English'}</span>
        </button>
      </div>

      {/* Main Center Content */}
      <div className="title-center-content">
        <div className="title-brand-badge">
          <Sparkles size={16} color="#f3e5ab" />
          <span>ROYAL EDITION</span>
          <Sparkles size={16} color="#f3e5ab" />
        </div>

        <div className="online-presence-badge title-presence" title={t.activePlayersTooltip}>
          <span className="online-beacon-dot" />
          <span>{t.playersOnline(onlineCount)}</span>
        </div>

        <h1 className="title-main-heading">
          {t.appTitle}
        </h1>

        <p className="title-tagline">
          {t.titleScreenTagline}
        </p>

        {/* Difficulty Selection Pills */}
        <div className="title-difficulty-section">
          <span className="title-section-label">{t.selectDifficulty}</span>
          <div className="title-difficulty-pills">
            {([1, 2, 4] as const).map((mode) => (
              <button
                key={mode}
                className={`title-pill ${selectedMode === mode ? 'active' : ''}`}
                onClick={() => {
                  setSelectedMode(mode);
                  sound.playClick();
                }}
              >
                {mode === 1 ? t.suitMode1 : mode === 2 ? t.suitMode2 : t.suitMode4}
              </button>
            ))}
          </div>
        </div>

        {/* Deck Selection Quick Pills */}
        <div className="title-difficulty-section" style={{ marginTop: '12px' }}>
          <span className="title-section-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Palette size={14} />
            <span>{t.selectDeck}:</span>
          </span>
          <div className="title-difficulty-pills">
            {AVAILABLE_DECKS.filter(d => d.isAvailable).map((deck) => {
              const isSelected = (deckTheme || 'classic') === deck.id;
              const name = language === 'he' ? deck.nameHe : deck.name;
              return (
                <button
                  key={deck.id}
                  className={`title-pill ${isSelected ? 'active' : ''} ${deck.id === 'celestial' ? 'celestial-pill' : ''}`}
                  onClick={() => {
                    onSelectDeckTheme(deck.id);
                    sound.playClick();
                  }}
                >
                  {deck.id === 'celestial' ? '⚡ ' : '👑 '}
                  {name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="title-actions">
          <button
            className="title-btn-play"
            onClick={() => handlePlay(selectedMode)}
          >
            <Play size={22} fill="currentColor" />
            <span>{t.titleScreenPlay}</span>
          </button>

          <button
            className="title-btn-secondary"
            onClick={() => {
              sound.playClick();
              setIsDismissing(true);
              setTimeout(() => {
                onStartGame(selectedMode);
                onOpenDaily();
              }, 400);
            }}
          >
            <Calendar size={18} />
            <span>{t.titleScreenDaily}</span>
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="title-footer-note">
        <span>♠ ♥ ♣ ♦ Spider Solitaire Prime • Modular Decks & Roguelike Twists</span>
      </div>
    </div>
  );
};
