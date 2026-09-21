import React from 'react';
import { Card } from '../engine/types';
import { getRankLabel, getSuitSymbol, isRedSuit } from '../engine/spiderEngine';
import { getDeckDefinition } from '../engine/decks';

interface CardViewProps {
  card: Card;
  topOffset: number;
  isSelected?: boolean;
  isHinted?: boolean;
  isSpectralRevealed?: boolean;
  isDragging?: boolean;
  deckTheme?: string;
  onClick?: (e: React.MouseEvent) => void;
  onPointerDown?: (e: React.PointerEvent) => void;
}

export const CardView: React.FC<CardViewProps> = ({
  card,
  topOffset,
  isSelected,
  isHinted,
  isSpectralRevealed,
  isDragging,
  deckTheme = 'classic',
  onClick,
  onPointerDown,
}) => {
  const isRed = isRedSuit(card.suit);
  const suitSym = getSuitSymbol(card.suit);
  const rankStr = getRankLabel(card.rank);
  const deck = getDeckDefinition(deckTheme);
  const isCustom = deck.isCustomSvg;

  // If face down and not revealed by spectral relic
  if (!card.isFaceUp && !isSpectralRevealed) {
    return (
      <div
        className={`card-item face-down ${isCustom ? 'custom-deck' : ''}`}
        style={{
          top: `${topOffset}px`,
          zIndex: Math.floor(topOffset / 5),
        }}
      >
        {isCustom && deck.cardBackUrl ? (
          <img
            src={deck.cardBackUrl}
            alt="Card Back"
            className="card-face-img"
            draggable={false}
          />
        ) : null}
      </div>
    );
  }

  // Face-down card revealed by Spectral Lens
  if (!card.isFaceUp && isSpectralRevealed) {
    return (
      <div
        className={`card-item spectral-revealed ${isCustom ? 'custom-deck' : ''}`}
        style={{
          top: `${topOffset}px`,
          zIndex: Math.floor(topOffset / 5),
        }}
      >
        {isCustom && deck.getCardUrl ? (
          <>
            <img
              src={deck.getCardUrl(card.suit, card.rank)}
              alt="Spectral Card"
              className="card-face-img"
              draggable={false}
            />
            <div className="card-court-icon" style={{ zIndex: 2, textShadow: '0 0 8px #9c27b0' }}>🔮</div>
          </>
        ) : (
          <div className={`card-content ${isRed ? 'card-red' : 'card-black'}`}>
            <div className="card-corner top">
              <span>{rankStr}</span>
              <span>{suitSym}</span>
            </div>
            <div className="card-court-icon">🔮</div>
            <div className="card-corner bottom">
              <span>{rankStr}</span>
              <span>{suitSym}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Regular Face-Up Card
  const classNames = [
    'card-item',
    isCustom ? 'custom-deck' : '',
    isSelected ? 'selected' : '',
    isHinted ? 'hint-highlight' : '',
    isDragging ? 'dragging' : '',
  ].filter(Boolean).join(' ');

  const isCourt = card.rank >= 11;

  return (
    <div
      className={classNames}
      style={{
        top: `${topOffset}px`,
        zIndex: isSelected || isDragging ? 100 : Math.floor(topOffset / 5),
      }}
      onClick={onClick}
      onPointerDown={onPointerDown}
    >
      {isCustom && deck.getCardUrl ? (
        <img
          src={deck.getCardUrl(card.suit, card.rank)}
          alt={`${rankStr} of ${card.suit}`}
          className="card-face-img"
          draggable={false}
        />
      ) : (
        <div className={`card-content ${isRed ? 'card-red' : 'card-black'}`}>
          <div className="card-corner top">
            <span>{rankStr}</span>
            <span>{suitSym}</span>
          </div>

          {isCourt ? (
            <div className="card-court-icon">{rankStr}</div>
          ) : (
            <div className="card-center-pip">{suitSym}</div>
          )}

          <div className="card-corner bottom">
            <span>{rankStr}</span>
            <span>{suitSym}</span>
          </div>
        </div>
      )}
    </div>
  );
};
