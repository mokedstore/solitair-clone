import { createSpiderDeck, dealNewGame, canMoveCards, isValidMove, findCompletedSuit } from './src/engine/spiderEngine.ts';
import { SeededRNG } from './src/engine/rng.ts';
import { HistoryManager } from './src/engine/history.ts';

console.log('--- Running Spider Solitaire Engine Tests ---');

// 1. Test Deck Generation
const deck1 = createSpiderDeck(1);
const deck2 = createSpiderDeck(2);
const deck4 = createSpiderDeck(4);

console.assert(deck1.length === 104, `Deck 1 suit should have 104 cards, got ${deck1.length}`);
console.assert(deck2.length === 104, `Deck 2 suits should have 104 cards, got ${deck2.length}`);
console.assert(deck4.length === 104, `Deck 4 suits should have 104 cards, got ${deck4.length}`);

// Check suit distribution in 2-suit
const spadesIn2 = deck2.filter(c => c.suit === 'spades').length;
const heartsIn2 = deck2.filter(c => c.suit === 'hearts').length;
console.assert(spadesIn2 === 52, `2-suit deck should have 52 spades, got ${spadesIn2}`);
console.assert(heartsIn2 === 52, `2-suit deck should have 52 hearts, got ${heartsIn2}`);
console.log('✓ Deck generation tests passed.');

// 2. Test Initial Deal
const deal = dealNewGame(2, 'TEST-SEED-1234');
console.assert(deal.columns.length === 10, 'Should have 10 tableau columns');

let totalTableauCards = 0;
deal.columns.forEach((col, idx) => {
  totalTableauCards += col.length;
  const expectedCount = idx < 4 ? 6 : 5;
  console.assert(col.length === expectedCount, `Column ${idx} should have ${expectedCount} cards`);
  // Top card must be face up, all other cards face down
  console.assert(col[col.length - 1].isFaceUp === true, `Column ${idx} top card must be face up`);
  for (let i = 0; i < col.length - 1; i++) {
    console.assert(col[i].isFaceUp === false, `Column ${idx} card ${i} should be face down`);
  }
});
console.assert(totalTableauCards === 54, `Tableau should have 54 cards, got ${totalTableauCards}`);

console.assert(deal.stock.length === 5, 'Stock should have 5 packs');
let totalStockCards = 0;
deal.stock.forEach(pack => {
  totalStockCards += pack.length;
  console.assert(pack.length === 10, 'Each stock pack must have 10 cards');
});
console.assert(totalStockCards === 50, `Stock should have 50 cards, got ${totalStockCards}`);
console.assert(totalTableauCards + totalStockCards === 104, 'Total cards must equal 104');
console.log('✓ Initial deal distribution tests passed.');

// 3. Test Deterministic RNG
const dealA = dealNewGame(4, 'IDENTICAL-SEED-999');
const dealB = dealNewGame(4, 'IDENTICAL-SEED-999');
const dealC = dealNewGame(4, 'DIFFERENT-SEED-111');

console.assert(dealA.columns[0][0].id === dealB.columns[0][0].id, 'Identical seed should yield identical first card');
console.assert(dealA.columns[9][4].id === dealB.columns[9][4].id, 'Identical seed should yield identical last card');
console.assert(dealA.columns[0][0].id !== dealC.columns[0][0].id, 'Different seeds should yield different deals');
console.log('✓ Deterministic RNG tests passed.');

// 4. Test Valid Move & CanMoveCards
const testCol = [
  { id: '1', suit: 'spades', rank: 9, isFaceUp: false },
  { id: '2', suit: 'spades', rank: 8, isFaceUp: true },
  { id: '3', suit: 'spades', rank: 7, isFaceUp: true },
  { id: '4', suit: 'spades', rank: 6, isFaceUp: true },
];

console.assert(canMoveCards(testCol, 1) === true, 'Movable run 8-7-6 of spades should be valid');
console.assert(canMoveCards(testCol, 2) === true, 'Movable sub-run 7-6 of spades should be valid');
console.assert(canMoveCards(testCol, 0) === false, 'Cannot move starting with face-down card');

// Mixed suit sequence cannot be moved together
const mixedCol = [
  { id: '1', suit: 'spades', rank: 8, isFaceUp: true },
  { id: '2', suit: 'hearts', rank: 7, isFaceUp: true },
];
console.assert(canMoveCards(mixedCol, 0) === false, 'Mixed suit run cannot be moved together');
console.assert(canMoveCards(mixedCol, 1) === true, 'Single card 7 of hearts can be moved');

// Drop target validation
const targetCol = [{ id: 'target', suit: 'clubs', rank: 9, isFaceUp: true }];
console.assert(isValidMove([testCol[1]], targetCol) === true, 'Rank 8 can drop onto Rank 9 regardless of suit');
const invalidTarget = [{ id: 'target2', suit: 'clubs', rank: 7, isFaceUp: true }];
console.assert(isValidMove([testCol[1]], invalidTarget) === false, 'Rank 8 cannot drop onto Rank 7');
console.log('✓ Spider movement rules validation passed.');

// 5. Test Suit Completion Detection (K down to A)
const fullRun = [];
for (let r = 13; r >= 1; r--) {
  fullRun.push({ id: `k-a-${r}`, suit: 'spades', rank: r, isFaceUp: true });
}
const completed = findCompletedSuit(fullRun);
console.assert(completed !== null, 'Full King to Ace run must be detected as completed');
console.assert(completed?.suit === 'spades', 'Completed suit must be spades');

const incompleteRun = fullRun.slice(0, 12); // Missing Ace
console.assert(findCompletedSuit(incompleteRun) === null, 'Incomplete run without Ace must not trigger complete');
console.log('✓ Full suit completion detection passed.');

// 6. Test History Undo / Redo
const history = new HistoryManager();
history.pushState({
  columns: deal.columns,
  stock: deal.stock,
  completedSuits: [],
  score: 500,
  moveCount: 0,
});
console.assert(history.canUndo() === true, 'Should have undoable state');
console.assert(history.canRedo() === false, 'Redo should be empty initially');

const undone = history.undo({
  columns: deal.columns,
  stock: deal.stock,
  completedSuits: [],
  score: 499,
  moveCount: 1,
});
console.assert(undone !== null, 'Undone state should exist');
console.assert(undone?.score === 500, 'Undone score should be 500');
console.assert(history.canRedo() === true, 'Redo should now be available');
console.log('✓ History undo & redo tests passed.');

console.log('--- ALL ENGINE TESTS PASSED! ---');
