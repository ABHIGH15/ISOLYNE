# Isolyne

**The disagreement detector for teams that move too fast to argue.**

<!-- TODO: Insert Hero Image/Screenshot showing the Postgres vs Firebase conflict -->
![Isolyne Hero Placeholder](docs/assets/placeholder-devpost-hero.png)

## Inspiration: The Silent Drift
Hackathon teams don't fail from bad code. They fail from the illusion of agreement. 

Your teammate went to sleep assuming you were building the backend on Firebase. You woke up and started building it in Postgres. Neither of you knows, and you won't find out until integration hell at 3 AM on Sunday. 

Traditional PM tools demand heavy upfront bureaucracy and are abandoned within four hours of a hackathon. Team chat buries critical architectural decisions in noise. We built **Isolyne** for the people building right next to us: an offline-first, deterministic collaboration radar that projects a shared reality and alerts the team the exact moment a contradiction occurs.

## What it does
Isolyne watches your team's assumptions and catches conflicts before they become blockers. The loop is three steps:

1. **State:** You casually log what you're working on (e.g., *"I'm going with Postgres for the DB"*).
2. **Detect:** Isolyne's kernel mathematically compares your statement against the rest of the squad's assumed reality.
3. **Resolve:** If a gap is detected, the Radar physically ruptures with a haptic fault-line alert. Tapping a resolution chip fires a 4-step pipeline: the engine records the team's choice, generates a typed team commitment, auto-resolves the gap, and extracts a collaboration memory. The Radar physically heals — the crack fades, the terrain smooths, and a haptic success pulse confirms the team is realigned.

**The Vision: Zero "Double-Logging" (Discord + Mobile)**
Hackathon teams don't update tickets; they chat in Discord, and they build. If we ask them to log decisions in a separate app, we've already failed. 
* **Passive Ingestion:** The Discord bot (`/discord-bot`) runs our pure CQRS kernel, silently reading your team chat and extracting assumptions naturally. Zero double-logging.
* **Active Alerts (Why Mobile?):** A Discord ping gets lost in the noise at 3 AM. The mobile app exists as our high-urgency alert surface. When a critical divergence is detected, the app bypasses chat noise with a targeted iOS push notification and haptic alert, forcing the team to resolve the conflict right on their phones before they write another line of code.

## The Experience

* **First Run Onboarding:** A guided 3-step modal introduces the philosophy ("Too fast to argue"), captures your identity, and sets up your squad roster before you ever see the main UI.
* **The Ledger:** An append-only, deterministically replayable event log. The exact same signals, replayed in the exact same order, always produce the identical reality state.

## How we built it: Deterministic CQRS & Isolated LLMs

<!-- TODO: Insert Architecture Diagram -->
![Architecture Diagram Placeholder](docs/assets/placeholder-architecture.png)

We deliberately isolated LLM unpredictability away from the system's core logic. The LLM is **never** used to decide if the team is aligned.

* **Extraction Layer:** Parses casual chat into strict JSON (`{ topic: 'Database', choice: 'Postgres' }`). We use Groq (Llama 3) for ultra-fast extraction, with Gemini as a fallback. Crucially, we built a **completely offline local keyword parser** as the ultimate fallback. Your team's architectural secrets never have to leave the device.
* **Evaluation Kernel:** A pure mathematical CQRS event engine in strict-mode TypeScript.
* **The Hero Detectors:** We built a taxonomy of 5 gap detectors, driven by two flagships:
  - ✅ **Consensus Gap:** Catches active contradictions (e.g., Postgres vs. Firebase).
  - ✅ **Execution Gap (The "Stop Asking for Status Updates" Feature):** Catches silence and tracks progress seamlessly. By explicitly extracting natural dev-status phrasing ("API is ready", "blocked on DB migration") from chat, Isolyne knows exactly where a feature stands. If a deadline passes without an update, the kernel flags the stale commitment. You never have to ask your teammate "what's the status?" again.
  - *(Also shipped: Interpretation, Timeline, and Ownership gaps).*

The mobile application is verified by **71 automated Vitest tests** covering the kernel determinism, LLM degradation paths, timeline granularity, and our RevenueCat purchasing logic.

## Challenges we ran into

* **The Gemini Schema Regression:** When adding our Timeline detector, we removed the base `choice` string from the `required` array. This inadvertently caused the LLM to silently drop the `choice` field on *standard* categorical decisions. We had to enforce strict conditional schema requirements to fix it.
* **Anchor-Timestamp Forwarding:** To ensure our CQRS replay remained 100% deterministic, relative dates ("Friday") couldn't be parsed based on wall-clock time. We had to thread `anchorTimestamp` properties down through the LLM parser so "Friday" always evaluates relative to the exact millisecond the message was sent.

## Monetization Philosophy (RevenueCat HAMM Award)

Isolyne re-architects monetization around the user's emotional journey:
* **Free Tier Guarantees Safety:** Real-time drift detection is 100% free. No project breaks because the team hit a paywall.
* **The "Moment of Doubt" Paywall Trigger:** Isolyne Pro isn't sold in a settings menu. It's offered the exact second the squad's Radar goes red on an active divergence, when the value of alignment is undeniable.
* **Custom Interactive Paywall:** Our paywall features a live ROI calculator. Input your team size and hours/week, and it calculates exactly how few hours of prevented drift it takes to recoup the subscription cost.
* **Hybrid Revenue Model:** 
  - **Subscriptions** ($4.99/mo, $39.99/yr, $19.99 intro) unlock the complete retrospective timeline and immutable audit trail.
  - **One-Time Purchase** ($2.99) unlocks a single "Share Alignment Report" export — the raw text artifact a PM takes back to their standup, without needing a recurring subscription.

## What's next for Isolyne
* **Expanding beyond Hackathons:** Hackathons are the perfect crucible for silent drift, but the core kernel is built to scale. We plan to adapt the ambient ingestion engine for early-stage startups and asynchronous remote teams.
* **Expanding the Taxonomy:** Shipping the remaining 3 gap detectors (Authority, Allocation, Context). 
* **Live Activities & Dynamic Island:** Broadcasting the team's Radar status live on the lock screen during active build sessions, so you always know if the team is aligned without ever opening the app.
EOF