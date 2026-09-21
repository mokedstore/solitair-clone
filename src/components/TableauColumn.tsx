import React, { useMemo } from 'react';
import { Card } from '../engine/types';
import { CardView } from './CardView';
import { canMoveCards } from '../engine/spiderEngine';
import { TwistEngine } from '../engine/twistEngine';

interface TableauColumnProps {
  columnIndex: number;
  cards: Card[];
  isValidDropTarget: boolean;
  selectedCardIndex: number | null;
  hintedCardIndex: number | null;
  twistEngine: TwistEngine;
  deckTheme?: string;
  onCardClick: (columnIndex: number, cardIndex: number) => void;
  onDragStart: (columnIndex: number, cardIndex: number, e: React.PointerEvent) => void;
  onColumnClick: (columnIndex: number) => void;
}

export const TableauColumn: React.FC<TableauColumnProps> = ({
  columnIndex,
  cards,
  isValidDropTarget,
  selectedCardIndex,
  hintedCardIndex,
  twistEngine,
  deckTheme,
  onCardClick,
  onDragStart,
  onColumnClick,
}) => {
  // Calculate dynamic vertical offsets to handle long columns cleanly
  const offsets = useMemo(() => {
    const result: number[] = [];
    let currentY = 0;

    const totalCards = cards.length;
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 480;
    const isTablet = typeof window !== 'undefined' && window.innerWidth <= 768;

    // Dynamic compression if column is deep or on mobile
    const downSpacing = isMobile
      ? (totalCards > 14 ? 6 : 8)
      : (totalCards > 16 ? 8 : 12);

    const upSpacing = isMobile
      ? (totalCards > 14 ? 14 : totalCards > 10 ? 16 : 18)
      : isTablet
      ? (totalCards > 14 ? 15 : totalCards > 10 ? 18 : 22)
      : (totalCards > 16 ? 18 : totalCards > 12 ? 22 : 26);

    for (let i = 0; i < totalCards; i++) {
      result.push(currentY);
      if (cards[i].isFaceUp) {
        currentY += upSpacing;
      } else {
        currentY += downSpacing;
      }
    }
    return result;
  }, [cards]);

  const isEmpty = cards.length === 0;

  return (
    <div
      className={`tableau-col ${isEmpty ? 'empty-slot-placeholder' : ''} ${
        isValidDropTarget ? 'valid-drop-target' : ''
      }`}
      onClick={() => isEmpty && onColumnClick(columnIndex)}
    >
      {cards.map((card, idx) => {
        const canMove = twistEngine.isEnabled()
          ? twistEngine.canMoveCardsWithRelics(cards, idx)
          : canMoveCards(cards, idx);

        const isSelected = selectedCardIndex !== null && idx >= selectedCardIndex;
        const isHinted = hintedCardIndex === idx;
        const isSpectralRevealed = twistEngine.shouldRevealUnderneath(columnIndex, idx, cards);

        return (
          <CardView
            key={card.id}
            card={card}
            topOffset={offsets[idx]}
            isSelected={isSelected}
            isHinted={isHinted}
            isSpectralRevealed={isSpectralRevealed}
            deckTheme={deckTheme}
            onClick={(e) => {
              e.stopPropagation();
              onCardClick(columnIndex, idx);
            }}
            onPointerDown={(e) => {
              if (canMove && e.button === 0) {
                onDragStart(columnIndex, idx, e);
              }
            }}
          />
        );
      })}
    </div>
  );
};
