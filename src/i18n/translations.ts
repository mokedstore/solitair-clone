import { Language } from '../engine/types';

export interface Translations {
  // Header
  appTitle: string;
  suitMode1: string;
  suitMode2: string;
  suitMode4: string;
  score: string;
  moves: string;
  time: string;
  undo: string;
  redo: string;
  hint: string;
  newGame: string;
  twists: string;
  dailyChallenge: string;
  statistics: string;
  settings: string;
  mute: string;
  unmute: string;
  musicMute: string;
  musicUnmute: string;
  musicVolume: string;

  // Shelf & Stock
  cardsRemaining: string;
  completedSuitsTitle: string;
  emptyFoundation: string;
  completedRunTitle: (suit: string) => string;
  stockEmpty: string;
  stockFillWarning: (count: number) => string;
  stockDealTooltip: (dealsLeft: number) => string;
  stockDealAlert: (count: number) => string;

  // Victory
  victoryTitle: string;
  victorySubtitle: string;
  finalScore: string;
  totalMoves: string;
  clearTime: string;
  playAnother: string;

  // Daily Challenge Modal
  dailyTitle: string;
  dailyDesc: string;
  selectDate: string;
  deckSeed: string;
  shareSeed: string;
  copied: string;
  playChallenge: string;
  cancel: string;

  // Statistics Modal
  statsTitle: string;
  tabOverall: string;
  tab1Suit: string;
  tab2Suits: string;
  tab4Suits: string;
  played: string;
  won: string;
  winRate: string;
  bestScore: string;
  bestTime: string;
  bestStreak: string;
  resetStats: string;
  resetConfirm: string;
  close: string;

  // Settings Modal
  settingsTitle: string;
  languageLabel: string;
  langEn: string;
  langHe: string;
  difficultyLabel: string;
  relaxedDealing: string;
  relaxedDealingDesc: string;
  proceduralSound: string;
  volume: string;
  twistsEngine: string;
  twistsEngineDesc: string;
  loadSeedLabel: string;
  loadButton: string;
  done: string;

  // Deck Selection
  deckThemeLabel: string;
  selectDeck: string;
  deckClassic: string;
  deckClassicDesc: string;
  deckCelestial: string;
  deckCelestialDesc: string;
  deckUpcoming: string;
  deckUpcomingDesc: string;
  comingSoon: string;

  // Live Presence
  playersOnline: (count: number) => string;
  playersOnlineShort: (count: number) => string;
  activePlayersTooltip: string;

  // Twists Modal
  twistsModalTitle: string;
  twistsModalDesc: string;
  passiveRelicsHeader: string;
  consumableSpellsHeader: string;
  chargesLeft: string;
  cast: string;
  castSuccess: (name: string) => string;
  twistsActiveBadge: string;

  // Relic names & descriptions
  relics: {
    silk_thread: { name: string; desc: string };
    xray_lens: { name: string; desc: string };
    golden_web: { name: string; desc: string };
    spider_magnet: { name: string; desc: string };
  };

  // Consumable names & descriptions
  consumables: {
    suit_transmute: { name: string; desc: string };
    spider_sense: { name: string; desc: string };
    web_shuffle: { name: string; desc: string };
  };

  // Hints
  noStrategicMoves: string;
  gameBlocked: string;

  // Title Screen
  titleScreenPlay: string;
  titleScreenDaily: string;
  titleScreenTagline: string;
  selectDifficulty: string;
  titleScreenSkip: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    appTitle: 'SPIDER PRIME',
    suitMode1: '1 Suit (Easy)',
    suitMode2: '2 Suits (Medium)',
    suitMode4: '4 Suits (Expert)',
    score: 'Score',
    moves: 'Moves',
    time: 'Time',
    undo: 'Undo',
    redo: 'Redo',
    hint: 'Hint',
    newGame: 'New',
    twists: 'Twists',
    dailyChallenge: 'Daily Challenge',
    statistics: 'Statistics & Streaks',
    settings: 'Settings & Difficulty',
    mute: 'Mute Sound FX',
    unmute: 'Unmute Sound FX',
    musicMute: 'Mute Music',
    musicUnmute: 'Play Music',
    musicVolume: 'Music Volume:',

    cardsRemaining: 'Cards Left',
    completedSuitsTitle: 'Completed Suits',
    emptyFoundation: 'Empty foundation',
    completedRunTitle: (suit) => `Completed ${suit} run`,
    stockEmpty: 'No cards left in stock',
    stockFillWarning: (count) => `Fill ${count} empty column${count > 1 ? 's' : ''} to deal`,
    stockDealTooltip: (dealsLeft) => `Deal 10 cards (${dealsLeft} deal${dealsLeft > 1 ? 's' : ''} left)`,
    stockDealAlert: (count) => `Cannot deal cards while ${count} column${count > 1 ? 's are' : ' is'} empty! Move cards to fill all columns, or enable Relaxed Dealing in Settings.`,

    victoryTitle: 'VICTORY!',
    victorySubtitle: 'All 8 suits have been conquered!',
    finalScore: 'Final Score',
    totalMoves: 'Total Moves',
    clearTime: 'Clear Time',
    playAnother: 'Play Another Game',

    dailyTitle: 'Daily Challenge',
    dailyDesc: 'Every day features a unique deterministic card deal shared globally. Compete with players worldwide on the exact same deck!',
    selectDate: 'Select Challenge Date:',
    deckSeed: 'Deck Seed',
    shareSeed: 'Share Seed',
    copied: 'Copied!',
    playChallenge: 'Play Challenge',
    cancel: 'Cancel',

    statsTitle: 'Player Statistics',
    tabOverall: 'Overall',
    tab1Suit: '1 Suit',
    tab2Suits: '2 Suits',
    tab4Suits: '4 Suits',
    played: 'Played',
    won: 'Won',
    winRate: 'Win Rate',
    bestScore: 'Best Score',
    bestTime: 'Best Time',
    bestStreak: 'Best Streak',
    resetStats: 'Reset Stats',
    resetConfirm: 'Are you sure you want to reset all statistics?',
    close: 'Close',

    settingsTitle: 'Game Settings',
    languageLabel: 'Language / שפה:',
    langEn: 'English',
    langHe: 'עברית',
    difficultyLabel: 'Game Difficulty (Suit Count):',
    relaxedDealing: 'Relaxed Dealing',
    relaxedDealingDesc: 'Allow dealing stock cards even if some columns are empty',
    proceduralSound: 'Procedural Sound FX',
    volume: 'Volume:',
    twistsEngine: 'Progressive Twists Engine',
    twistsEngineDesc: 'Activate Roguelike relics and power-up spells (Balatro style)',
    loadSeedLabel: 'Load Specific Seed:',
    loadButton: 'Load',
    done: 'Done',

    // Deck Selection
    deckThemeLabel: 'Card Deck & Theme:',
    selectDeck: 'Select Deck',
    deckClassic: 'Royal Classic',
    deckClassicDesc: 'Luxurious playing cards with gold foil borders & emerald table.',
    deckCelestial: 'Celestial Neon',
    deckCelestialDesc: 'Cyberpunk neon art cards with constellation lines & cosmic void table.',
    deckUpcoming: 'Secret Masterpiece',
    deckUpcomingDesc: 'Brand new custom deck in development. Coming soon!',
    comingSoon: 'COMING SOON',

    // Live Presence
    playersOnline: (count) => `${count} Players Online Now`,
    playersOnlineShort: (count) => `${count} online`,
    activePlayersTooltip: 'Live active Solitaire players right now',

    twistsModalTitle: 'Twists & Roguelike Relics',
    twistsModalDesc: 'Equip passive relics or activate consumable powers to alter classic rules and discover new playstyles.',
    passiveRelicsHeader: 'Passive Relics (Equip any combination)',
    consumableSpellsHeader: 'Consumable Spells',
    chargesLeft: 'charges left',
    cast: 'Cast',
    castSuccess: (name) => `Cast ${name}! Power applied.`,
    twistsActiveBadge: '🕸️ Twists Active',

    relics: {
      silk_thread: {
        name: 'Silk Thread',
        desc: 'Allows dragging a descending sequence even if it has 1 suit transition.',
      },
      xray_lens: {
        name: 'Spectral Lens',
        desc: 'Reveals the hidden face-down card directly beneath the top face-up card.',
      },
      golden_web: {
        name: 'Golden Web',
        desc: 'Earn 2x bonus points (+200 instead of +100) whenever you complete a suit.',
      },
      spider_magnet: {
        name: 'Cobweb Magnet',
        desc: 'When dealing stock, identical suits are attracted toward matching columns.',
      },
    },

    consumables: {
      suit_transmute: {
        name: 'Suit Transmute',
        desc: 'Alchemizes a movable sequence to match the target column suit.',
      },
      spider_sense: {
        name: 'Spider Sense',
        desc: 'Temporarily reveals all face-down cards on the entire board for 10 seconds.',
      },
      web_shuffle: {
        name: 'Tangle Weaver',
        desc: 'Reorders face-up cards in a selected column to maximize same-suit runs.',
      },
    },

    noStrategicMoves: 'No strategic moves found on tableau. Deal new cards from the stock pile!',
    gameBlocked: 'No more moves available! Game is blocked.',

    titleScreenPlay: 'PLAY GAME',
    titleScreenDaily: 'DAILY CHALLENGE',
    titleScreenTagline: 'The Royal Solitaire Experience • Progressive Twists',
    selectDifficulty: 'Select Difficulty:',
    titleScreenSkip: 'Quick Start',
  },

  he: {
    appTitle: 'סוליטר ספיידר',
    suitMode1: 'סדרה 1 (קל)',
    suitMode2: '2 סדרות (בינוני)',
    suitMode4: '4 סדרות (מומחה)',
    score: 'ניקוד',
    moves: 'מהלכים',
    time: 'זמן',
    undo: 'בטל',
    redo: 'בצע שוב',
    hint: 'רמז',
    newGame: 'חדש',
    twists: 'טוויסטים',
    dailyChallenge: 'אתגר יומי',
    statistics: 'סטטיסטיקה והישגים',
    settings: 'הגדרות ורמת קושי',
    mute: 'השתק אפקטים',
    unmute: 'הפעל אפקטים',
    musicMute: 'השתק מוזיקה',
    musicUnmute: 'הפעל מוזיקה',
    musicVolume: 'עוצמת מוזיקה:',

    cardsRemaining: 'קלפים שנותרו',
    completedSuitsTitle: 'סדרות שהושלמו',
    emptyFoundation: 'תא סדרה ריק',
    completedRunTitle: (suit) => `הושלמה סדרת ${suit}`,
    stockEmpty: 'אין קלפים נוספים בקופה',
    stockFillWarning: (count) => `יש למלא ${count} עמוד${count > 1 ? 'ות ריקות' : 'ה ריקה'} לחלוקה`,
    stockDealTooltip: (dealsLeft) => `חלק 10 קלפים (נותרו ${dealsLeft} חלוקות)`,
    stockDealAlert: (count) => `לא ניתן לחלק קלפים כאשר ישנן ${count} עמוד${count > 1 ? 'ות ריקות' : 'ה ריקה'}! הזז קלפים למילוי כל העמודות, או אפשר ״חלוקה חופשית״ בהגדרות.`,

    victoryTitle: 'ניצחון!',
    victorySubtitle: 'כל 8 הסדרות הושלמו בהצלחה!',
    finalScore: 'ניקוד סופי',
    totalMoves: 'סה״כ מהלכים',
    clearTime: 'זמן פינוי',
    playAnother: 'משחק חדש',

    dailyTitle: 'אתגר יומי',
    dailyDesc: 'בכל יום נוצרת חלוקת קלפים ייחודית וזהה לכל השחקנים בעולם. התחרו עם שחקנים אחרים על אותו לוח בדיוק!',
    selectDate: 'בחר תאריך לאתגר:',
    deckSeed: 'קוד חפיסה',
    shareSeed: 'שתף קוד',
    copied: 'הועתק!',
    playChallenge: 'שחק באתגר',
    cancel: 'ביטול',

    statsTitle: 'סטטיסטיקת שחקן',
    tabOverall: 'כללי',
    tab1Suit: 'סדרה 1',
    tab2Suits: '2 סדרות',
    tab4Suits: '4 סדרות',
    played: 'משחקים',
    won: 'נצחונות',
    winRate: 'אחוז נצחונות',
    bestScore: 'שיא ניקוד',
    bestTime: 'זמן שיא',
    bestStreak: 'רצף שיא',
    resetStats: 'איפוס נתונים',
    resetConfirm: 'האם אתה בטוח שברצונך לאפס את כל הסטטיסטיקות?',
    close: 'סגור',

    settingsTitle: 'הגדרות משחק',
    languageLabel: 'שפה / Language:',
    langEn: 'English',
    langHe: 'עברית',
    difficultyLabel: 'רמת קושי (כמות סדרות):',
    relaxedDealing: 'חלוקה חופשית',
    relaxedDealingDesc: 'אפשר חלוקת קלפים מהקופה גם כאשר יש עמודות ריקות',
    proceduralSound: 'אפקטי צליל חיים',
    volume: 'עוצמת שמע:',
    twistsEngine: 'מנוע טוויסטים פרוגרסיבי',
    twistsEngineDesc: 'הפעל חפצי קסם פסיביים ולחשים מיוחדים (בסגנון Balatro)',
    loadSeedLabel: 'טען קוד חפיסה ידני:',
    loadButton: 'טען',
    done: 'אישור',

    // Deck Selection
    deckThemeLabel: 'עיצוב קלפים ושולחן:',
    selectDeck: 'בחר חפיסה',
    deckClassic: 'קלאסי מלכותי',
    deckClassicDesc: 'קלפים אלגנטיים עם מסגרת מוזהבת ולבד ירוק עשיר.',
    deckCelestial: 'נאון קוסמי',
    deckCelestialDesc: 'קלפי אמנות נאון קיברנטיים, זוהר ציאן ומגנטה ושולחן חלל עמוק.',
    deckUpcoming: 'חפיסת מופת חדשה',
    deckUpcomingDesc: 'חפיסה חדשה בעיצוב מקורי שנמצאת כעת בפיתוח. בקרוב!',
    comingSoon: 'בקרוב',

    // Live Presence
    playersOnline: (count) => `${count} שחקנים מחוברים כעת`,
    playersOnlineShort: (count) => `${count} מחוברים`,
    activePlayersTooltip: 'שחקנים פעילים במשחק ברגע זה',

    twistsModalTitle: 'טוויסטים וחפצי קסם',
    twistsModalDesc: 'הצטייד בחפצים פסיביים או הפעל לחשים מתכלים כדי לשנות את החוקים הקלאסיים ולגלות סגנונות משחק חדשים.',
    passiveRelicsHeader: 'חפצים פסיביים (ניתן לשלב בחופשיות)',
    consumableSpellsHeader: 'לחשים מתכלים',
    chargesLeft: 'שימושים נותרו',
    cast: 'הפעל',
    castSuccess: (name) => `הפעלת את ${name}! הכוח מומש.`,
    twistsActiveBadge: '🕸️ טוויסטים פעילים',

    relics: {
      silk_thread: {
        name: 'חוט משי',
        desc: 'מאפשר לגרור רצף יורד גם אם יש בו מעבר סדרה 1.',
      },
      xray_lens: {
        name: 'עדשה ספקטרלית',
        desc: 'חושפת את הקלף המוסתר שנמצא ישירות מתחת לקלף הגלוי הראשון.',
      },
      golden_web: {
        name: 'קורי זהב',
        desc: 'מכפיל את הניקוד (+200 במקום +100) בכל פעם שמשלימים סדרה.',
      },
      spider_magnet: {
        name: 'מגנט עכביש',
        desc: 'בחלוקת קופה, קלפים בעלי אותה סדרה נמשכים לעמודות תואמות.',
      },
    },

    consumables: {
      suit_transmute: {
        name: 'התמרת סדרה',
        desc: 'משנה רצף נייד לסדרה התואמת את עמודת היעד.',
      },
      spider_sense: {
        name: 'חוש עכביש',
        desc: 'חושף זמנית את כל הקלפים ההפוכים על הלוח למשך 10 שניות.',
      },
      web_shuffle: {
        name: 'אורג הקורים',
        desc: 'מסדר מחדש קלפים גלויים בעמודה נבחרת כדי למקסם רצפים מאותה סדרה.',
      },
    },

    noStrategicMoves: 'לא נמצאו מהלכים אסטרטגיים על הלוח. חלק קלפים חדשים מהקופה!',
    gameBlocked: 'אין עוד מהלכים אפשריים! המשחק נחסם.',

    titleScreenPlay: 'התחל משחק',
    titleScreenDaily: 'אתגר יומי',
    titleScreenTagline: 'חוויית הסוליטר המלכותית • טוויסטים פרוגרסיביים',
    selectDifficulty: 'בחר רמת קושי:',
    titleScreenSkip: 'כניסה מהירה',
  },
};
