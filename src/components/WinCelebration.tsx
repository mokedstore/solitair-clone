import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw } from 'lucide-react';
import { sound } from '../audio/soundManager';
import { Translations } from '../i18n/translations';

interface WinCelebrationProps {
  score: number;
  moves: number;
  timeSeconds: number;
  onPlayAgain: () => void;
  t: Translations;
}

export const WinCelebration: React.FC<WinCelebrationProps> = ({
  score,
  moves,
  timeSeconds,
  onPlayAgain,
  t,
}) => {
  useEffect(() => {
    sound.playWinFanfare();

    // Trigger celebratory confetti fireworks
    const duration = 3.5 * 1000;
    const animationEnd = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#d4af37', '#f3e5ab', '#4ade80', '#ffffff'],
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#d4af37', '#f3e5ab', '#4ade80', '#ffffff'],
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="win-celebration-banner">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Trophy size={32} color="#d4af37" />
        <h2 className="win-title">{t.victoryTitle}</h2>
      </div>

      <p style={{ color: '#d1e7dd', fontSize: '1.05rem', fontWeight: 500 }}>
        {t.victorySubtitle}
      </p>

      <div style={{ display: 'flex', gap: '24px', margin: '10px 0' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#9bb3a6' }}>{t.finalScore}</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f3e5ab' }}>{score}</div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#9bb3a6' }}>{t.totalMoves}</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>{moves}</div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#9bb3a6' }}>{t.clearTime}</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#4ade80' }}>{formatTime(timeSeconds)}</div>
        </div>
      </div>

      <button className="btn-action btn-gold" onClick={onPlayAgain} style={{ padding: '10px 24px', fontSize: '1rem' }}>
        <RotateCcw size={18} />
        <span>{t.playAnother}</span>
      </button>
    </div>
  );
};
