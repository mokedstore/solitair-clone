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
  onCardClick,
  onDragStart,
  onColumnClick,
}) => {
  // Calculate dynamic vertical offsets to handle long columns cleanly
  const offsets = useMemo(() => {
    const result: number[] = [];
    let currentY = 0;

    const totalCards = cards.length;
    // Dynamic compression if column is very deep
    const downSpacing = totalCards > 16 ? 8 : 12;
    const upSpacing = totalCards > 16 ? 18 : totalCards > 12 ? 22 : 26;

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
