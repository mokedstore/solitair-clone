import { Suit, Rank } from './types';

export interface DeckDefinition {
  id: string;
  name: string;
  nameHe: string;
  description: string;
  descriptionHe: string;
  isCustomSvg: boolean;
  cardBackUrl: string;
  previewUrl: string;
  badge?: string;
  badgeHe?: string;
  isAvailable: boolean;
  tableTheme: 'casino' | 'celestial';
  getCardUrl?: (suit: Suit, rank: Rank) => string;
}

/**
 * Standard SVG naming resolver for custom decks:
 * 1 = ace_of_${suit}_front.svg
 * 2-9 = 0${rank}_of_${suit}_front.svg
 * 10 = 10_of_${suit}_front.svg
 * 11 = jack_of_${suit}_front.svg
 * 12 = queen_of_${suit}_front.svg
 * 13 = king_of_${suit}_front.svg
 */
export function getDeckCardSvgUrl(deckFolder: string, suit: Suit, rank: Rank): string {
  let rankStr: string;
  if (rank === 1) {
    rankStr = 'ace';
  } else if (rank === 11) {
    rankStr = 'jack';
  } else if (rank === 12) {
    rankStr = 'queen';
  } else if (rank === 13) {
    rankStr = 'king';
  } else if (rank < 10) {
    rankStr = `0${rank}`;
  } else {
    rankStr = `${rank}`;
  }

  return `/decks/${deckFolder}/fronts/${rankStr}_of_${suit}_front.svg`;
}

/**
 * Registry of all available decks in Spider Solitaire Prime.
 * TO ADD A NEW DECK:
 * 1. Place SVGs/images inside `public/decks/<deck-id>/` (fronts/ and card_back.svg)
 * 2. Add an entry to AVAILABLE_DECKS below with `isAvailable: true`
 */
export const AVAILABLE_DECKS: DeckDefinition[] = [
  {
    id: 'classic',
    name: 'Royal Classic',
    nameHe: 'קלאסי מלכותי',
    description: 'Crisp vector playing cards with luxurious gold borders and emerald felt.',
    descriptionHe: 'קלפי משחק וקטוריים אלגנטיים עם מסגרת מוזהבת ולבד ירוק עשיר.',
    isCustomSvg: false,
    cardBackUrl: '',
    previewUrl: '',
    badge: 'CLASSIC',
    badgeHe: 'קלאסי',
    isAvailable: true,
    tableTheme: 'casino',
  },
  {
    id: 'royal_heritage',
    name: 'Royal Heritage',
    nameHe: 'מורשת מלכותית',
    description: 'Traditional ivory faces, illustrated mirrored court figures, ornamental gold & sapphire back.',
    descriptionHe: 'קלפי שנהב מסורתיים, דמויות מלוכה מאוירות וגב קלף מלכותי בכחול וזהב.',
    isCustomSvg: true,
    cardBackUrl: '/decks/royal_heritage/card_back.svg',
    previewUrl: '/decks/royal_heritage/deck_preview.jpg',
    badge: 'ILLUSTRATED',
    badgeHe: 'מאויר',
    isAvailable: true,
    tableTheme: 'casino',
    getCardUrl: (suit, rank) => getDeckCardSvgUrl('royal_heritage', suit, rank),
  },
  {
    id: 'celestial',
    name: 'Celestial Neon',
    nameHe: 'נאון קוסמי',
    description: 'Cybernetic neon constellations, radiant cyan and magenta glow, deep space void.',
    descriptionHe: 'מערכות כוכבים בנאון קיברנטי, זוהר ציאן ומגנטה, וערפיליות חלל עמוק.',
    isCustomSvg: true,
    cardBackUrl: '/decks/celestial/card_back.svg',
    previewUrl: '/decks/celestial/deck_preview.jpg',
    badge: 'CYBERPUNK',
    badgeHe: 'סייברפאנק',
    isAvailable: true,
    tableTheme: 'celestial',
    getCardUrl: (suit, rank) => getDeckCardSvgUrl('celestial', suit, rank),
  },
  {
    id: 'upcoming',
    name: 'Custom Studio',
    nameHe: 'חפיסת מופת חדשה',
    description: 'A brand new custom designed deck currently in development. Coming soon!',
    descriptionHe: 'חפיסה חדשה בעיצוב מקורי שנמצאת כעת בפיתוח. בקרוב!',
    isCustomSvg: false,
    cardBackUrl: '',
    previewUrl: '',
    badge: 'COMING SOON',
    badgeHe: 'בקרוב',
    isAvailable: false,
    tableTheme: 'casino',
  },
];

export const DEFAULT_DECK_ID = 'classic';

export function getDeckDefinition(deckId?: string): DeckDefinition {
  const found = AVAILABLE_DECKS.find((d) => d.id === deckId);
  return found || AVAILABLE_DECKS[0];
}

export function getCardFrontAsset(deckId: string, suit: Suit, rank: Rank): string | null {
  const deck = getDeckDefinition(deckId);
  if (deck.isCustomSvg && deck.getCardUrl) {
    return deck.getCardUrl(suit, rank);
  }
  return null;
}

export function getCardBackAsset(deckId: string): string | null {
  const deck = getDeckDefinition(deckId);
  if (deck.isCustomSvg && deck.cardBackUrl) {
    return deck.cardBackUrl;
  }
  return null;
}
