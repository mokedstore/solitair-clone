import { Card, HintMove } from './types';
import { canMoveCards, isValidMove, findCompletedSuit } from './spiderEngine';

export function findBestHint(columns: Card[][], stockRemaining: number): HintMove | null {
  const possibleMoves: HintMove[] = [];

  // Iterate over all source columns
  for (let fromCol = 0; fromCol < columns.length; fromCol++) {
    const col = columns[fromCol];
    if (col.length === 0) continue;

    // Find the first face-up card in this column
    const firstFaceUpIdx = col.findIndex(c => c.isFaceUp);
    if (firstFaceUpIdx === -1) continue;

    // Check every valid sub-sequence from firstFaceUpIdx to length - 1
    for (let cardIdx = firstFaceUpIdx; cardIdx < col.length; cardIdx++) {
      if (!canMoveCards(col, cardIdx)) continue;

      const cardsToMove = col.slice(cardIdx);
      const movingCard = cardsToMove[0];

      // Check all potential target columns
      for (let toCol = 0; toCol < columns.length; toCol++) {
        if (fromCol === toCol) continue;
        const targetCol = columns[toCol];

        if (!isValidMove(cardsToMove, targetCol)) continue;

        // Calculate strategic weight
        let weight = 0;
        let reason = '';

        // 1. Check if this move completes a suit
        const simulatedTarget = [...targetCol, ...cardsToMove];
        const completed = findCompletedSuit(simulatedTarget);
        if (completed) {
          weight += 1000;
          reason = `Completes the ${completed.suit} suit!`;
        }

        // 2. Check if moving uncovers a face-down card in fromColumn
        const uncoversCard = cardIdx > 0 && !col[cardIdx - 1].isFaceUp;
        if (uncoversCard) {
          weight += 400;
          if (!reason) reason = 'Uncovers a hidden card';
        }

        // 3. Same suit alignment check
        const isSameSuit = targetCol.length > 0 && targetCol[targetCol.length - 1].suit === movingCard.suit;
        if (isSameSuit) {
          weight += 250;
          if (!reason) reason = `Consolidates ${movingCard.suit} sequence`;
        } else if (targetCol.length > 0) {
          // Cross-suit move
          weight += 50;
          if (!reason) reason = 'Builds sequence onto ' + targetCol[targetCol.length - 1].suit;
        }

        // 4. Empty column logic
        const emptiesColumn = cardIdx === 0 && col.length === cardsToMove.length;
        if (targetCol.length === 0) {
          if (movingCard.rank === 13) {
            // Moving a King to empty column is great if it uncovers something
            if (uncoversCard) {
              weight += 300;
              reason = 'Moves King to open column and reveals hidden card';
            } else {
              weight += 80;
              reason = 'Parks King in open column';
            }
          } else {
            // Moving non-King to empty column is only slightly useful if it uncovers a card
            if (uncoversCard) {
              weight += 120;
              reason = 'Frees up hidden card using open column';
            } else {
              weight -= 100; // Usually undesirable to waste an empty column for non-King without uncover
            }
          }
        }

        // Prioritize moving longer sequences
        weight += cardsToMove.length * 5;

        // Avoid pointless loops (e.g. moving single card back and forth between identical ranks)
        if (cardIdx === firstFaceUpIdx && !uncoversCard && targetCol.length > 0) {
          const prevCardInSource = cardIdx > 0 ? col[cardIdx - 1] : null;
          if (prevCardInSource && prevCardInSource.isFaceUp && prevCardInSource.rank === movingCard.rank + 1) {
            if (prevCardInSource.suit === movingCard.suit && !isSameSuit) {
              weight -= 300; // Breaking a same-suit run to make a cross-suit run is bad
            }
          }
        }

        possibleMoves.push({
          fromColumn: fromCol,
          toColumn: toCol,
          cardIndex: cardIdx,
          cardsToMove: cardsToMove.length,
          isSameSuit,
          uncoversCard,
          emptiesColumn,
          createsCompleteSuit: !!completed,
          scoreWeight: weight,
          reason: reason || 'Valid strategic move',
        });
      }
    }
  }

  if (possibleMoves.length === 0) {
    if (stockRemaining > 0) {
      return null; // Signals to deal from stock
    }
    return null;
  }

  // Sort descending by score weight
  possibleMoves.sort((a, b) => b.scoreWeight - a.scoreWeight);
  return possibleMoves[0];
}
