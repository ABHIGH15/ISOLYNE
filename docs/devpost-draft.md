# Isolyne

**The disagreement detector for teams that move too fast to argue.**

<!-- TODO: Insert Hero Image/Screenshot showing the Postgres vs Firebase conflict -->
![Isolyne Hero Placeholder](docs/assets/placeholder-devpost-hero.png)

## Inspiration: The Silent Drift
Small teams don't fail from bad code. They fail from the illusion of agreement. 

Your teammate is building on Firebase. You're building on Postgres. Neither of you knows, and you won't find out until integration hell at 3 AM the night before the deadline. 

Traditional project management tools demand heavy upfront bureaucracy and are abandoned within four hours of a hackathon. Team chat buries critical architectural decisions in noise. We built **Isolyne** to sit between them: an offline-first, deterministic collaboration radar that projects a shared reality and alerts the team the exact moment a contradiction occurs.

## What it does
Isolyne watches your team's assumptions and catches conflicts before they become blockers. The loop is three steps:

1. **State:** You casually tell Isolyne what you're working on (e.g., *"I'm going with Postgres for the DB"*).
2. **Detect:** Isolyne's kernel mathematically compares your statement against the rest of the squad's assumed reality.
3. **Resolve:** If a gap is detected (e.g., Bob previously committed to Firebase), the Radar instantly flags the divergence and prompts a 1-tap alignment resolution.

## How we built it: Deterministic CQRS & Isolated LLMs

<!-- TODO: Insert Architecture Diagram -->
![Architecture Diagram Placeholder](docs/assets/placeholder-architecture.png)

We deliberately isolated LLM unpredictability away from the system's core logic. The LLM is **never** used to decide if the team is aligned or to detect gaps.

* **Extraction Layer:** Parses casual chat into strict, structured JSON (`{ topic: 'Database', choice: 'Postgres' }`). We use Groq (Llama 3) for ultra-fast extraction, with Gemini as a fallback. Crucially, we built a **completely offline local keyword parser** as the ultimate fallback. This is a foundational privacy and trust feature: your team's internal disagreements and architectural secrets never have to leave the device.
* **Evaluation Kernel (Deterministic TypeScript):** A pure mathematical CQRS event engine. It manages state via `decision_stated` and `divergence_detected` signals. 
* **The Detector Taxonomy:** We identified 8 critical coordination failures in fast-moving teams. We have fully built and shipped **4 out of 8** for this release:
  - ✅ **Consensus Gap:** Different technical solutions for the same domain.
  - ✅ **Interpretation Gap:** The team uses the same words but defines the MVP differently.
  - ✅ **Timeline Gap:** Misaligned or ambiguously defined deadlines.
  - ✅ **Ownership Gap:** A critical decision has no designated final decider.
  - 🚧 *(Designed, Not Built: Authority, Allocation, Context, Execution)*

The mobile application is verified by **64 automated Vitest tests** covering the kernel, LLM parser boundary degradation paths, and our RevenueCat purchasing logic.

## Challenges we ran into

Building a pure event-sourced kernel that handles ambiguous human timelines resulted in some serious engineering war stories:

* **The Gemini Schema Regression:** When adding our Timeline detector, we updated our LLM schema to make the `timeline_choice` object optional. To do this, we removed the base `choice` string from the `required` array. This inadvertently caused the LLM to silently drop the `choice` field on *standard* categorical decisions, silently degrading our three most reliable detectors. We had to enforce strict conditional schema requirements to fix it.
* **Anchor-Timestamp Forwarding:** To ensure our CQRS replay remained 100% deterministic, relative dates (like "Friday") couldn't be parsed based on wall-clock time. We had to meticulously thread `anchorTimestamp` properties all the way down through the LLM parser so that "Friday" always evaluates relative to the exact millisecond the message was originally sent.
* **Temporal vs. String Deduplication:** In the UI, if Alice says "Friday", Bob says "3pm Friday", and Carol says "the 25th", the resolution chips initially showed three conflicting options. We had to rewrite the proposal generator's deduplication logic to bucket by *resolved ISO instant* and temporal granularity, rather than raw text, to accurately reflect that Alice and Carol were actually in agreement.

## Monetization Philosophy & The HAMM Award

Isolyne re-architects monetization around the user's emotional journey using **RevenueCat**:
* **Free Tier Guarantees 100% Team Safety Forever:** Real-time drift detection and 1-tap consensus alignment are completely free. No project ever breaks because the team hit a paywall.
* **The "Moment of Doubt" Paywall Trigger:** Isolyne Pro isn't sold in a settings menu. It's offered the exact second the squad's Radar goes red on an active divergence, when the emotional and practical value of alignment is undeniable.
* **Pro Monetizes the Permanent Record:** Upgrading unlocks the complete retrospective export, immutable signal audit trail, and cross-project organizational memory via RevenueCat's Native Customer Center.

## What's next for Isolyne
We plan to ship the remaining 4 gap detectors (Authority, Allocation, Context, Execution) and build out the Isolyne Pro retrospective export features. 

But our true roadmap focuses on making the mobile experience completely frictionless:
* **The Daily Temp Check:** Instead of ambient surveillance, a single daily push notification ("Did anything change since yesterday?") that opens a 1-tap mini-scratchpad.
* **Passive Chat Ingestion:** Integrating our working Discord bot POC to ingest assumptions directly from team channels, eliminating explicit logging entirely.
* **Live Activities & Dynamic Island:** Broadcasting the team's Radar status live on the lock screen during active build sessions, so you always know if the team is aligned without ever opening the app.