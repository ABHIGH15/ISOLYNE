# Isolyne

> *"Small, fast-moving teams don't fail because they can't code — they fail because Alice thinks they are using Postgres and Bob is setting up Mongo. Silence is a feature, until you drift."*

**Isolyne** is a deterministic alignment radar for fast-moving software teams. It listens to decisions stated in natural language, projects shared team reality, and deterministically detects awareness gaps before silence turns into irreversible architectural drift.

Built for [RevenueCat Shipaton 2026](https://www.revenuecat.com/).

---

## The Problem: The Drift of Silence

In hackathons and early-stage sprints, teams rarely argue — they simply assume.

- Alice says: *"Postgres is locked in."*
- 20 minutes later, Bob says: *"Setting up Firebase for speed."*
- Neither notices the contradiction until integration hour at 3 AM.

Traditional tools either manage tasks (Jira, Linear) or host chat (Slack, Discord). None continuously calculate whether the team actually shares a unified reality.

---

## The Solution: Collaboration Intelligence

Isolyne provides a continuous, deterministic awareness engine:

1. **Decisions Channel** — Teammates state decisions naturally (*"Going with React Native"*). An isolated LLM parser extracts `{ actor, topic, choice }`.
2. **Reality Projection** — Replays the immutable signal stream through a pure projection function.
3. **Deterministic Radar** — Mathematical gap detectors highlight consensus contradictions and unowned critical paths without AI guesswork.
4. **Verbatim Evidence & Resolution** — Tapping a detected gap reveals the exact quotes from each teammate, with 1-tap actions to Align or Challenge.
5. **Timeline & Pro Archive** — Full chronological ledger of team signals, commitments, and historical records.

---

## System Architecture

```text
Natural Language Input (Decisions Channel)
         ↓
LLM Parser (Gemini 3.7 Flash + Keyword Fallback)
         ↓
Structured Signal { actorId, topic, choice, verbatim }
         ↓
CQRS Signal Repository (AsyncStorage / In-Memory)
         ↓
Pure Projection Function (RealityProjection.ts)
         ↓
Current RealityState
         ↓
Deterministic Gap Detectors (OwnershipGap, InterpretationGap, ConsensusGap)
         ↓
Radar UI (Clear vs Divergence + Verbatim Evidence)
```

### Architecture Guarantees & Boundaries

- **The CQRS / Event-Sourced Kernel is 100% Deterministic:** Signals are immutable. Gaps are mathematical contradictions evaluated by pure TypeScript detectors (`OwnershipGapDetector.ts`, `InterpretationGapDetector.ts`, `ConsensusGapDetector.ts`).
- **Strict LLM Isolation:** Gemini 3.7 Flash (`src/services/llmParser.ts`) has only one job: parsing natural language chat strings into `{ topic, choice }` JSON signals. The LLM **never** reasons about team alignment or gap detection.
- **Offline-First Resilience:** In-memory repositories with `AsyncStorage` persistence guarantee zero external database latency and zero network failure modes during live demos.

---

## Monetization Model (RevenueCat)

**Philosophy:** *Never gate the safety feature. Free tier keeps the team safe; Pro monetizes the accumulated record.*

- **Free Tier (100% Free Forever):** Continuous drift detection, live radar status, and consensus gap resolution.
- **Isolyne Pro (`isolyne_pro`):** Unlocks full collaboration timeline history, cross-project memory, and timeline exports.

SDK: `react-native-purchases` + `react-native-purchases-ui`  
Entitlement: `isolyne_pro`

---

## Application Structure

```text
HACKOS/
├── app/
│   ├── _layout.tsx           # Master shell, TopNav, RevenueCat init, Onboarding modal
│   ├── index.tsx             # Project Hub: Roster, Live Radar status, Guided First Run
│   ├── projects.tsx          # Local Workspace Ledger: create, switch, and delete projects
│   ├── team.tsx              # Active Project Team Management: add/remove teammates
│   ├── radar.tsx             # Concentric Radar motif, Gap cards, 1-tap resolution actions
│   ├── decisions.tsx         # Decisions stream + StatementChannel with 1-tap starters
│   ├── timeline.tsx          # Chronological signal & commitment ledger
│   ├── paywall.tsx           # RevenueCat Pro Paywall
│   └── customer-center.tsx   # RevenueCat Customer Center (subscription management)
├── src/
│   ├── presentation/
│   │   ├── theme/tokens.ts   # Dark-mode design system: color, type, space, radius
│   │   ├── components/
│   │   │   ├── StatementChannel.tsx  # Natural language input + identity switcher
│   │   │   ├── RadarMotif.tsx        # Animated concentric radar sweep & pulse
│   │   │   └── OnboardingModal.tsx   # 3-step setup (Philosophy, Name, Roster)
│   │   └── state/KernelContext.tsx   # React Context bridging UI to CQRS engine
│   ├── services/
│   │   ├── projectService.ts # Pure local project & roster lifecycle management
│   │   ├── llmParser.ts      # Bounded Gemini 3.7 Flash parser + offline fallback
│   │   ├── purchases.ts      # RevenueCat SDK wrapper (isolyne_pro entitlement)
│   │   ├── kernelService.ts  # Singleton CQRS kernel & AsyncStorage persistence
│   │   └── __tests__/        # Service tests (projects, purchases, customer center, parser)
│   └── kernel/
│       ├── CIKernel.ts       # Event engine entry point
│       ├── domain/           # Signal, RealityState, AwarenessGap, Commitment
│       ├── detection/        # OwnershipGapDetector, InterpretationGapDetector, ConsensusGapDetector
│       ├── projection/       # RealityProjection (pure replay function)
│       └── tests/            # Deterministic Kernel Invariant Suite
├── discord-bot/              # Standalone Discord bot companion (passive capture POC)
│   ├── src/
│   │   ├── index.ts          # Gateway listener + ConsensusGapDetector integration
│   │   └── dedup.test.ts     # Deterministic deduplication test suite
│   ├── package.json          # Isolated subproject dependencies (discord.js v14)
│   └── README.md             # Architecture, demo setup, and run instructions
```

---

## 🗂️ Local Multi-Project & Team Management

Isolyne is built as an **offline-first, zero-login, local multi-project workspace**:

1. **Local Workspaces:** Create multiple isolated project ledgers on a single device (`isolyne_projects_v1`). Each project runs its own independent CQRS reality projection, radar state, and signal stream.
2. **Squad Isolation Invariant:** Strict squad isolation guarantees that gaps detected in Project A (e.g., a database consensus conflict) never leak into Project B.
3. **Project Deletion:** Purges project metadata, namespaced rosters (`isolyne_roster_${squadId}`), and associated signals from storage, safely falling back to remaining projects or the default squad.
4. **Team Management on Existing Projects:** 
   - Add teammates dynamically: appends to namespaced roster, emits a `member_joined` signal to the kernel, and guards against duplicate emissions.
   - Remove teammates: safely removes from active UI rotation and composer identities. Enforces device-owner protection at the service level.
5. **Append-Only Member Invariant:** In keeping with event-sourcing principles, the kernel signal ledger is append-only. Removing a teammate from the UI roster does not erase their historical statements, decisions, or timeline entries. If a project becomes solo, Radar allows the remaining lead to resolve ownership gaps with 1 tap (`Claim Ownership`).

---

## 🔍 For Judges & Code Reviewers

Key files demonstrating the architectural rigor, deterministic CQRS kernel, and RevenueCat integration:

| Area | Key File | Description |
|---|---|---|
| **Multi-Project & Roster Service** | [`projectService.ts`](file:///Users/abhi/PROJECTS%202/HACKOS/src/services/projectService.ts) | Pure TypeScript CRUD for local projects, squad-isolated rosters, and signal purging |
| **Multi-Project & Isolation Suite** | [`projects.test.ts`](file:///Users/abhi/PROJECTS%202/HACKOS/src/services/__tests__/projects.test.ts) | 14 automated tests verifying multi-project isolation, roster persistence, and solo resolution |
| **Deterministic Detectors** | [`src/kernel/detection/`](file:///Users/abhi/PROJECTS%202/HACKOS/src/kernel/detection/) | Pure TypeScript detectors (`OwnershipGapDetector.ts`, `InterpretationGapDetector.ts`, `ConsensusGapDetector.ts`) |
| **Pure CQRS Projection** | [`RealityProjection.ts`](file:///Users/abhi/PROJECTS%202/HACKOS/src/kernel/projection/RealityProjection.ts) | Pure event-replay function mapping immutable signal stream to current `RealityState` |
| **Kernel Invariant Suite** | [`kernel.test.ts`](file:///Users/abhi/PROJECTS%202/HACKOS/src/kernel/tests/kernel.test.ts) | Invariant tests verifying gap triggering, cross-squad isolation, and priority ordering |
| **Isolated LLM Boundary** | [`llmParser.ts`](file:///Users/abhi/PROJECTS%202/HACKOS/src/services/llmParser.ts) | Gemini 3.7 Flash structured extraction with deterministic keyword fallback |
| **RevenueCat Pro Paywall** | [`paywall.tsx`](file:///Users/abhi/PROJECTS%202/HACKOS/app/paywall.tsx) | "Moment of Doubt" paywall triggered from active radar gap with Monthly & Annual packages |
| **Customer Center** | [`customer-center.tsx`](file:///Users/abhi/PROJECTS%202/HACKOS/app/customer-center.tsx) | Native RevenueCat UI embedding + gated fallback with scripted retention offer simulation |
| **RevenueCat Service** | [`purchases.ts`](file:///Users/abhi/PROJECTS%202/HACKOS/src/services/purchases.ts) | Offering fetching, typed packages, introductory pricing, and customer info |
| **Discord Bot Companion** | [`discord-bot/`](file:///Users/abhi/PROJECTS%202/HACKOS/discord-bot/) | Standalone Gateway companion demonstrating passive drift detection in live channels |

---

## 🤖 Passive Capture Proof-of-Concept (`discord-bot/`)

Isolyne's detection logic isn't locked to the mobile app UI. The repository includes [`discord-bot/`](file:///Users/abhi/PROJECTS%202/HACKOS/discord-bot/), a working technical proof-of-concept running the exact same pure detection kernel against a live Discord channel.

When two teammates state conflicting choices on the same topic in Discord, the bot intercepts the drift and alerts the thread in real time. This demonstrates a path to passive capture without requiring teams to change how they already communicate.

> **Architectural Boundary:** This is an intentional standalone companion, not an always-on shipped feature. It connects outbound over Discord Gateway WebSockets and operates in-memory; it does not write into the mobile app's local `AsyncStorage`.

---

## 📌 Known Limitations & Scoping Decisions

* **Local-Only Scope (Zero-Login / No Backend):** There is no remote backend, authentication server, or cross-device cloud sync. All projects and rosters are local records stored in AsyncStorage on this device. Entitlements (`isolyne_pro`) remain device-level.
* **Append-Only Signal Stream:** Roster removal updates the UI participant list, but historical statements and signals authored by departed members remain preserved in the timeline ledger to maintain an honest retrospective record.
* **Deliberately Scoped Runtime:** In this version, we deliberately scoped the active runtime engine to the **3 most critical and high-frequency coordination failure modes**:
  1. `Ownership Gap` — Stated work without an assigned owner.
  2. `Interpretation Gap` — Teammates using the same word with conflicting definitions (e.g. Scope / MVP definition divergence).
  3. `Consensus Gap` — Direct architectural contradictions (e.g. conflicting database or framework choices).
* **Roadmap Extension:** The remaining 5 gap types from our collaboration taxonomy (*Authority, Horizon, Allocation, Context, Execution*) are documented in our architectural specs and scheduled for future engine releases.

---

## Getting Started

### Installation

```bash
npm install
```

### Running the App

```bash
npm start
```

Open via Expo Go, iOS Simulator, Android Emulator, or Web (`npm run web`).

### Automated Test Suite

```bash
npm test
```

Runs the Vitest suite verifying the deterministic CQRS kernel invariants, RevenueCat purchases/Customer Center services, and the LLM parser boundary.

### Type Verification

```bash
npx tsc --noEmit
```

### Web Export Build

```bash
npm run export:web
```

---

## License

MIT © 2026 Abhi Kumar


