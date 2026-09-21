# ♠️ Spider Solitaire Prime

> A luxury, modern, web-based Spider Solitaire game with progressive Balatro-inspired twists, deterministic daily challenges, URL seed sharing, procedural Web Audio, and complete Hebrew (עברית) localization.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)
![Vite](https://img.shields.io/badge/Vite-6.2-purple.svg)

---

## ✨ Features

- **3 Difficulty Modes:**
  - **1 Suit (Easy):** 8 decks of Spades — fast, relaxing play.
  - **2 Suits (Medium):** 4 decks of Spades & 4 decks of Hearts — tactical depth.
  - **4 Suits (Expert):** 2 decks of each suit — intense strategic challenge.
- **Authentic Spider Rules & Controls:**
  - Build descending sequences on tableau.
  - Multi-card same-suit run dragging and smart-click auto-move.
  - Stock dealing (10 cards at a time) with standard classic rule or relaxed toggle.
  - Automatic King-to-Ace completion sweep to foundations with celebratory fanfares.
- **Progressive Twist Engine (Balatro-style Relics & Spells):**
  - **Silk Thread:** Allows moving descending sequences with 1 cross-suit transition.
  - **Spectral Lens:** Reveals face-down cards underneath top tableau cards.
  - **Golden Web:** 2x score multiplier (+200 pts) for completing suits.
  - **Cobweb Magnet:** Pulls matching suits on stock deal.
  - **Consumables:** *Suit Transmute*, *Spider Sense* (10s board reveal), and *Tangle Weaver*.
- **Online & Community Features:**
  - **Daily Challenge:** Deterministic daily seed shared globally for worldwide competition.
  - **Shareable Seeds:** Copy custom seed URLs (`?seed=SPIDER-XXXX`) to challenge friends on identical decks.
  - **Player Statistics:** Games played, won, win rate %, best score, best streak, and clear times.
- **Procedural Web Audio API:**
  - Zero external audio files — instantaneous, synthesized card flips, felt slides, stock riffles, suit chimes, and victory fanfares.
- **Full Hebrew (עברית) & RTL Support:**
  - Complete bilingual dictionary (English & Hebrew).
  - Authentic Right-to-Left (RTL) layout with standard card pip orientations.
  - Instant one-click toggle (`EN` / `עב`) in the top navigation bar.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/mokedstore/solitair-clone.git
cd solitair-clone

# Install dependencies
npm install

# Run the local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
```

### Run Tests

```bash
npm run test
```

---

## 📜 License

MIT License © 2026
