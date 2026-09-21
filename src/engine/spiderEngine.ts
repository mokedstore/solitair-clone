import { Card, Rank, Suit, SuitMode } from './types';
import { SeededRNG } from './rng';

export interface DealResult {
  columns: Card[][];
  stock: Card[][];
}

// Generate the 104 cards based on chosen suit mode
export function createSpiderDeck(suitMode: SuitMode): Card[] {
  const cards: Card[] = [];
  let suitDistribution: Suit[];

  if (suitMode === 1) {
    // 8 decks of spades
    suitDistribution = Array(8).fill('spades');
  } else if (suitMode === 2) {
    // 4 decks of spades, 4 decks of hearts
    suitDistribution = [...Array(4).fill('spades'), ...Array(4).fill('hearts')];
  } else {
    // 2 decks of each suit
    suitDistribution = [
      ...Array(2).fill('spades'),
      ...Array(2).fill('hearts'),
      ...Array(2).fill('clubs'),
      ...Array(2).fill('diamonds'),
    ];
  }

  let counter = 0;
  for (const suit of suitDistribution) {
    for (let r = 1; r <= 13; r++) {
      cards.push({
        id: `card-${suit}-${r}-${counter++}`,
        suit,
        rank: r as Rank,
        isFaceUp: false,
      });
    }
  }

  return cards;
}

// Deal the initial Spider Solitaire board (54 tableau cards, 50 stock cards in 5 packs of 10)
export function dealNewGame(suitMode: SuitMode, seedString: string): DealResult {
  const rng = new SeededRNG(seedString);
  const deck = rng.shuffle(createSpiderDeck(suitMode));

  const columns: Card[][] = Array.from({ length: 10 }, () => []);
  let cardIdx = 0;

  // First 4 columns get 6 cards each (5 down, 1 up)
  // Remaining 6 columns get 5 cards each (4 down, 1 up)
  for (let c = 0; c < 10; c++) {
    const count = c < 4 ? 6 : 5;
    for (let i = 0; i < count; i++) {
      const card = { ...deck[cardIdx++] };
      card.isFaceUp = i === count - 1; // Top card face-up
      columns[c].push(card);
    }
  }

  // Remaining 50 cards go into 5 stock deals of 10 cards each
  const stock: Card[][] = [];
  for (let s = 0; s < 5; s++) {
    const pack: Card[] = [];
    for (let c = 0; c < 10; c++) {
      pack.push({ ...deck[cardIdx++], isFaceUp: true });
    }
    stock.push(pack);
  }

  return { columns, stock };
}

// Check if a group of cards starting at index in a column forms a valid movable run
// In Spider: A movable sequence must be descending by 1 in rank AND of the EXACT SAME SUIT
export function canMoveCards(column: Card[], startIndex: number): boolean {
  if (startIndex < 0 || startIndex >= column.length) return false;
  if (!column[startIndex].isFaceUp) return false;

  for (let i = startIndex; i < column.length - 1; i++) {
    const current = column[i];
    const next = column[i + 1];

    if (!next.isFaceUp) return false;
    if (next.suit !== current.suit) return false;
    if (current.rank - 1 !== next.rank) return false;
  }

  return true;
}

// Check if moving a sequence of cards to target column is valid
export function isValidMove(
  cardsToMove: Card[],
  targetColumn: Card[]
): boolean {
  if (cardsToMove.length === 0) return false;

  // Empty column can accept any card or sequence
  if (targetColumn.length === 0) return true;

  const targetCard = targetColumn[targetColumn.length - 1];
  const movingCard = cardsToMove[0];

  // Moving card must be exactly 1 rank lower than target card (regardless of suit)
  return targetCard.rank === movingCard.rank + 1;
}

// Check for completed King-to-Ace runs of the same suit in a column
// Returns the completed run information if found
export function findCompletedSuit(column: Card[]): { suit: Suit; startIndex: number } | null {
  if (column.length < 13) return null;

  // Check from the end of the column backwards
  const topCard = column[column.length - 1];
  if (!topCard.isFaceUp || topCard.rank !== 1) return null; // Must end in Ace (rank 1)

  const suit = topCard.suit;

  // Verify full sequence from Ace up to King (1 to 13)
  for (let offset = 0; offset < 13; offset++) {
    const idx = column.length - 1 - offset;
    const card = column[idx];

    if (!card.isFaceUp) return null;
    if (card.suit !== suit) return null;
    if (card.rank !== offset + 1) return null;
  }

  return {
    suit,
    startIndex: column.length - 13,
  };
}

// Calculate rank display string
export function getRankLabel(rank: Rank): string {
  switch (rank) {
    case 1: return 'A';
    case 11: return 'J';
    case 12: return 'Q';
    case 13: return 'K';
    default: return rank.toString();
  }
}

// Get suit symbol
export function getSuitSymbol(suit: Suit): string {
  switch (suit) {
    case 'spades': return '♠';
    case 'hearts': return '♥';
    case 'clubs': return '♣';
    case 'diamonds': return '♦';
  }
}

// Get suit color
export function isRedSuit(suit: Suit): boolean {
  return suit === 'hearts' || suit === 'diamonds';
}
