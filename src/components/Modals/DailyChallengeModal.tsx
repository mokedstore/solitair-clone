import React, { useState } from 'react';
import { Calendar, Share2, Check, Play, X } from 'lucide-react';
import { getDailySeedString } from '../../engine/rng';
import { SuitMode } from '../../engine/types';
import { Translations } from '../../i18n/translations';

interface DailyChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayDaily: (seed: string, dateStr: string) => void;
  suitMode: SuitMode;
  t: Translations;
}

export const DailyChallengeModal: React.FC<DailyChallengeModalProps> = ({
  isOpen,
  onClose,
  onPlayDaily,
  suitMode,
  t,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const dateObj = new Date(selectedDate + 'T00:00:00');
  const seedString = getDailySeedString(dateObj, suitMode);

  const handleCopyLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('seed', seedString);
    navigator.clipboard.writeText(url.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleStartChallenge = () => {
    onPlayDaily(seedString, selectedDate);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar className="modal-icon" size={20} color="#d4af37" />
            <h2 className="modal-title">{t.dailyTitle}</h2>
          </div>
          <button className="btn-action" onClick={onClose} style={{ padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '0.9rem', color: '#b9ccbf', lineHeight: '1.4' }}>
            {t.dailyDesc}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.82rem', color: '#d4af37', fontWeight: 600 }}>
              {t.selectDate}
            </label>
            <input
              type="date"
              value={selectedDate}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                borderRadius: '6px',
                padding: '8px 12px',
                color: '#fff',
                fontSize: '0.95rem',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <div
            style={{
              background: 'rgba(212, 175, 55, 0.08)',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              borderRadius: '8px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#9bb3a6' }}>
                {t.deckSeed}
              </div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f3e5ab' }}>
                {seedString}
              </div>
            </div>

            <button
              className="btn-action"
              onClick={handleCopyLink}
              title={t.shareSeed}
            >
              {copied ? <Check size={16} color="#4ade80" /> : <Share2 size={16} />}
              <span>{copied ? t.copied : t.shareSeed}</span>
            </button>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-action" onClick={onClose}>
            {t.cancel}
          </button>
          <button className="btn-action btn-gold" onClick={handleStartChallenge}>
            <Play size={16} />
            <span>{t.playChallenge}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
