import React from 'react';
import {
  Undo2,
  Redo2,
  Lightbulb,
  RotateCcw,
  Calendar,
  Trophy,
  Settings,
  Volume2,
  VolumeX,
  Sparkles,
  Languages as LangIcon,
  Music,
} from 'lucide-react';
import { SuitMode, Language } from '../engine/types';
import { Translations } from '../i18n/translations';

interface HeaderBarProps {
  score: number;
  moves: number;
  timerSeconds: number;
  suitMode: SuitMode;
  canUndo: boolean;
  canRedo: boolean;
  isMuted: boolean;
  isMusicMuted: boolean;
  twistsEnabled: boolean;
  currentLanguage: Language;
  onlineCount: number;
  t: Translations;
  onUndo: () => void;
  onRedo: () => void;
  onHint: () => void;
  onNewGame: () => void;
  onToggleMute: () => void;
  onToggleMusic: () => void;
  onToggleLanguage: () => void;
  onOpenDaily: () => void;
  onOpenStats: () => void;
  onOpenSettings: () => void;
  onToggleTwists: () => void;
  onOpenTitleScreen: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  score,
  moves,
  timerSeconds,
  suitMode,
  canUndo,
  canRedo,
  isMuted,
  isMusicMuted,
  twistsEnabled,
  currentLanguage,
  onlineCount,
  t,
  onUndo,
  onRedo,
  onHint,
  onNewGame,
  onToggleMute,
  onToggleMusic,
  onToggleLanguage,
  onOpenDaily,
  onOpenStats,
  onOpenSettings,
  onToggleTwists,
  onOpenTitleScreen,
}) => {
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getSuitLabel = (mode: SuitMode) => {
    switch (mode) {
      case 1: return t.suitMode1;
      case 2: return t.suitMode2;
      case 4: return t.suitMode4;
    }
  };

  return (
    <header className="top-header">
      {/* Brand & Mode */}
      <div
        className="brand-section"
        onClick={onOpenTitleScreen}
        title="Title Screen / מסך כניסה"
        style={{ cursor: 'pointer' }}
      >
        <h1 className="brand-title">{t.appTitle}</h1>
        <span className="badge-mode">{getSuitLabel(suitMode)}</span>
        <div className="online-presence-badge header-presence" title={t.activePlayersTooltip}>
          <span className="online-beacon-dot" />
          <span>{t.playersOnlineShort(onlineCount)}</span>
        </div>
      </div>

      {/* Game Live Stats */}
      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-label">{t.score}</span>
          <span className="stat-value">{score}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">{t.moves}</span>
          <span className="stat-value">{moves}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">{t.time}</span>
          <span className="stat-value">{formatTime(timerSeconds)}</span>
        </div>
      </div>

      {/* Controls & Quick Actions */}
      <div className="actions-bar">
        <button
          className="btn-action"
          onClick={onUndo}
          disabled={!canUndo}
          title={`${t.undo} (Ctrl+Z)`}
        >
          <Undo2 size={16} />
          <span>{t.undo}</span>
        </button>

        <button
          className="btn-action"
          onClick={onRedo}
          disabled={!canRedo}
          title={`${t.redo} (Ctrl+Y)`}
        >
          <Redo2 size={16} />
          <span>{t.redo}</span>
        </button>

        <button
          className="btn-action"
          onClick={onHint}
          title={`${t.hint} (H)`}
        >
          <Lightbulb size={16} />
          <span>{t.hint}</span>
        </button>

        <button
          className="btn-action"
          onClick={onNewGame}
          title={t.newGame}
        >
          <RotateCcw size={16} />
          <span>{t.newGame}</span>
        </button>

        <button
          className={`btn-action ${twistsEnabled ? 'btn-gold' : ''}`}
          onClick={onToggleTwists}
          title={t.twists}
        >
          <Sparkles size={16} />
          <span>{t.twists}</span>
        </button>

        <button
          className="btn-action"
          onClick={onToggleLanguage}
          title={currentLanguage === 'en' ? 'החלף לעברית' : 'Switch to English'}
          style={{ fontWeight: 700 }}
        >
          <LangIcon size={16} />
          <span>{currentLanguage === 'en' ? 'עב' : 'EN'}</span>
        </button>

        <button
          className="btn-action"
          onClick={onOpenDaily}
          title={t.dailyChallenge}
        >
          <Calendar size={16} />
        </button>

        <button
          className="btn-action"
          onClick={onOpenStats}
          title={t.statistics}
        >
          <Trophy size={16} />
        </button>

        <button
          className="btn-action"
          onClick={onToggleMute}
          title={isMuted ? t.unmute : t.mute}
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>

        <button
          className={`btn-action ${!isMusicMuted ? 'btn-gold' : ''}`}
          onClick={onToggleMusic}
          title={isMusicMuted ? t.musicUnmute : t.musicMute}
        >
          <Music size={16} />
        </button>

        <button
          className="btn-action"
          onClick={onOpenSettings}
          title={t.settings}
        >
          <Settings size={16} />
        </button>
      </div>
    </header>
  );
};
