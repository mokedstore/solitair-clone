// Seeded Pseudo-Random Number Generator using Mulberry32 & MurmurHash3
export class SeededRNG {
  private state: number;

  constructor(seedStr: string) {
    this.state = SeededRNG.hashString(seedStr);
  }

  // 32-bit MurmurHash3 string hashing
  private static hashString(str: string): number {
    let hash = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
      hash = Math.imul(hash ^ str.charCodeAt(i), 3432918353);
      hash = (hash << 13) | (hash >>> 19);
    }
    return hash >>> 0;
  }

  // Returns float in range [0, 1)
  public next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // Random integer in [min, max] inclusive
  public nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  // Deterministic Fisher-Yates shuffle
  public shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}

// Helper to generate formatted daily challenge seed string
export function getDailySeedString(date: Date = new Date(), suitMode: number = 2): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `SPIDER-${yyyy}${mm}${dd}-${suitMode}S`;
}

// Generate a readable random shareable seed
export function generateRandomSeed(suitMode: number = 2): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SSP-${code}-${suitMode}S`;
}
