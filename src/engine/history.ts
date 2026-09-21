import { MoveHistoryState, Card } from './types';

// Deep clone card array of arrays
export function cloneColumns(columns: Card[][]): Card[][] {
  return columns.map(col => col.map(card => ({ ...card })));
}

// Deep clone stock array of packs
export function cloneStock(stock: Card[][]): Card[][] {
  return stock.map(pack => pack.map(card => ({ ...card })));
}

export class HistoryManager {
  private undoStack: MoveHistoryState[] = [];
  private redoStack: MoveHistoryState[] = [];
  private maxHistory: number = 100;

  public clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }

  public pushState(state: MoveHistoryState): void {
    const snapshot: MoveHistoryState = {
      columns: cloneColumns(state.columns),
      stock: cloneStock(state.stock),
      completedSuits: [...state.completedSuits],
      score: state.score,
      moveCount: state.moveCount,
      lastMoveDescription: state.lastMoveDescription,
    };

    this.undoStack.push(snapshot);
    if (this.undoStack.length > this.maxHistory) {
      this.undoStack.shift();
    }
    // Any new action clears the redo stack
    this.redoStack = [];
  }

  public canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  public canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  public undo(currentState: MoveHistoryState): MoveHistoryState | null {
    if (!this.canUndo()) return null;

    // Save current state to redo stack
    this.redoStack.push({
      columns: cloneColumns(currentState.columns),
      stock: cloneStock(currentState.stock),
      completedSuits: [...currentState.completedSuits],
      score: currentState.score,
      moveCount: currentState.moveCount,
      lastMoveDescription: currentState.lastMoveDescription,
    });

    const previousState = this.undoStack.pop()!;
    return {
      columns: cloneColumns(previousState.columns),
      stock: cloneStock(previousState.stock),
      completedSuits: [...previousState.completedSuits],
      score: previousState.score,
      moveCount: previousState.moveCount,
      lastMoveDescription: previousState.lastMoveDescription,
    };
  }

  public redo(currentState: MoveHistoryState): MoveHistoryState | null {
    if (!this.canRedo()) return null;

    // Save current state back to undo stack
    this.undoStack.push({
      columns: cloneColumns(currentState.columns),
      stock: cloneStock(currentState.stock),
      completedSuits: [...currentState.completedSuits],
      score: currentState.score,
      moveCount: currentState.moveCount,
      lastMoveDescription: currentState.lastMoveDescription,
    });

    const nextState = this.redoStack.pop()!;
    return {
      columns: cloneColumns(nextState.columns),
      stock: cloneStock(nextState.stock),
      completedSuits: [...nextState.completedSuits],
      score: nextState.score,
      moveCount: nextState.moveCount,
      lastMoveDescription: nextState.lastMoveDescription,
    };
  }
}
