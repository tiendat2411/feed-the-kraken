# 🦑 Feed The Kraken

> **An immersive, real-time multiplayer social deduction board game inspired by the legendary board game *Feed the Kraken*. Built with a dark-fantasy maritime aesthetic, real-time WebSocket architecture, and domain-driven game mechanics.**

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-19.x-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/vite-8.x-purple.svg)](https://vitejs.dev/)
[![Socket.IO](https://img.shields.io/badge/socket.io-4.8.x-black.svg)](https://socket.io/)
[![Tailwind CSS](https://img.shields.io/badge/tailwind-3.4.x-38bdf8.svg)](https://tailwindcss.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-amber.svg)](LICENSE)

---

## 🌊 Overview & Story

Set aboard the cursed sailing ship *Instabil*, 5 to 11 players must steer the vessel toward their secret destination while contending with treacherous officers, mutinous crewmates, and insidious cultists lurking in the shadows.

### ⚓ The Three Factions

| Faction | Icon | Objective & Victory Condition |
| :--- | :---: | :--- |
| **Sailors** | 🔵 | Steer the ship safely to **Bluewater Bay** (Blue destination at the top-right of the Sea Chart). |
| **Pirates** | 🔴 | Sabotage navigation and divert the vessel into **Crimson Cove** (Red destination at the bottom-right). |
| **Cult of the Kraken** | 🟣 | Lure the ship directly into the **Kraken's Sanctuary** (Yellow destination at the center-right), or successfully get the **Cult Leader thrown overboard** to summon the beast! |

---

## 🎮 Core Game Mechanics

### 1. 🎖️ Officer Hierarchy & Navigation Team
- **Captain (Thuyền trưởng):** The leader who nominates a Lieutenant and a Navigator, executes Map Actions, and commands the ship.
- **Lieutenant (Thuyền phó):** Confidant appointed by the Captain to draw and filter course cards.
- **Navigator (Hoa tiêu):** The final officer with hands on the helm, choosing which navigation card steers the vessel.

### 2. 🔫 Mutiny & Gun Bidding System
- When the crew loses faith in the Captain's appointments, anyone can start a **Mutiny Vote**.
- Players secretly bid their limited **Guns (`🔫`)**. The highest bidder instantly overthrows the Captain, takes the Captain's Hat, and nominates a brand-new navigation team.

### 3. 📜 Shuffled Logbook Navigation
1. The **Captain** draws 2 cards from the Navigation Deck, secretes 1 into the Logbook, and discards 1 face-down into the Discard Pile.
2. The **Lieutenant** draws 2 cards, puts 1 into the Logbook, and discards 1.
3. The Logbook is **shuffled**, and the **Navigator** selects 1 card to steer the vessel, discarding the other.

### 4. 🗺️ Dynamic Map Actions & Public Interrogations
- **Cabin Search:** The Captain secretly inspects a player's true faction loyalty (Cultists reveal their slippery tentacles).
- **Flogging:** The Captain publicly tortures a crew member to extract a public declaration carved in blood (**"NOT A SAILOR"**, **"NOT A PIRATE"**, or **"NOT A CULTIST"**).
- **Off with the Tongue:** Speech-restricted! The silenced crew member can no longer speak in chat or become Captain.
- **Feed to Kraken:** Throw a suspicious crewmate overboard! (Beware: sacrificing the Cult Leader immediately wins the game for the Cult!).
- **Supply Line Guns Refill:** Sailing across the supply lines recharges 3 guns for all active crew members.

### 5. 🔮 Secret Cult Uprising Rituals
- At midnight, the Cult Leader wakes to distribute hidden gun caches, search cabins in visions, or conduct dark midnight conversion rituals on susceptible crew members.

---

## 🎨 Art Direction — "Eldritch Parchment"

The user interface follows a bespoke **Eldritch Parchment** dark-fantasy theme:
- **Atmosphere:** Deep abyssal ocean gradients (`#080C14`), heavy dark vignettes, and ambient ember dust particles.
- **Surfaces:** Weathered oak wood panels (`wood_panel_clean.png`), authentic brass-hinged drawers, and ancient goat-hide parchment scrolls.
- **Typography:** 100% synchronized nautical Gothic typography using **Pirata One** and **Cinzel**.
- **Visuals:** Hand-crafted pirate portraits, carved wood status plates, glowing verdigris/ruby status gems, and bloody scourge whip-slash carvings.

---

## 🛠️ Technology Stack

### Backend
- **Runtime:** Node.js (ES Modules, `>=20.0.0`)
- **Server Framework:** Express.js & Socket.IO (`4.8.x`)
- **Domain Services:**
  - `RoomService`: Room state machine, lobby management, seating arrangement.
  - `NavigationService`: Draw pile, logbook shuffling, card execution.
  - `MutinyService`: Real-time gun bidding, mutiny resolution.
  - `ExecutionService`: Map actions (Flogging, Cabin Search, Feeding Kraken) & Cult Uprisings.
  - `EndGameService`: Victory checks & endgame state transitions.
- **Testing:** Node.js Native Test Runner (`node --test`), 31/31 unit tests covering all edge cases.

### Frontend
- **Framework:** React 19 + Vite 8
- **Styling:** Tailwind CSS 3.4 + Custom Canvas & CSS Sprite Animations
- **Icons:** Lucide React & High-definition isolated game sprites
- **Layout:** Dual-Pane In-Game Command Layout (60% Sea Chart + 40% Action Desk) & Interactive 11-player Seating Radar.

### Bot Sandbox & Testing Tools
- **Auto-Responder Engine:** Automated bot simulation supporting full 5 to 11-player automated test playthroughs (`scripts/bots/`).

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `>= 20.0.0`
- **npm**: `>= 10.0.0`

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/tiendat2411/feed-the-kraken.git
   cd feed-the-kraken
   ```

2. **Install root, backend, and frontend dependencies:**
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   cd ..
   ```

---

### 🏃 Running the Application

You can launch both the backend server and frontend development client simultaneously or independently:

#### Option A: Run concurrently from root
```bash
# Terminal 1: Backend Server (Port 3000)
npm run backend

# Terminal 2: Frontend Client (Port 5173)
npm run frontend
```

#### Option B: Run individually
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

Open your browser and navigate to `http://localhost:5173` to start playing!

---

### 🧪 Running Unit Tests & Bot Sandbox

#### Run Backend Unit Tests:
```bash
node --test backend/test/ExecutionService.test.js
```

#### Run Automated Bot Sandbox:
```bash
npm run test:bots
```

---

## 📁 Repository Structure

```text
feed-the-kraken/
├── .agents/                    # Custom agent rules & design skills
│   ├── rules/                  # Code quality, art direction & SOP rules
│   └── skills/                 # Design & engineering skill packs
├── backend/                    # Node.js + Express + Socket.IO Server
│   ├── src/
│   │   ├── config/             # Map layouts (Quick / Long Journey)
│   │   ├── models/             # Domain Entities (Room, Player, NavigationDeck...)
│   │   ├── services/           # Game Logic (Navigation, Mutiny, Execution...)
│   │   └── socket/             # Real-time event handlers & emitters
│   └── test/                   # Automated Unit Tests
├── frontend/                   # React 19 + Vite + Tailwind Client
│   ├── src/
│   │   ├── assets/ui/          # Sprites, frames, buttons & character avatars
│   │   ├── components/         # Game components (MapBoardUI, NavigationPhase...)
│   │   │   ├── game/           # CrewSeatingDrawer, EventModalOverlay
│   │   │   ├── lobby/          # CrewPlate, AvatarSelector, MapSelector
│   │   │   └── ui/             # PanelWood, CardParchment, ButtonWood, Vignette...
│   │   ├── pages/              # Home, Lobby, Game
│   │   └── index.css           # Eldritch Parchment design tokens & fonts
├── scripts/                    # Asset processing pipelines & Bot engine
├── spec/                       # Spec-Driven Development feature specifications
├── task.md                     # Project task tracker & implementation roadmap
├── package.json
└── README.md
```

---

## 📜 Spec-Driven Development (SDD)

This project strictly adheres to **Spec-Driven Development**. All core business requirements and use cases are fully documented under `/spec`:
- `BR-001` / `ENT-001` - `ENT-003`: Room Setup, Matchmaking & Seating Arrangement.
- `BR-002` / `UC-006` - `UC-008`: Team Appointments & Gun Mutiny Bidding.
- `BR-003` / `UC-009` - `UC-011`: Logbook Navigation & Emergency Decisions.
- `BR-004` / `UC-012` - `UC-015`: Ship Traversal, Map Actions & Cult Rituals.
- `BR-005` / `UC-016` - `UC-018`: Off-Duty Shifts & Win Condition Triggers.
- `BR-007` / `UC-021` - `UC-023`: Frontend "Eldritch Parchment" UI Revamp.

---

## ⚖️ License

Distributed under the **ISC License**. See `LICENSE` for more information.
