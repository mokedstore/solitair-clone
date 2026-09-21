import React, { useState } from 'react';
import { Trophy, X } from 'lucide-react';
import { GameStats, SuitMode } from '../../engine/types';
import { Translations } from '../../i18n/translations';

interface StatisticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: GameStats;
  onResetStats: () => void;
  t: Translations;
}

export const StatisticsModal: React.FC<StatisticsModalProps> = ({
  isOpen,
  onClose,
  stats,
  onResetStats,
  t,
}) => {
  const [activeTab, setActiveTab] = useState<'overall' | SuitMode>('overall');

  if (!isOpen) return null;

  const currentStats =
    activeTab === 'overall'
      ? {
          played: stats.gamesPlayed,
          won: stats.gamesWon,
          bestScore: stats.bestScore,
          bestTime: stats.bestTimeSeconds,
        }
      : {
          played: stats.modeStats[activeTab].played,
          won: stats.modeStats[activeTab].won,
          bestScore: stats.modeStats[activeTab].bestScore,
          bestTime: stats.modeStats[activeTab].bestTimeSeconds,
        };

  const winRate =
    currentStats.played > 0
      ? Math.round((currentStats.won / currentStats.played) * 100)
      : 0;

  const formatTime = (secs: number | null) => {
    if (secs === null) return '--:--';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const getTabLabel = (tab: 'overall' | SuitMode) => {
    if (tab === 'overall') return t.tabOverall;
    if (tab === 1) return t.tab1Suit;
    if (tab === 2) return t.tab2Suits;
    return t.tab4Suits;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trophy className="modal-icon" size={20} color="#d4af37" />
            <h2 className="modal-title">{t.statsTitle}</h2>
          </div>
          <button className="btn-action" onClick={onClose} style={{ padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Tab Filter */}
          <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
            {(['overall', 1, 2, 4] as const).map((tab) => (
              <button
                key={tab}
                className={`btn-action ${activeTab === tab ? 'btn-gold' : ''}`}
                style={{ flex: 1, padding: '6px 4px', fontSize: '0.78rem' }}
                onClick={() => setActiveTab(tab)}
              >
                {getTabLabel(tab)}
              </button>
            ))}
          </div>

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#9bb3a6' }}>{t.played}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff' }}>{currentStats.played}</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#9bb3a6' }}>{t.won}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#4ade80' }}>{currentStats.won}</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#9bb3a6' }}>{t.winRate}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f3e5ab' }}>{winRate}%</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#9bb3a6' }}>{t.bestScore}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#d4af37' }}>{currentStats.bestScore}</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#9bb3a6' }}>{t.bestTime}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff' }}>{formatTime(currentStats.bestTime)}</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#9bb3a6' }}>{t.bestStreak}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f59e0b' }}>{stats.bestStreak}</div>
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button
            className="btn-action"
            style={{ color: '#f87171', borderColor: 'rgba(248,113,113,0.3)' }}
            onClick={() => {
              if (window.confirm(t.resetConfirm)) {
                onResetStats();
              }
            }}
          >
            {t.resetStats}
          </button>
          <button className="btn-action btn-gold" onClick={onClose}>
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
