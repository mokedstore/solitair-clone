import React from 'react';
import { Sparkles, X, Check, Zap } from 'lucide-react';
import { TwistEngine } from '../../engine/twistEngine';
import { Translations } from '../../i18n/translations';

interface TwistsModalProps {
  isOpen: boolean;
  onClose: () => void;
  twistEngine: TwistEngine;
  onTriggerConsumable: (consumableId: string) => void;
  onToggleRelic: (relicId: string) => void;
  t: Translations;
}

export const TwistsModal: React.FC<TwistsModalProps> = ({
  isOpen,
  onClose,
  twistEngine,
  onTriggerConsumable,
  onToggleRelic,
  t,
}) => {
  if (!isOpen) return null;

  const relics = twistEngine.getRelics();
  const consumables = twistEngine.getConsumables();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles className="modal-icon" size={20} color="#d4af37" />
            <h2 className="modal-title">{t.twistsModalTitle}</h2>
          </div>
          <button className="btn-action" onClick={onClose} style={{ padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '0.88rem', color: '#b9ccbf', lineHeight: '1.4' }}>
            {t.twistsModalDesc}
          </p>

          {/* Passive Relics */}
          <div>
            <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#d4af37', marginBottom: '10px' }}>
              {t.passiveRelicsHeader}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {relics.map((relic) => {
                const localized = t.relics[relic.id as keyof typeof t.relics];
                const relicName = localized ? localized.name : relic.name;
                const relicDesc = localized ? localized.desc : relic.description;

                return (
                  <div
                    key={relic.id}
                    onClick={() => onToggleRelic(relic.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: relic.isActive ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                      border: relic.isActive ? '1px solid #d4af37' : '1px solid rgba(255, 255, 255, 0.1)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '1.4rem' }}>{relic.icon}</span>
                      <div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 700, color: relic.isActive ? '#f3e5ab' : '#fff' }}>
                          {relicName}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#9bb3a6' }}>
                          {relicDesc}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        background: relic.isActive ? '#d4af37' : 'transparent',
                        border: '1.5px solid #d4af37',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {relic.isActive && <Check size={14} color="#000" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Consumable Powers */}
          <div style={{ marginTop: '6px' }}>
            <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#d4af37', marginBottom: '10px' }}>
              {t.consumableSpellsHeader}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {consumables.map((item) => {
                const localized = t.consumables[item.id as keyof typeof t.consumables];
                const itemName = localized ? localized.name : item.name;
                const itemDesc = localized ? localized.desc : item.description;

                return (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '1.4rem' }}>{item.icon}</span>
                      <div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fff' }}>
                          {itemName}{' '}
                          <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 400 }}>
                            ({item.charges} {t.chargesLeft})
                          </span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#9bb3a6' }}>
                          {itemDesc}
                        </div>
                      </div>
                    </div>

                    <button
                      className="btn-action btn-gold"
                      disabled={item.charges <= 0}
                      onClick={() => {
                        onTriggerConsumable(item.id);
                        onClose();
                      }}
                    >
                      <Zap size={14} />
                      <span>{t.cast}</span>
                    </button>
                  </div>
                );
              })}
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
