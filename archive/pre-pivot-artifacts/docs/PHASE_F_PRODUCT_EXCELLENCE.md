# Phase F — Product Excellence

**Status:** Active until Shipaton deadline (2026-09-30)  
**Role:** Design critic · competition craftsperson  
**Codebase stance:** **Finished** unless a bug is found  

---

## Alignment (read this first)

Phases A–E optimized for **engineering completion** and **submission scaffolding**.

That is necessary. It is not sufficient.

| Layer | What it is | Status |
|---|---|---|
| **1 — Product Thinking** | Mission, language, engine, patterns, IA, monetization philosophy | ✅ **100% · FROZEN** |
| **2 — Product Implementation** | App, RC flow, tokens, docs, reveal | 🟢 **~85–90%** |
| **3 — Product Excellence** | Craft that wins Design / Next Gen | 🔵 **~25–45% · THIS PHASE** |

**Do not confuse Layer 2 with Layer 3.**

Engineering complete ≠ craftsmanship complete.

Judges should not say “nice idea.”  
They should say **“someone obsessed over this.”**

---

## The only question

Until submission, every review, PR, and suggestion must answer:

> **Would this make a judge remember SquadRadar after watching 50 other demos?**

If the answer is not an obvious **yes**, do not recommend it.  
Do not implement it.  
Do not “tidy while we’re here.”

Treat the codebase as finished. Refine only what a design critic would insist on.

**Reviewer roles (human):** Design Director · Shipaton Judge · Product Critic  
**Agent role:** Execute craft under that bar. No engineering praise. No feature suggestions.

---

## Six-dimension scorecard (every review)

| Dimension | Weight | Question |
|---|---|---|
| **Memorability** | ⭐⭐⭐⭐⭐ | Will this be remembered tomorrow? |
| **Emotional Journey** | ⭐⭐⭐⭐⭐ | Curiosity → tension → relief → confidence? |
| **Visual Craft** | ⭐⭐⭐⭐ | Intentionally designed, not assembled? |
| **Product Confidence** | ⭐⭐⭐⭐ | Finished product, not a demo? |
| **Storytelling** | ⭐⭐⭐⭐ | Interface works without narration? |
| **Competition Advantage** | ⭐⭐⭐⭐⭐ | Meaningfully improves win odds? |

Code quality is out of scope unless it damages one of these.

---

## Cadence: one craft win per week

Not twenty tiny improvements. **One meaningful win.**

Examples:

| Week | Craft win |
|---|---|
| 1 | Biggest Risk screen unforgettable |
| 2 | Hack Pass moment emotionally satisfying |
| 3 | 90s demo impossible to look away from |

---

## Phase F pass order

### Pass 1 — Hero Moment
🟢 **Accepted** (Judge #27 · 9.4) — sentence as artwork; UI disappears.  
Open polish only if line breaks / chrome still steal the quote — not a redesign.

### Pass 2 — Silence *(observation — awaiting muted take)*
**Film / cinema.** Judge Mode only.  
→ [`PASS_2_SILENCE.md`](./PASS_2_SILENCE.md)

> Did the silence transform a clever sentence into an unforgettable moment?

No recommendations until the muted recording is uploaded.

### Pass 3 — Brand Identity
Remove the logo — still recognizable as SquadRadar from type, layout, interaction?

### Pass 4 — Real User Testing
Hackathon builders, friends, students. No guidance.  
Ask: “What does this app do?” · “When did you hesitate?” — never “Do you like it?”  
Pass 1 micro-test: “What do you think happens if you press Why?”

### Pass 5 — Judge Simulation
Assume 40 entries already watched. Why win? What raises the score? What makes us forgettable?

---

## Progress estimate (honest)

| Area | Progress |
|---|---:|
| Product Vision | **100%** |
| Architecture | **100%** |
| Decision Engine | **100%** |
| Core App | **~90%** |
| Submission Assets | **~85%** |
| Design Craft | **~40%** |
| Brand Identity | **~45%** |
| UX Refinement | **~35%** |
| Demo Excellence | **~20%** |
| Real User Validation | **~0%** |

| Roll-up | Estimate |
|---|---:|
| Engineering completion | **~95%** |
| Competition readiness (assets/checklist) | **~80–85%** |
| **Product excellence** | **~45%** |

The gap between competition readiness and product excellence is where remaining weeks go.

---

## North-star question for Phase F

> **What would make this impossible to forget?**

Not: Can we add one more capability?  
Not: Is the architecture elegant?  
Only: Memorability, clarity, confidence, craft.

---

## What Phase F is

Weekly loops until 2026-09-30:

1. **Design review** — type, rhythm, color, icon language, first impression  
2. **Copy review** — every sentence unforgettable (not merely correct)  
3. **UX review** — friction, hesitation, silent understanding  
4. **Demo review** — pitch rehearsal, not a screen capture checklist  
5. **Judge review** — “Would I remember this after 50 demos?”

## What Phase F is not

- New features  
- New tabs / onboarding / analytics / social / AI / Firebase  
- Architecture refactors  
- Pattern Library expansion  
- Engine behavior changes (unless a true bug)  
- Scope that does not improve win odds

---

## Craft workstreams

### 1. Design craft

Obsess only where judges feel it:

| Focus | Standard |
|---|---|
| **Biggest Risk** | Hero. If 10 hours go anywhere, here. |
| Typography | Hierarchy that feels intentional, not default RN |
| Visual rhythm | Spacing that breathes; no accidental density |
| Motion | Only disclosure; never decorative delay |
| Accessibility | Tap targets, contrast, VoiceOver labels that match emotion |
| Empty / loading | Brand, not spinner apology |
| Icon language | Cohesive with splash / app icon |

Reference study (deliberate, not cargo-cult):

- Prior Shipaton winners / finalists  
- Apple HIG (clarity, deference, depth — adapted to our dark stage)  
- Linear (density with calm)  
- Arc (opinionated personality without clutter)  
- Design Award winners (first 5 seconds)

**Rule:** Steal *standards*, not surfaces. SquadRadar stays SquadRadar.

### 2. Copy craft

Current bar: “works.”  
Phase F bar: **unforgettable.**

| Surface | Test |
|---|---|
| Biggest Risk punchlines | Quotable tomorrow? |
| Why? / Evidence | Recognition in one breath? |
| Suggested Lock | Relief in ≤30s action? |
| Recommendation | Decisive without narration? |
| Hack Pass | “I want that,” not “paywall”? |
| Radar lede | Decision tool, not networking app? |

Pass every line through: *Would a design critic cut this?*

### 3. Research → apply

Do not research for notes. Research for **one visible change** per session.

Weekly: pick one reference → name one SquadRadar weakness → ship one refinement that raises win odds.

### 4. User validation (currently 0%)

Show the muted Premortem to:

- hackathon builders  
- friends  
- strangers  

Observe **hesitation**, not compliments.

Log only:

- Where do they pause?  
- What do they misread?  
- Can they explain SquadRadar in one sentence after 60s?  
- Do they remember Biggest Risk the next day?

No surveys. No feature requests. Friction only.

### 5. Demo as pitch

A recording is not excellence. **Rehearsal** is.

- Multiple takes until no awkward pause  
- Silent-first every time  
- Hold Biggest Risk long enough to be quoted  
- End frame memorable  
- Audio optional; UI mandatory  

Script: [`DEMO_SCRIPT.md`](./DEMO_SCRIPT.md) · Take sheet: [`DEMO_RECORDING.md`](./DEMO_RECORDING.md)

### 6. Visual identity

Brand = more than icon:

- Screenshot gallery as one composition  
- Type / space / color consistency across all five frames  
- First impression on GitHub + Devpost + cold open  

If the gallery could belong to another student Expo app, craft is unfinished.

---

## Weekly cadence (until Sept 30)

| Day | Ritual |
|---|---|
| **Mon** | Judge review — watch muted demo cold; list weaknesses only |
| **Tue** | Design / brand — one craft change max |
| **Wed** | Copy — punchlines + Pass + Radar first screen |
| **Thu** | UX — friction from user test or self walkthrough |
| **Fri** | Demo rehearsal — re-record if any hesitation |
| **Sat** | Research hour → one applied refinement |
| **Sun** | Freeze check — still no features; update this doc’s “This week” |

**Throughput rule:** Prefer **one undeniable improvement** per week over ten invisible tweaks.

---

## This week (template)

```text
Week of: 2026-08-16
Focus: Pass 2 — Silence (film direction)
Shipped refinements: Pass 1 accepted; PASS_2_SILENCE.md + demo silence budget
User tests: ____ (n=) — Why? expectation test still pending
Demo takes: ____ — hold ≥12–14s on sentence before Why?
Win-odds rationale: Hotel memory = the sentence; silence makes the frame earn it
Explicitly rejected: entrance animation to fake the pause; UI redesign of accepted hero
```

---

## Hard reject list

Automatically reject unless a bug:

- Analytics, notifications, more settings  
- More onboarding, tabs, chat, social  
- AI integrations, Firebase sync  
- New Pattern Library categories  
- “While we’re at it” refactors  
- Motion that delays understanding  
- Copy that explains the architecture to users  

---

## Acceptance for Phase F (deadline)

Phase F is “done enough to submit” when:

1. A stranger understands the product in **&lt;20s** silent.  
2. Biggest Risk is **quoted** unprompted the next day.  
3. Gallery stops the scroll.  
4. Demo feels like a **pitch**, not a walkthrough.  
5. No visible prototype tells.  
6. At least **3 real people** have been watched hesitating (and friction addressed).  
7. Someone obsessed is visible in spacing, type, and silence — not in feature count.

---

## Relationship to prior phases

| Phase | Job | Status |
|---|---|---|
| A–C | Engine + reveal + craft foundations | Frozen / accepted |
| D | Competition readiness (RC story, brand shell, docs) | Accepted |
| E | Judge audit + submission packaging | Accepted |
| **F** | **Product excellence until deadline** | **Active** |

Submission checklist remains: [`SUBMISSION_CHECKLIST.md`](./SUBMISSION_CHECKLIST.md)  
Judge weaknesses remain the backlog seed: [`JUDGE_AUDIT.md`](./JUDGE_AUDIT.md)

---

## Instruction to every future agent review

> Stop thinking like an engineer. Start thinking like a design critic.  
> The codebase is finished unless a bug is found.  
> Every suggestion must make SquadRadar harder to forget after 50 demos.  
> If it doesn’t, don’t recommend it.  
> No engineering praise. No feature suggestions.
