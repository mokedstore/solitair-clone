import React, { useState } from 'react';
import { Trophy, X, Globe, Smartphone, Monitor, Trash2, MapPin } from 'lucide-react';
import { GameStats, SuitMode } from '../../engine/types';
import { Translations } from '../../i18n/translations';
import { getStoredOriginRecords, PlayerOriginRecord } from '../../engine/geoTracker';

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
  const [activeTab, setActiveTab] = useState<'overall' | SuitMode | 'origins'>('overall');
  const [origins, setOrigins] = useState<PlayerOriginRecord[]>(() => getStoredOriginRecords());

  if (!isOpen) return null;

  const currentStats =
    activeTab === 'overall' || activeTab === 'origins'
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

  const getTabLabel = (tab: 'overall' | SuitMode | 'origins') => {
    if (tab === 'overall') return t.tabOverall;
    if (tab === 1) return t.tab1Suit;
    if (tab === 2) return t.tab2Suits;
    if (tab === 4) return t.tab4Suits;
    return t.tabOrigins;
  };

  const handleClearOrigins = () => {
    if (window.confirm(t.clearLog + '?')) {
      localStorage.removeItem('ssp_player_origins_log');
      setOrigins([]);
    }
  };

  const formatTimestamp = (ts: number) => {
    const d = new Date(ts);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
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
            {(['overall', 1, 2, 4, 'origins'] as const).map((tab) => (
              <button
                key={tab}
                className={`btn-action ${activeTab === tab ? 'btn-gold' : ''}`}
                style={{ flex: 1, padding: '6px 4px', fontSize: '0.78rem' }}
                onClick={() => {
                  setActiveTab(tab);
                  if (tab === 'origins') {
                    setOrigins(getStoredOriginRecords());
                  }
                }}
              >
                {getTabLabel(tab)}
              </button>
            ))}
          </div>

          {/* Player Origins View */}
          {activeTab === 'origins' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {origins.length > 0 ? (
                <>
                  {/* Latest Detected Location Spotlight */}
                  <div
                    style={{
                      background: 'rgba(212, 175, 55, 0.1)',
                      border: '1px solid rgba(212, 175, 55, 0.35)',
                      borderRadius: '8px',
                      padding: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.8rem', lineHeight: 1 }}>{origins[0].flag}</span>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#d4af37', textTransform: 'uppercase', fontWeight: 700 }}>
                          {t.detectedLocation}
                        </div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
                          {origins[0].city}, {origins[0].country}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '4px',
                          background: origins[0].source === 'Facebook' ? '#1877f2' : 'rgba(255,255,255,0.1)',
                          color: '#fff',
                        }}
                      >
                        {origins[0].source}
                      </span>
                    </div>
                  </div>

                  {/* List of Recent Visits */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#9bb3a6' }}>
                      {t.recentVisitors} ({origins.length})
                    </span>
                    <button
                      className="btn-action"
                      style={{ padding: '4px 8px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px', color: '#f87171' }}
                      onClick={handleClearOrigins}
                    >
                      <Trash2 size={12} />
                      <span>{t.clearLog}</span>
                    </button>
                  </div>

                  <div
                    style={{
                      maxHeight: '220px',
                      overflowY: 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      paddingRight: '4px',
                    }}
                  >
                    {origins.map((rec) => (
                      <div
                        key={rec.id}
                        style={{
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '6px',
                          padding: '8px 10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1.3rem' }}>{rec.flag}</span>
                          <div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fff' }}>
                              {rec.city}, {rec.country}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#8da496', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {rec.device === 'mobile' ? <Smartphone size={12} /> : <Monitor size={12} />}
                              <span>{rec.device}</span>
                              <span>•</span>
                              <span style={{ color: rec.source === 'Facebook' ? '#42e8ff' : '#aaa', fontWeight: rec.source === 'Facebook' ? 700 : 400 }}>
                                {rec.source}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#778' }}>
                          {formatTimestamp(rec.timestamp)}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px', color: '#8da496', fontSize: '0.9rem' }}>
                  <Globe size={32} style={{ opacity: 0.4, marginBottom: '8px' }} />
                  <div>{t.noVisitorsYet}</div>
                </div>
              )}
            </div>
          ) : (
            /* Stats Grid */
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
          )}
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          {activeTab !== 'origins' ? (
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
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#8da496' }}>
              <MapPin size={14} color="#d4af37" />
              <span>IP Geolocation Active</span>
            </div>
          )}
          <button className="btn-action btn-gold" onClick={onClose}>
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
