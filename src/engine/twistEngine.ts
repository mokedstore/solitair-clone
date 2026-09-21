import { Card, TwistRelic, TwistConsumable } from './types';

// Registry of Balatro / Roguelike-style Relics
export const AVAILABLE_RELICS: TwistRelic[] = [
  {
    id: 'silk_thread',
    name: 'Silk Thread',
    description: 'Allows dragging a descending sequence even if it has 1 suit transition.',
    icon: '🕸️',
    rarity: 'common',
    isActive: false,
    effectType: 'move_relaxation',
  },
  {
    id: 'xray_lens',
    name: 'Spectral Lens',
    description: 'Reveals the hidden face-down card directly beneath the top face-up card.',
    icon: '🔮',
    rarity: 'rare',
    isActive: false,
    effectType: 'xray_vision',
  },
  {
    id: 'golden_web',
    name: 'Golden Web',
    description: 'Earn 2x bonus points (+200 instead of +100) whenever you complete a suit.',
    icon: '✨',
    rarity: 'common',
    isActive: false,
    effectType: 'score_multiplier',
  },
  {
    id: 'spider_magnet',
    name: 'Cobweb Magnet',
    description: 'When dealing stock, identical suits are attracted toward matching columns.',
    icon: '🧲',
    rarity: 'legendary',
    isActive: false,
    effectType: 'stock_enhancement',
  },
];

// Registry of Consumable Spells / Power-ups
export const AVAILABLE_CONSUMABLES: TwistConsumable[] = [
  {
    id: 'suit_transmute',
    name: 'Suit Transmute',
    description: 'Alchemizes a movable sequence to match the target column suit.',
    icon: '🧪',
    charges: 2,
    actionType: 'suit_converter',
  },
  {
    id: 'spider_sense',
    name: 'Spider Sense',
    description: 'Temporarily reveals all face-down cards on the entire board for 10 seconds.',
    icon: '👁️',
    charges: 3,
    actionType: 'reveal_hidden',
  },
  {
    id: 'web_shuffle',
    name: 'Tangle Weaver',
    description: 'Reorders face-up cards in a selected column to maximize same-suit runs.',
    icon: '🪡',
    charges: 1,
    actionType: 'shuffle_column',
  },
];

export class TwistEngine {
  private relics: TwistRelic[];
  private consumables: TwistConsumable[];
  private enabled: boolean;

  constructor(enabled: boolean = false) {
    this.enabled = enabled;
    this.relics = AVAILABLE_RELICS.map(r => ({ ...r }));
    this.consumables = AVAILABLE_CONSUMABLES.map(c => ({ ...c }));
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setEnabled(val: boolean): void {
    this.enabled = val;
  }

  public getRelics(): TwistRelic[] {
    return this.relics;
  }

  public toggleRelic(id: string): void {
    const relic = this.relics.find(r => r.id === id);
    if (relic) {
      relic.isActive = !relic.isActive;
    }
  }

  public getConsumables(): TwistConsumable[] {
    return this.consumables;
  }

  public useConsumable(id: string): boolean {
    const item = this.consumables.find(c => c.id === id);
    if (item && item.charges > 0) {
      item.charges--;
      return true;
    }
    return false;
  }

  // Hook: Check if cards can be moved (enhanced by Silk Thread relic)
  public canMoveCardsWithRelics(column: Card[], startIndex: number): boolean {
    if (startIndex < 0 || startIndex >= column.length) return false;
    if (!column[startIndex].isFaceUp) return false;

    const hasSilkThread = this.enabled && this.relics.find(r => r.id === 'silk_thread')?.isActive;
    let suitTransitions = 0;

    for (let i = startIndex; i < column.length - 1; i++) {
      const current = column[i];
      const next = column[i + 1];

      if (!next.isFaceUp) return false;
      if (current.rank - 1 !== next.rank) return false;

      if (next.suit !== current.suit) {
        suitTransitions++;
        if (!hasSilkThread || suitTransitions > 1) {
          return false;
        }
      }
    }

    return true;
  }

  // Hook: Check score multiplier for completed suit
  public getSuitCompletionPoints(): number {
    const hasGoldenWeb = this.enabled && this.relics.find(r => r.id === 'golden_web')?.isActive;
    return hasGoldenWeb ? 200 : 100;
  }

  // Hook: Check if spectral lens reveals card
  public shouldRevealUnderneath(_columnIndex: number, cardIndex: number, column: Card[]): boolean {
    if (!this.enabled) return false;
    const hasSpectralLens = this.relics.find(r => r.id === 'xray_lens')?.isActive;
    if (!hasSpectralLens) return false;

    // Is this card face-down and immediately below the first face-up card?
    const firstFaceUpIdx = column.findIndex(c => c.isFaceUp);
    return firstFaceUpIdx > 0 && cardIndex === firstFaceUpIdx - 1;
  }
}
