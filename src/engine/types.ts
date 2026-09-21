export type Suit = 'spades' | 'hearts' | 'clubs' | 'diamonds';

export type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
  isFaceUp: boolean;
  isCompleted?: boolean;
  modifierTags?: string[];
}

export type SuitMode = 1 | 2 | 4;

export interface Move {
  fromColumn: number;
  toColumn: number;
  cardCount: number;
  flippedUnderneath: boolean;
  completedSuit?: {
    suit: Suit;
    columnIndex: number;
  };
}

export interface MoveHistoryState {
  columns: Card[][];
  stock: Card[][]; // 5 deals of 10 cards each
  completedSuits: Suit[];
  score: number;
  moveCount: number;
  lastMoveDescription?: string;
}

export type Language = 'en' | 'he';

export interface GameSettings {
  language: Language;
  suitMode: SuitMode;
  relaxedDealing: boolean; // Allow dealing onto empty columns
  soundEnabled: boolean;
  soundVolume: number;
  musicEnabled: boolean;
  musicVolume: number;
  autoMoveOnComplete: boolean;
  twistsEnabled: boolean;
  deckTheme: string;
}

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  bestStreak: number;
  bestScore: number;
  bestTimeSeconds: number | null;
  modeStats: Record<SuitMode, {
    played: number;
    won: number;
    bestScore: number;
    bestTimeSeconds: number | null;
  }>;
}

export interface HintMove {
  fromColumn: number;
  toColumn: number;
  cardIndex: number;
  cardsToMove: number;
  isSameSuit: boolean;
  uncoversCard: boolean;
  emptiesColumn: boolean;
  createsCompleteSuit: boolean;
  scoreWeight: number;
  reason: string;
}

// Progressive Twist Architecture Interfaces
export interface TwistRelic {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'legendary';
  isActive: boolean;
  effectType: 'move_relaxation' | 'stock_enhancement' | 'score_multiplier' | 'xray_vision';
}

export interface TwistConsumable {
  id: string;
  name: string;
  description: string;
  icon: string;
  charges: number;
  actionType: 'wildcard' | 'shuffle_column' | 'suit_converter' | 'reveal_hidden';
}
