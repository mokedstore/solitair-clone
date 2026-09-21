import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Card,
  Suit,
  SuitMode,
  GameSettings,
  GameStats,
  HintMove,
} from './engine/types';
import {
  dealNewGame,
  isValidMove,
  canMoveCards,
  findCompletedSuit,
} from './engine/spiderEngine';
import { HistoryManager, cloneColumns, cloneStock } from './engine/history';
import { generateRandomSeed } from './engine/rng';
import { findBestHint } from './engine/hints';
import { TwistEngine } from './engine/twistEngine';
import { sound } from './audio/soundManager';
import { translations } from './i18n/translations';
import { usePresence } from './engine/presence';
import { fetchCurrentPlayerOrigin } from './engine/geoTracker';

import { HeaderBar } from './components/HeaderBar';
import { StockAndFoundations } from './components/StockAndFoundations';
import { TableauColumn } from './components/TableauColumn';
import { CardView } from './components/CardView';
import { WinCelebration } from './components/WinCelebration';
import { DailyChallengeModal } from './components/Modals/DailyChallengeModal';
import { StatisticsModal } from './components/Modals/StatisticsModal';
import { SettingsModal } from './components/Modals/SettingsModal';
import { TwistsModal } from './components/Modals/TwistsModal';
import { TitleScreen } from './components/TitleScreen';

const DEFAULT_SETTINGS: GameSettings = {
  language: typeof navigator !== 'undefined' && navigator.language.startsWith('he') ? 'he' : 'en',
  suitMode: 2,
  relaxedDealing: false,
  soundEnabled: true,
  soundVolume: 0.6,
  musicEnabled: true,
  musicVolume: 0.35,
  autoMoveOnComplete: true,
  twistsEnabled: false,
  deckTheme: 'classic',
};

const DEFAULT_STATS: GameStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  bestStreak: 0,
  bestScore: 0,
  bestTimeSeconds: null,
  modeStats: {
    1: { played: 0, won: 0, bestScore: 0, bestTimeSeconds: null },
    2: { played: 0, won: 0, bestScore: 0, bestTimeSeconds: null },
    4: { played: 0, won: 0, bestScore: 0, bestTimeSeconds: null },
  },
};

export const App: React.FC = () => {
  // Settings & Stats
  const [settings, setSettings] = useState<GameSettings>(() => {
    const saved = localStorage.getItem('ssp_settings');
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  });

  const [stats, setStats] = useState<GameStats>(() => {
    const saved = localStorage.getItem('ssp_stats');
    return saved ? { ...DEFAULT_STATS, ...JSON.parse(saved) } : DEFAULT_STATS;
  });

  // Current dictionary
  const t = translations[settings.language] || translations.en;

  // Real-time Presence (Strictly Real Active Sessions)
  const [showTitleScreen, setShowTitleScreen] = useState(true);
  const onlineCount = usePresence(!showTitleScreen);

  // Record visitor geographic origin on startup
  useEffect(() => {
    fetchCurrentPlayerOrigin().catch(() => {});
  }, []);

  // Game Board State
  const [currentSeed, setCurrentSeed] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('seed') || generateRandomSeed(settings.suitMode);
  });

  const [columns, setColumns] = useState<Card[][]>([]);
  const [stock, setStock] = useState<Card[][]>([]);
  const [completedSuits, setCompletedSuits] = useState<Suit[]>([]);
  const [score, setScore] = useState<number>(500);
  const [moves, setMoves] = useState<number>(0);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isGameWon, setIsGameWon] = useState<boolean>(false);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);

  // Interaction State
  const [selectedLocation, setSelectedLocation] = useState<{ col: number; cardIdx: number } | null>(null);
  const [activeHint, setActiveHint] = useState<HintMove | null>(null);
  const [hintTimeout, setHintTimeout] = useState<number | null>(null);

  // Modals & Screens
  const [isDailyModalOpen, setIsDailyModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isTwistsModalOpen, setIsTwistsModalOpen] = useState(false);

  // Drag & Drop State
  const [dragging, setDragging] = useState<{
    fromCol: number;
    cardIdx: number;
    cards: Card[];
    x: number;
    y: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const [dropTargetCol, setDropTargetCol] = useState<number | null>(null);

  // Engine Instances
  const historyManagerRef = useRef<HistoryManager>(new HistoryManager());
  const twistEngineRef = useRef<TwistEngine>(new TwistEngine(settings.twistsEnabled));

  // Sync settings changes
  useEffect(() => {
    localStorage.setItem('ssp_settings', JSON.stringify(settings));
    sound.setMuted(!settings.soundEnabled);
    sound.setVolume(settings.soundVolume);
    sound.setMusicMuted(!settings.musicEnabled);
    sound.setMusicVolume(settings.musicVolume);
    twistEngineRef.current.setEnabled(settings.twistsEnabled);
    document.documentElement.dir = settings.language === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = settings.language;
  }, [settings]);

  // Start background music smoothly on first user interaction (click or touch)
  useEffect(() => {
    const startMusicOnGesture = () => {
      if (settings.musicEnabled) {
        sound.startMusic();
      }
      window.removeEventListener('click', startMusicOnGesture);
      window.removeEventListener('touchstart', startMusicOnGesture);
    };

    window.addEventListener('click', startMusicOnGesture, { once: true });
    window.addEventListener('touchstart', startMusicOnGesture, { once: true });
    return () => {
      window.removeEventListener('click', startMusicOnGesture);
      window.removeEventListener('touchstart', startMusicOnGesture);
    };
  }, [settings.musicEnabled]);

  // Sync stats changes
  useEffect(() => {
    localStorage.setItem('ssp_stats', JSON.stringify(stats));
  }, [stats]);

  // Timer Tick
  useEffect(() => {
    let interval: number;
    if (isTimerActive && !isGameWon) {
      interval = window.setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, isGameWon]);

  // Save state for undo
  const recordHistory = useCallback(() => {
    historyManagerRef.current.pushState({
      columns,
      stock,
      completedSuits,
      score,
      moveCount: moves,
    });
  }, [columns, stock, completedSuits, score, moves]);

  // Start / Reset Game
  const startNewGame = useCallback((seed: string = generateRandomSeed(settings.suitMode), suitMode: SuitMode = settings.suitMode) => {
    const { columns: newCols, stock: newStock } = dealNewGame(suitMode, seed);
    setCurrentSeed(seed);
    setColumns(newCols);
    setStock(newStock);
    setCompletedSuits([]);
    setScore(500);
    setMoves(0);
    setTimerSeconds(0);
    setIsGameWon(false);
    setIsTimerActive(false);
    setSelectedLocation(null);
    setActiveHint(null);
    historyManagerRef.current.clear();

    // Increment played games stat
    setStats(prev => ({
      ...prev,
      gamesPlayed: prev.gamesPlayed + 1,
      modeStats: {
        ...prev.modeStats,
        [suitMode]: {
          ...prev.modeStats[suitMode],
          played: prev.modeStats[suitMode].played + 1,
        },
      },
    }));

    sound.playDealStock();
  }, [settings.suitMode]);

  // Initialize game on mount
  useEffect(() => {
    startNewGame(currentSeed, settings.suitMode);
  }, []);

  // Check and process any completed suit in columns
  const checkCompletedSuits = useCallback((cols: Card[][]): { newCols: Card[][]; newCompleted: Suit[]; count: number } => {
    const updatedCols = cloneColumns(cols);
    const completed: Suit[] = [];

    for (let c = 0; c < updatedCols.length; c++) {
      const col = updatedCols[c];
      const match = findCompletedSuit(col);
      if (match) {
        // Remove the 13 cards
        col.splice(match.startIndex, 13);
        completed.push(match.suit);

        // If top card is now face down, flip it up!
        if (col.length > 0 && !col[col.length - 1].isFaceUp) {
          col[col.length - 1].isFaceUp = true;
        }
      }
    }

    return {
      newCols: updatedCols,
      newCompleted: completed,
      count: completed.length,
    };
  }, []);

  // Execute a card move between columns
  const executeMove = useCallback((fromCol: number, cardIdx: number, toCol: number) => {
    if (fromCol === toCol) return;

    recordHistory();
    setIsTimerActive(true);

    const newCols = cloneColumns(columns);
    const movingCards = newCols[fromCol].splice(cardIdx);

    // Target receives cards
    newCols[toCol].push(...movingCards);

    // Uncover previous card in fromCol if face down
    if (newCols[fromCol].length > 0 && !newCols[fromCol][newCols[fromCol].length - 1].isFaceUp) {
      newCols[fromCol][newCols[fromCol].length - 1].isFaceUp = true;
    }

    // Check completed suits
    const { newCols: checkedCols, newCompleted, count } = checkCompletedSuits(newCols);

    const bonusPoints = count * twistEngineRef.current.getSuitCompletionPoints();
    const updatedScore = Math.max(0, score - 1 + bonusPoints);
    const updatedMoves = moves + 1;
    const updatedCompletedSuits = [...completedSuits, ...newCompleted];

    setColumns(checkedCols);
    setCompletedSuits(updatedCompletedSuits);
    setScore(updatedScore);
    setMoves(updatedMoves);
    setSelectedLocation(null);
    setActiveHint(null);

    sound.playCardSnap();
    if (count > 0) {
      sound.playSuitComplete();
    }

    // Check Win Condition: 8 completed suits
    if (updatedCompletedSuits.length === 8) {
      setIsGameWon(true);
      setIsTimerActive(false);

      // Record Win Stats
      setStats(prev => {
        const mode = settings.suitMode;
        const currentModeStats = prev.modeStats[mode];
        const newStreak = prev.currentStreak + 1;
        const newBestStreak = Math.max(prev.bestStreak, newStreak);
        const newBestScore = Math.max(currentModeStats.bestScore, updatedScore);
        const newBestTime = currentModeStats.bestTimeSeconds === null
          ? timerSeconds
          : Math.min(currentModeStats.bestTimeSeconds, timerSeconds);

        return {
          ...prev,
          gamesWon: prev.gamesWon + 1,
          currentStreak: newStreak,
          bestStreak: newBestStreak,
          bestScore: Math.max(prev.bestScore, updatedScore),
          bestTimeSeconds: prev.bestTimeSeconds === null ? timerSeconds : Math.min(prev.bestTimeSeconds, timerSeconds),
          modeStats: {
            ...prev.modeStats,
            [mode]: {
              ...currentModeStats,
              won: currentModeStats.won + 1,
              bestScore: newBestScore,
              bestTimeSeconds: newBestTime,
            },
          },
        };
      });
    }
  }, [columns, score, moves, completedSuits, timerSeconds, settings.suitMode, checkCompletedSuits, recordHistory]);

  // Deal 10 cards from stock
  const handleDealStock = useCallback(() => {
    if (stock.length === 0) return;

    // Classic Rule: Check for empty columns
    const emptyCount = columns.filter(c => c.length === 0).length;
    if (!settings.relaxedDealing && emptyCount > 0) {
      sound.playError();
      alert(t.stockDealAlert(emptyCount));
      return;
    }

    recordHistory();
    setIsTimerActive(true);

    const newStock = cloneStock(stock);
    const dealPack = newStock.pop()!;
    const newCols = cloneColumns(columns);

    // Deal one card face up to each column
    for (let c = 0; c < 10; c++) {
      if (dealPack[c]) {
        newCols[c].push(dealPack[c]);
      }
    }

    // Check completed suits
    const { newCols: checkedCols, newCompleted, count } = checkCompletedSuits(newCols);
    const bonusPoints = count * twistEngineRef.current.getSuitCompletionPoints();

    setStock(newStock);
    setColumns(checkedCols);
    if (newCompleted.length > 0) {
      setCompletedSuits(prev => [...prev, ...newCompleted]);
      sound.playSuitComplete();
    }
    setScore(s => s + bonusPoints);
    setSelectedLocation(null);
    setActiveHint(null);

    sound.playDealStock();
  }, [stock, columns, settings.relaxedDealing, t, checkCompletedSuits, recordHistory]);

  // Undo & Redo
  const handleUndo = useCallback(() => {
    const prev = historyManagerRef.current.undo({
      columns,
      stock,
      completedSuits,
      score,
      moveCount: moves,
    });
    if (prev) {
      setColumns(prev.columns);
      setStock(prev.stock);
      setCompletedSuits(prev.completedSuits);
      setScore(prev.score);
      setMoves(prev.moveCount);
      setSelectedLocation(null);
      setActiveHint(null);
      sound.playCardSlide();
    }
  }, [columns, stock, completedSuits, score, moves]);

  const handleRedo = useCallback(() => {
    const next = historyManagerRef.current.redo({
      columns,
      stock,
      completedSuits,
      score,
      moveCount: moves,
    });
    if (next) {
      setColumns(next.columns);
      setStock(next.stock);
      setCompletedSuits(next.completedSuits);
      setScore(next.score);
      setMoves(next.moveCount);
      setSelectedLocation(null);
      setActiveHint(null);
      sound.playCardSlide();
    }
  }, [columns, stock, completedSuits, score, moves]);

  // Smart Click Card Handler
  const handleCardClick = useCallback((colIdx: number, cardIdx: number) => {
    const col = columns[colIdx];
    const card = col[cardIdx];
    if (!card.isFaceUp) return;

    // Check if we can move from this card
    const canMove = twistEngineRef.current.isEnabled()
      ? twistEngineRef.current.canMoveCardsWithRelics(col, cardIdx)
      : canMoveCards(col, cardIdx);

    if (!canMove) {
      sound.playError();
      return;
    }

    // If already selected, maybe move to clicked column
    if (selectedLocation) {
      if (selectedLocation.col === colIdx) {
        // Deselect
        setSelectedLocation(null);
        return;
      }

      // Check if previously selected cards can drop onto this column
      const sourceCol = columns[selectedLocation.col];
      const movingCards = sourceCol.slice(selectedLocation.cardIdx);
      if (isValidMove(movingCards, col)) {
        executeMove(selectedLocation.col, selectedLocation.cardIdx, colIdx);
        return;
      }
    }

    // Smart Auto-Move: Find the best target column for this sequence
    const movingCards = col.slice(cardIdx);
    const movingCard = movingCards[0];

    // Look for same-suit match first
    let bestTargetCol: number | null = null;
    let fallbackTargetCol: number | null = null;
    let emptyColTarget: number | null = null;

    for (let c = 0; c < 10; c++) {
      if (c === colIdx) continue;
      const targetCol = columns[c];

      if (targetCol.length === 0) {
        if (emptyColTarget === null) emptyColTarget = c;
        continue;
      }

      const targetTop = targetCol[targetCol.length - 1];
      if (targetTop.rank === movingCard.rank + 1) {
        if (targetTop.suit === movingCard.suit) {
          bestTargetCol = c;
          break; // Perfect same-suit match!
        } else if (fallbackTargetCol === null) {
          fallbackTargetCol = c;
        }
      }
    }

    const chosenTarget = bestTargetCol ?? fallbackTargetCol ?? (cardIdx > 0 && !col[cardIdx - 1].isFaceUp ? emptyColTarget : null);

    if (chosenTarget !== null) {
      executeMove(colIdx, cardIdx, chosenTarget);
    } else {
      // Just select it for manual target click
      setSelectedLocation({ col: colIdx, cardIdx });
      sound.playCardSlide();
    }
  }, [columns, selectedLocation, executeMove]);

  // Click on Empty Column
  const handleEmptyColumnClick = useCallback((colIdx: number) => {
    if (selectedLocation) {
      const sourceCol = columns[selectedLocation.col];
      const movingCards = sourceCol.slice(selectedLocation.cardIdx);
      if (isValidMove(movingCards, columns[colIdx])) {
        executeMove(selectedLocation.col, selectedLocation.cardIdx, colIdx);
      }
    }
  }, [selectedLocation, columns, executeMove]);

  // Request Hint
  const handleHint = useCallback(() => {
    const hint = findBestHint(columns, stock.length);
    if (hint) {
      setActiveHint(hint);
      sound.playClick();
      if (hintTimeout) clearTimeout(hintTimeout);
      const to = window.setTimeout(() => setActiveHint(null), 4000);
      setHintTimeout(to);
    } else {
      if (stock.length > 0) {
        alert(t.noStrategicMoves);
      } else {
        alert(t.gameBlocked);
      }
      sound.playError();
    }
  }, [columns, stock.length, hintTimeout, t]);

  // Pointer Drag & Drop Handlers
  const handleDragStart = useCallback((colIdx: number, cardIdx: number, e: React.PointerEvent) => {
    const col = columns[colIdx];
    const cards = col.slice(cardIdx);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();

    setDragging({
      fromCol: colIdx,
      cardIdx,
      cards,
      x: e.clientX,
      y: e.clientY,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    });
    setSelectedLocation(null);
    sound.playCardSlide();
  }, [columns]);

  // Global pointer move & up for silky smooth drag
  useEffect(() => {
    if (!dragging) return;

    const handlePointerMove = (e: PointerEvent) => {
      setDragging(d => (d ? { ...d, x: e.clientX, y: e.clientY } : null));

      // Determine hovered column from board element positions
      const boardEl = document.querySelector('.tableau-board');
      if (!boardEl) return;

      const colEls = boardEl.querySelectorAll('.tableau-col');
      let hovered: number | null = null;

      colEls.forEach((el, idx) => {
        const r = el.getBoundingClientRect();
        if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom + 80) {
          hovered = idx;
        }
      });

      setDropTargetCol(hovered);
    };

    const handlePointerUp = () => {
      if (dropTargetCol !== null && dropTargetCol !== dragging.fromCol) {
        const targetCol = columns[dropTargetCol];
        if (isValidMove(dragging.cards, targetCol)) {
          executeMove(dragging.fromCol, dragging.cardIdx, dropTargetCol);
        } else {
          sound.playError();
        }
      }

      setDragging(null);
      setDropTargetCol(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [dragging, dropTargetCol, columns, executeMove]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (e.key.toLowerCase() === 'h') {
        handleHint();
      } else if (e.key.toLowerCase() === 'n') {
        startNewGame();
      } else if (e.key.toLowerCase() === 'd') {
        handleDealStock();
      } else if (e.key.toLowerCase() === 'm') {
        setSettings(s => ({ ...s, soundEnabled: !s.soundEnabled }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, handleHint, startNewGame, handleDealStock]);

  const emptyColumnCount = columns.filter(c => c.length === 0).length;

  const handleToggleLanguage = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      language: prev.language === 'en' ? 'he' : 'en',
    }));
  }, []);

  const handleToggleMusic = useCallback(() => {
    setSettings(prev => {
      const next = !prev.musicEnabled;
      if (next) sound.startMusic();
      else sound.stopMusic();
      return { ...prev, musicEnabled: next };
    });
  }, []);

  return (
    <div
      className="game-viewport"
      data-theme={settings.deckTheme || 'classic'}
      dir={settings.language === 'he' ? 'rtl' : 'ltr'}
    >
      {/* Top Header Bar */}
      <HeaderBar
        score={score}
        moves={moves}
        timerSeconds={timerSeconds}
        suitMode={settings.suitMode}
        canUndo={historyManagerRef.current.canUndo()}
        canRedo={historyManagerRef.current.canRedo()}
        isMuted={!settings.soundEnabled}
        isMusicMuted={!settings.musicEnabled}
        twistsEnabled={settings.twistsEnabled}
        currentLanguage={settings.language}
        onlineCount={onlineCount}
        t={t}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onHint={handleHint}
        onNewGame={() => startNewGame()}
        onToggleMute={() => setSettings(s => ({ ...s, soundEnabled: !s.soundEnabled }))}
        onToggleMusic={handleToggleMusic}
        onToggleLanguage={handleToggleLanguage}
        onOpenDaily={() => setIsDailyModalOpen(true)}
        onOpenStats={() => setIsStatsModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onToggleTwists={() => setIsTwistsModalOpen(true)}
        onOpenTitleScreen={() => setShowTitleScreen(true)}
      />

      {/* Shelf for Completed Foundations & Stock Pile */}
      <StockAndFoundations
        completedSuits={completedSuits}
        stockPacksRemaining={stock.length}
        onDealStock={handleDealStock}
        canDealStock={stock.length > 0}
        emptyColumnCount={emptyColumnCount}
        relaxedDealing={settings.relaxedDealing}
        deckTheme={settings.deckTheme || 'classic'}
        t={t}
      />

      {/* Tableau Board (10 Columns) */}
      <main className="tableau-board">
        {columns.map((colCards, colIdx) => (
          <TableauColumn
            key={colIdx}
            columnIndex={colIdx}
            cards={colCards}
            isValidDropTarget={
              dropTargetCol === colIdx &&
              dragging !== null &&
              dragging.fromCol !== colIdx &&
              isValidMove(dragging.cards, colCards)
            }
            selectedCardIndex={selectedLocation?.col === colIdx ? selectedLocation.cardIdx : null}
            hintedCardIndex={activeHint?.fromColumn === colIdx ? activeHint.cardIndex : null}
            twistEngine={twistEngineRef.current}
            deckTheme={settings.deckTheme || 'classic'}
            onCardClick={handleCardClick}
            onDragStart={handleDragStart}
            onColumnClick={handleEmptyColumnClick}
          />
        ))}
      </main>

      {/* Floating Dragging Cards Ghost */}
      {dragging && (
        <div
          style={{
            position: 'fixed',
            left: `${dragging.x - dragging.offsetX}px`,
            top: `${dragging.y - dragging.offsetY}px`,
            pointerEvents: 'none',
            zIndex: 9999,
          }}
        >
          {dragging.cards.map((card, i) => (
            <CardView
              key={card.id}
              card={card}
              topOffset={i * 24}
              isDragging={true}
              deckTheme={settings.deckTheme || 'classic'}
            />
          ))}
        </div>
      )}

      {/* Progressive Twists Quick Indicator */}
      {settings.twistsEnabled && (
        <div className="twists-floating-bar" onClick={() => setIsTwistsModalOpen(true)}>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#d4af37' }}>
            {t.twistsActiveBadge}
          </span>
          {twistEngineRef.current.getRelics().filter(r => r.isActive).map(r => (
            <span key={r.id} className="relic-badge-item active" title={r.name}>
              {r.icon}
            </span>
          ))}
        </div>
      )}

      {/* Victory Celebration */}
      {isGameWon && (
        <WinCelebration
          score={score}
          moves={moves}
          timeSeconds={timerSeconds}
          onPlayAgain={() => startNewGame()}
          t={t}
        />
      )}

      {/* Modals */}
      <DailyChallengeModal
        isOpen={isDailyModalOpen}
        onClose={() => setIsDailyModalOpen(false)}
        suitMode={settings.suitMode}
        onPlayDaily={(seed) => startNewGame(seed, settings.suitMode)}
        t={t}
      />

      <StatisticsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        stats={stats}
        onResetStats={() => setStats(DEFAULT_STATS)}
        t={t}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onUpdateSettings={(newSettings) => {
          setSettings(prev => {
            const updated = { ...prev, ...newSettings };
            if (newSettings.suitMode && newSettings.suitMode !== prev.suitMode) {
              startNewGame(generateRandomSeed(newSettings.suitMode), newSettings.suitMode);
            }
            return updated;
          });
        }}
        onPlayCustomSeed={(seed, mode) => startNewGame(seed, mode)}
        t={t}
      />

      <TwistsModal
        isOpen={isTwistsModalOpen}
        onClose={() => setIsTwistsModalOpen(false)}
        twistEngine={twistEngineRef.current}
        t={t}
        onToggleRelic={(relicId) => {
          twistEngineRef.current.toggleRelic(relicId);
          setSettings(s => ({ ...s, twistsEnabled: true }));
          sound.playClick();
        }}
        onTriggerConsumable={(item) => {
          if (twistEngineRef.current.useConsumable(item)) {
            sound.playCardSnap();
            alert(t.castSuccess(item));
          }
        }}
      />

      {/* Cinematic Title & Splash Screen */}
      {showTitleScreen && (
        <TitleScreen
          suitMode={settings.suitMode}
          language={settings.language}
          soundEnabled={settings.soundEnabled}
          musicEnabled={settings.musicEnabled}
          deckTheme={settings.deckTheme || 'classic'}
          onlineCount={onlineCount}
          t={t}
          onStartGame={(mode) => {
            fetchCurrentPlayerOrigin().catch(() => {});
            if (mode !== settings.suitMode) {
              setSettings(prev => ({ ...prev, suitMode: mode }));
              startNewGame(generateRandomSeed(mode), mode);
            }
            setShowTitleScreen(false);
          }}
          onOpenDaily={() => {
            setShowTitleScreen(false);
            setIsDailyModalOpen(true);
          }}
          onToggleLanguage={handleToggleLanguage}
          onToggleSound={() => setSettings(s => ({ ...s, soundEnabled: !s.soundEnabled }))}
          onToggleMusic={handleToggleMusic}
          onSelectDeckTheme={(theme) => setSettings(s => ({ ...s, deckTheme: theme }))}
        />
      )}
    </div>
  );
};
export default App;
