# 🧭 Project Isolyne — Devpost Submission Draft

> **Target Categories:**  
> 🥇 **Next Gen Track** (Primary — Source code review + 90s demo video)  
> 🥈 **HAMM Award** (Secondary — Creative RevenueCat monetization: purchase-as-story-beat & Moment of Doubt trigger)  
> *(Note: Explicitly non-targeting Grand Prize / Design Award)*

---

## 💡 Elevator Pitch
**"Small, fast-moving teams don't fail because they can't code — they fail because Alice thinks they are using Postgres and Bob is setting up Firebase. Silence is a feature, until you drift."**

Isolyne is a deterministic alignment radar for temporary teams. It runs silently in the background, parses natural chat into immutable CQRS signals, and mathematically surfaces consensus, ownership, and interpretation gaps before they turn into 3 AM merge conflicts.

---

## 🧗 The Problem: The "Silent Nod" Fallback

Small, fast-moving teams during hackathons and crunch sprints face a universal coordination breakdown:

1. **The "Silent Nod" Fallback:** Polite silence is frequently mistaken for consensus. Teammates assume everyone agrees on the tech stack, API contracts, and MVP boundary until 3 AM integration emergencies.
2. **The 3 AM Churn:** Teams waste critical hours in circular architectural debates while zero lines get pushed, or quietly build contradictory components (e.g. Alice builds for Postgres while Bob sets up Mongo).
3. **The Unilateral Fear:** Builders hate feeling bureaucratic or micromanaged. Traditional project management tools (Jira, Linear) demand heavy upfront maintenance and get abandoned within four hours.

Isolyne solves this by remaining 100% invisible until shared reality breaks.

### 💬 Why Isolyne Instead of General Chat (Slack/Discord)?
* **5-Second Input vs. 3-Hour Rework:** Casual chat messages scroll away and get buried. In Isolyne, dropping a single line (*"Going with Postgres"*) takes 5 seconds, but immediately updates the team's shared reality projection and catches unspoken disagreement.
* **Distraction-Free Dedicated Radar:** Isolyne is not another general messenger — it is an immutable alignment radar, consensus resolver, and retrospective ledger for temporary squads.
* **Proven Channel-Agnostic Detection (Working Proof-of-Concept):** Isolyne's detection logic isn't locked to the mobile app UI. The codebase includes [`discord-bot/`](file:///Users/abhi/PROJECTS%202/HACKOS/discord-bot/), a working technical proof-of-concept running the exact same pure parser and consensus detection kernel against a live Discord channel. When two teammates post conflicting choices on the same topic, the bot intercepts the divergence and alerts the thread in real time. This proves the feasibility of passive capture without workflow disruption. It is deliberately a local prototype demonstrating algorithmic portability, not an always-on cloud service or live-synced mobile backend.

---

## 🛠️ System Architecture & Engineering Boundaries

Isolyne is built on an event-sourced, CQRS kernel running strictly on-device, paired with an isolated LLM extraction boundary:

```text
Natural Language Input (Decisions Channel)
         ↓
Isolated LLM Parser (Groq openai/gpt-oss-20b default / Gemini 3.7 Flash)
         ↓
Structured Signal Stream (Signal.ts)
         ↓
Pure Projection Function (RealityProjection.ts)
         ↓
Current RealityState
         ↓
Deterministic Gap Detectors (OwnershipGap, InterpretationGap, ConsensusGap)
         ↓
Radar UI (Clear vs Divergence + Verbatim Evidence)
```

### Architectural Guarantees & Verification
* **100% Deterministic CQRS Kernel:** All signals (`member_joined`, `decision_stated`, `alignment_agree`) are immutable. Gap detection is performed by pure TypeScript evaluators ([`src/kernel/detection/`](file:///Users/abhi/PROJECTS%202/HACKOS/src/kernel/detection/)), eliminating non-deterministic LLM hallucination in safety-critical state evaluation.
* **Strict LLM Isolation & Dual-Provider Architecture:** Natural language extraction ([`src/services/llmParser.ts`](file:///Users/abhi/PROJECTS%202/HACKOS/src/services/llmParser.ts)) is strictly isolated behind a clean provider contract (`{ topic, choice }` JSON signals):
  * **Default: Groq (`openai/gpt-oss-20b`)** — Selected as the default recording and runtime engine. In live benchmark testing across our full demo script (30 live calls), Groq delivered **0 schema errors** and a **674ms median latency** with zero daily rate-limit risk.
  * **Alternative: Google Gemini 3.7 Flash** — Supported via `EXPO_PUBLIC_LLM_PROVIDER=gemini`. While architecturally capable, Gemini free-tier keys enforce a strict 20-request/day ceiling (`GenerateRequestsPerDayPerProjectPerModel-FreeTier`) with a 24-hour lockout, making Groq the reliable operational choice for recording takes and rehearsals.
  * **Safety Net: Local Fallback Parser** — An offline deterministic keyword parser with dedicated Scope-vs-Database boundary handling ensures the app never crashes or blocks if API keys are missing or network drops.
  * The LLM **never** decides whether the team is aligned or detects gaps.
* **Deliberate Scoping & Known Limitations:** In this production release, we deliberately focused on the **3 highest-frequency coordination failures** (Ownership Gap, Interpretation Gap, and Consensus Gap) with rigorous invariant tests, rather than shallowly implementing our full 8-moment taxonomy. The remaining 5 gap types (Authority, Horizon, Allocation, Context, Execution) are fully architected in specs for subsequent iterations.
* **Invariant Test Suite:** The mobile application is verified by **56 automated Vitest tests** across 6 test suites covering the kernel, multi-project services, dual LLM parser boundary (including Groq and Gemini degradation paths), paywall impact calculation, and RevenueCat purchasing/Customer Center logic ([`src/kernel/tests/kernel.test.ts`](file:///Users/abhi/PROJECTS%202/HACKOS/src/kernel/tests/kernel.test.ts), [`src/services/__tests__/projects.test.ts`](file:///Users/abhi/PROJECTS%202/HACKOS/src/services/__tests__/projects.test.ts), [`src/services/__tests__/llmParser.test.ts`](file:///Users/abhi/PROJECTS%202/HACKOS/src/services/__tests__/llmParser.test.ts), [`src/services/__tests__/impactCalculator.test.ts`](file:///Users/abhi/PROJECTS%202/HACKOS/src/services/__tests__/impactCalculator.test.ts), [`src/services/__tests__/purchases.test.ts`](file:///Users/abhi/PROJECTS%202/HACKOS/src/services/__tests__/purchases.test.ts), [`src/services/__tests__/customerCenter.test.ts`](file:///Users/abhi/PROJECTS%202/HACKOS/src/services/__tests__/customerCenter.test.ts)). Separately, the standalone Discord bot proof-of-concept includes its own 5-assertion scenario test verifying deduplication and gap detection in isolation ([`discord-bot/src/dedup.test.ts`](file:///Users/abhi/PROJECTS%202/HACKOS/discord-bot/src/dedup.test.ts)):
  * Invariant: Conflicting database choices trigger `consensus_gap` ([`kernel.test.ts:L24-L30`](file:///Users/abhi/PROJECTS%202/HACKOS/src/kernel/tests/kernel.test.ts#L24-L30)).
  * Invariant: Sequential decision updates supersede previous choices cleanly ([`kernel.test.ts:L32-L40`](file:///Users/abhi/PROJECTS%202/HACKOS/src/kernel/tests/kernel.test.ts#L32-L40)).
  * Invariant: Conflicting scope/MVP definitions trigger `interpretation_gap` with `mode: 'definition'` ([`kernel.test.ts:L147-L165`](file:///Users/abhi/PROJECTS%202/HACKOS/src/kernel/tests/kernel.test.ts#L147-L165)).
  * Invariant: Gap priority resolves in strict order: $\text{Ownership} \rightarrow \text{Interpretation} \rightarrow \text{Consensus}$ ([`kernel.test.ts:L167-L193`](file:///Users/abhi/PROJECTS%202/HACKOS/src/kernel/tests/kernel.test.ts#L167-L193)).
  * Invariant: Subscription state transitions and preview fallbacks operate deterministically ([`purchases.test.ts:L1-L98`](file:///Users/abhi/PROJECTS%202/HACKOS/src/services/__tests__/purchases.test.ts#L1-L98), [`customerCenter.test.ts:L1-L54`](file:///Users/abhi/PROJECTS%202/HACKOS/src/services/__tests__/customerCenter.test.ts#L1-L54)).

---

## 💰 Monetization Philosophy & The HAMM Award

### 1. The Purchase-as-Story-Beat: The "Moment of Doubt"
Most B2B and developer tools bury their upgrade flow in a hidden settings menu or gate critical safety features behind arbitrary seat limits that penalize small teams.

**Isolyne re-architects monetization around the user's emotional journey:**
* **Free Tier Guarantees 100% Team Safety Forever:** Real-time drift detection, radar sweeps, and 1-tap consensus alignment are completely free for all squad sizes. No project ever breaks because the team hit a paywall.
* **The "Moment of Doubt" Paywall Trigger ([`app/radar.tsx:L140-L160`](file:///Users/abhi/PROJECTS%202/HACKOS/app/radar.tsx#L140-L160)):**
  Isolyne Pro is offered the exact second the squad's Radar goes red on an active divergence, when the emotional and practical value of alignment is undeniable.
  > *"Isolyne Pro isn't sold in a settings menu — it's offered the moment your team's Radar goes red, when the value of alignment is undeniable. Free forever: detection. Pro: the resolution history and evidence trail that prevents the next drift."*
* **Pro Monetizes the Permanent Record (`isolyne_pro`):** Pro unlocks the complete retrospective export, immutable signal audit trail, and cross-project organizational memory.

### 2. RevenueCat Offering & Two Packages
* **Entitlement Identifier:** `isolyne_pro` via `react-native-purchases`.
* **Offering Structure:** Configured with a `default` Offering containing two packages:
  * **Monthly (`$rc_monthly`):** Flexible month-to-month subscription for single sprint projects.
  * **Annual (`$rc_annual`):** Long-term squad subscription configured with an automated **Introductory Offer** (e.g. 50% discount on the first billing period) to remove initial friction for student teams.
  *(Note: Figures in the current prototype represent illustrative baseline pricing configured in RevenueCat sandbox: $4.99/mo, $39.99/yr, $19.99 intro discount; final production pricing tiers to be tuned upon store launch).*

### 3. Customer Center & Retention Management
* **Native Architecture ([`node_modules/react-native-purchases-ui`](file:///Users/abhi/PROJECTS%202/HACKOS/node_modules/react-native-purchases-ui)):** Utilizes RevenueCat's `CustomerCenterView` where cancellation surveys, refund requests, and StoreKit promotional retention offers (e.g. 50% retention discount) are managed dynamically in the RevenueCat dashboard without requiring client app redeployment.
* **Judge & Preview Simulation ([`app/customer-center.tsx:L88-L198`](file:///Users/abhi/PROJECTS%202/HACKOS/app/customer-center.tsx#L88-L198)):**
  To allow hackathon judges and reviewers in Expo Go / Web to experience the retention flow without needing sandbox Apple/Google credentials, our fallback UI provides an offline scripted simulation of the survey and 50% retention discount offer, honestly labeled as a demo simulation.

### 4. Financial Viability & Unit Economics
* **Value-to-Cost Ratio:** A single unresolved divergence can easily cost a team dozens of hours of frantic rework during crunch time. A lightweight subscription easily justifies itself on the first avoided 3 AM architectural conflict.
* **Near-Zero Marginal Inference Costs:** By isolating the LLM parser exclusively to natural-language string extraction (and falling back to local word-boundary regex when offline), Isolyne consumes fractions of a cent per active squad, providing exceptionally high gross margins.

---

## 🔄 #BuildInPublic: The Real Pivot Story

Our repository contains the honest history of our pivot in [`archive/pre-pivot-artifacts/`](file:///Users/abhi/PROJECTS%202/HACKOS/archive/pre-pivot-artifacts/README.md):

1. **The Failed Prototype (SquadRadar v0.1):** We originally built a complex "radar of nearby teams" featuring 16 team composition patterns and multi-squad broadcast channels.
2. **The Realization:** We realized that temporary teams don't fail from lack of awareness of *other* squads; they fail because their *own* team is running on unverified assumptions and the illusion of agreement.
3. **The Radical Pivot:** We archived 25 pre-pivot specifications into [`archive/pre-pivot-artifacts/`](file:///Users/abhi/PROJECTS%202/HACKOS/archive/pre-pivot-artifacts/README.md), archived the multi-team scaffolding, and rebuilt from scratch around a lightweight CQRS event engine with a single-minded focus: **Collaboration Intelligence for the single active squad**.

---

## 📦 Submission Deliverables

* **Repository:** Public GitHub repository containing complete source code, test suites, and architecture specs.
* **Demo Video (90s):** Full walkthrough following [`docs/demo-video-script.md`](file:///Users/abhi/PROJECTS%202/HACKOS/docs/demo-video-script.md), legible on mute within the first 5 seconds.
* **Next Gen Eligibility:** Eligible student entry (Section 3 parental consent noted for final submission).
