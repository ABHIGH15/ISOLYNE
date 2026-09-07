# Isolyne Current State

## Product Identity

Isolyne is a Collaboration Intelligence Engine.

It does not:
- manage tasks
- rank people
- monitor productivity
- replace PMs

It detects when teams believe they share reality but actually don't.

---

# Core Principle

Actual Shared Reality != Perceived Shared Reality

---

# Universal Pipeline

Signal
 ↓
Reality Projection
 ↓
Awareness Gap Detection
 ↓
Proposal
 ↓
Alignment
 ↓
Commitment
 ↓
Memory

---

# Gap Detectors Status

### Wired & Active in Pipeline (`src/kernel/detection/`)

1. **Ownership Gap** (`OwnershipGapDetector.ts`)
   - Hidden reality: Critical topics or multiple squad members have statements without an assigned owner.
   - Repair: Assignment

2. **Interpretation Gap** (`InterpretationGapDetector.ts`)
   - Hidden reality: Teammates state contradictory definitions or scope requirements on the same scope/MVP topic (e.g. Full CRUD vs Mock Prototype).
   - Repair: Definition / Scope alignment

3. **Consensus Gap** (`ConsensusGapDetector.ts`)
   - Hidden reality: Teammates state contradictory technical choices on the same topic (e.g. Postgres vs Mongo).
   - Repair: Alignment / Resolve / Challenge

### Designed in Taxonomy (Not Built / Not Wired in Pipeline)

The following gap types are conceptual specifications in the taxonomy documentation (`shared-reality-gap-taxonomy.md`) but are not built or wired in the runtime pipeline:

4. **Integration Gap** (Designed — system/component interface assumptions diverge; permanently excluded from runtime scope)
5. **Execution Gap** (Designed — progress assumptions differ)
6. **Pivot Gap** (Designed — timeline and ambition conflict)
7. **Meaning Gap** (Designed — same artifact, different strategic narrative)
8. **Learning Gap** (Designed — team knowledge disappears post-event)

---

# Current Implementation

Deterministic CQRS Kernel v1.0 + Expo UI.

### Implemented & Verified:
- **Immutable Signals (`Signal.ts`):** Append-only signal log scoped to `squadId`.
- **Pure Deterministic Projection (`RealityProjection.ts`):** Maps immutable signal history into `RealityState`.
- **Gap Detectors (`OwnershipGapDetector.ts`, `InterpretationGapDetector.ts`, `ConsensusGapDetector.ts`):** Mathematical contradiction detectors.
- **Evaluator Pipeline (`EvaluatorPipeline.ts`) & Priority Policy (`GapPriorityPolicy.ts`):** Strict priority sequence (Ownership → Interpretation → Consensus).
- **Alignment & Commitment Resolvers (`AlignmentEngine.ts`, `CommitmentResolver.ts`):** 1-tap resolution transitions.
- **Memory Extraction (`MemoryExtractor.ts`):** Captures alignment history and resolution rationale.
- **Local Multi-Project Management (`projectService.ts`, `app/projects.tsx`):**
  - Multiple isolated workspaces stored locally on device (`isolyne_projects_v1`).
  - Active workspace selection (`isolyne_active_project_v1`).
  - Project deletion with signal purging and safe fallback to remaining project or default.
  - Strict squad isolation: gaps, signals, and proposals never leak across project boundaries.
- **Team Management on Existing Projects (`projectService.ts`, `app/team.tsx`):**
  - Project-scoped namespaced rosters (`isolyne_roster_${squadId}`).
  - Add teammate: updates roster, emits `member_joined` signal to kernel, guards against duplicate dispatches.
  - Remove teammate: removes from active UI roster and composer identity; enforces owner protection at the service level.
  - **Append-Only Member Invariant:** The signal stream is strictly append-only. Removing a teammate from the UI roster does not erase past statements, decisions, or commitments from the timeline ledger.
  - **Ownership Gap Resolution UI:** Radar provides 1-tap `Claim (Owner)` or `Assign (Member)` buttons, allowing solo or multi-member squads to resolve ownership gaps without UX dead-ends.
- **Bounded Gemini 3.7 Flash Parser (`llmParser.ts`):** Natural language parsing with deterministic keyword fallback.
- **RevenueCat Pro Paywall (`isolyne_pro`, `app/paywall.tsx`):** Monthly and Annual packages with Customer Center management.
- **Screens (`app/`):**
  - `app/index.tsx` (Project Hub, Active Roster, Guided Run)
  - `app/projects.tsx` (Project Dashboard & Workspace Ledger)
  - `app/team.tsx` (Team Management & Roster)
  - `app/radar.tsx` (Concentric Radar Motif, Gap Cards, 1-Tap Resolutions)
  - `app/decisions.tsx` (Decisions Stream & Statement Composer)
  - `app/timeline.tsx` (Chronological Collaboration History)
  - `app/paywall.tsx` (Moment-of-Doubt Pro Upgrade)
  - `app/customer-center.tsx` (Subscription & Entitlement Management)


