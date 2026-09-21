import React from 'react';
import { Suit } from '../engine/types';
import { getSuitSymbol, isRedSuit } from '../engine/spiderEngine';
import { Translations } from '../i18n/translations';

interface StockAndFoundationsProps {
  completedSuits: Suit[];
  stockPacksRemaining: number;
  onDealStock: () => void;
  canDealStock: boolean;
  emptyColumnCount: number;
  relaxedDealing: boolean;
  t: Translations;
}

export const StockAndFoundations: React.FC<StockAndFoundationsProps> = ({
  completedSuits,
  stockPacksRemaining,
  onDealStock,
  canDealStock,
  emptyColumnCount,
  relaxedDealing,
  t,
}) => {
  return (
    <div className="table-shelf">
      {/* Foundations Tray (8 Completed Suit Slots) */}
      <div className="foundations-tray" title={t.completedSuitsTitle}>
        {Array.from({ length: 8 }).map((_, idx) => {
          const completedSuit = completedSuits[idx];
          const isCompleted = !!completedSuit;
          const isRed = completedSuit ? isRedSuit(completedSuit) : false;

          return (
            <div
              key={idx}
              className={`foundation-slot ${isCompleted ? 'completed' : ''}`}
              title={isCompleted ? t.completedRunTitle(completedSuit) : t.emptyFoundation}
            >
              {isCompleted ? (
                <div className={`card-content ${isRed ? 'card-red' : 'card-black'}`} style={{ padding: '2px' }}>
                  <div className="card-corner top" style={{ fontSize: '0.8rem' }}>
                    <span>K</span>
                    <span>{getSuitSymbol(completedSuit)}</span>
                  </div>
                  <div className="card-court-icon" style={{ fontSize: '1.2rem', opacity: 0.9 }}>
                    👑
                  </div>
                </div>
              ) : (
                <span>♠</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Stock Pile */}
      <div
        className="stock-container"
        onClick={() => canDealStock && onDealStock()}
        title={
          stockPacksRemaining === 0
            ? t.stockEmpty
            : !relaxedDealing && emptyColumnCount > 0
            ? t.stockFillWarning(emptyColumnCount)
            : t.stockDealTooltip(stockPacksRemaining)
        }
      >
        <div className="stock-pile-stack">
          {Array.from({ length: stockPacksRemaining }).map((_, idx) => (
            <div
              key={idx}
              className="stock-card-back"
              style={{
                top: `-${idx * 2}px`,
                left: `-${idx * 2}px`,
              }}
            />
          ))}

          {stockPacksRemaining > 0 && (
            <div className="stock-counter-badge">
              {stockPacksRemaining}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
