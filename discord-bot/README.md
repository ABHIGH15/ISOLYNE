# Isolyne Discord Bot Companion (Technical Proof-of-Concept)

> **The disagreement detector for teams that move too fast to argue.**  
> A standalone proof-of-concept demonstrating Isolyne's deterministic alignment detection running live outside the mobile application.

---

## What This Is (and What It Isn't)

- **What it is:** A standalone, local Node.js process that connects outbound to the Discord Gateway via WebSockets. It intercepts messages in real time, executes Isolyne's pure parsing and consensus detection logic, and alerts the team in-channel the moment contradictory technical choices emerge.
- **What it is not:** It is **not** connected to the mobile app's local `AsyncStorage`, and it does **not** sync cross-device. Isolyne's mobile client is deliberately built backend-free to maintain privacy, instant offline speed, and zero infrastructure overhead. This bot companion exists to answer the hackathon question *"Why not just use Slack or Discord?"* with working, on-camera code proving the core detection algorithm is completely channel-agnostic.

---

## How It Works

```
Discord Message (Gateway WebSocket)
  ↓
interpretStatement() [src/services/llmParser.ts]
  ↓
In-Memory Reality State Projection (Transient, non-persisted)
  ↓
ConsensusGapDetector.detect() [src/kernel/detection/ConsensusGapDetector.ts]
  ↓
Deduplication Guard (channelId:topic:actors:choices signature)
  ↓
In-Channel Thread Alert (Discord reply)
```

1. **Passive Ingestion:** Messages are read over Discord's Gateway using the `GuildMessages` and `MessageContent` intents.
2. **Reused Core Logic:** Directly imports and invokes `src/services/llmParser.ts` (Gemini 3.7 Flash with deterministic keyword fallback) and `src/kernel/detection/ConsensusGapDetector.ts` (pure domain CQRS detection).
3. **In-Memory Channel Radar:** Maintains transient, non-persisted state per channel. Deliberately leaves no database footprint.
4. **Deterministic Deduplication:** Uses a signature scheme to guarantee that identical repeated statements never trigger duplicate alerts.

---

## Setup & Running

### Prerequisites
- Node.js `v18+` (verified on Node `v24.18.0`)
- Discord Bot Application with **Message Content Intent** enabled under Privileged Gateway Intents

### Configuration
Create `.env` inside `discord-bot/`:
```env
DISCORD_BOT_TOKEN=your_bot_token_here
```
*(Optional: Set `EXPO_PUBLIC_GEMINI_API_KEY=your_key` to use live Gemini 3.7 Flash instead of the deterministic fallback parser)*

### Commands
```bash
# Install subproject dependencies
npm install

# Run automated deduplication & detection test suite
npm test

# Run TypeScript compiler check
npm run typecheck

# Start the bot daemon for demo recording
npm start
```

---

## Voice & Tone

When a consensus gap is detected, the bot speaks in Isolyne's calm, deterministic tone:

> **Isolyne detected a gap:** @Alice said Postgres, @Bob said Mongo — same topic (database), different choices.  
> *Your team is running with different assumptions about database. Aligning now will save hours of rework.*

No gamification, no unsolicited conversation, no AI fluff. Silence until drift occurs.
