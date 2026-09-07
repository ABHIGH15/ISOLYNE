# Decision Engine Pattern Library

**Status:** 🟢 Product QA passed · **Frozen v1.0.0**  
**Engine / catalog:** `1.0.0`  
**QA record:** [`PRODUCT_QA.md`](./PRODUCT_QA.md)

**Field mapping (frozen):**

| Library beat | Engine field |
|---|---|
| Problem (punchline) | `biggestRisk` |
| Why it matters | `narrative` |
| Evidence | `evidence` |
| Suggested Lock | `suggestedLock` |
| Expected Outcome | `outcomeIfLocked` + `recommendation` |
| First-Hour consequence | `firstHour` |
| Trigger | `when` |

## Product QA bar (v1.0)

1. Screenshot Test  
2. Nod Test  
3. Action Test (≤1 minute)  
4. Ownership Test (named seat)  
5. Memory Test (quotable punchline)

Biggest Risk = emotional-cost punchline. Observation + consequence live in narrative/evidence.

---

# Inventory (16 + fallback)

| Category | Pattern ID | Biggest Risk (Memory Test) |
|---|---|---|
| Leadership | `leadership-collision` | You’ll have three captains and no ship. |
| Leadership | `leadership-vacuum` | You’ll rebuild the idea every hour because nobody can say no. |
| Leadership | `decision-deadlock` | Two leads will politely waste your night. |
| Leadership | `viewer-lead-collision` | Joining adds another steering wheel to a crowded cockpit. |
| Execution | `no-backend` | You’ll ship a UI that has nowhere to plug in. |
| Execution | `no-frontend` | Judges will stare at a black terminal. |
| Execution | `no-demo-owner` | You’ll lose to a worse product with a better demo. |
| Product | `scope-explosion` | You’re staffing a company, not a weekend. |
| Product | `architecture-spiral` | You’ll still be debating folders when judging begins. |
| Product | `feature-hoarding` | The backlog will eat the demo. |
| Human | `intensity-clash` | Half the team clocks out when the other half wakes up. |
| Human | `goal-mismatch` | You’re playing three different games on one clock. |
| Human | `commitment-risk` | Nobody owns the submit button — you’ll notice at T-1h. |
| Composition | `team-too-large` | More seats, less ownership. |
| Composition | `ai-overstaffed` | You’ll have the smartest API nobody can use. |
| Composition | `missing-designer` | It’ll work — and still look unfinished on stage. |
| Fallback | `balanced-default` | No red flags — you can still waste the first hour without owners. |

Full triggers, locks, and first-hour beats live in `src/decision-engine/patterns/catalog/*` (shipped copy source of truth).

---

# Coverage Report — intentionally unsupported

| Out of scope | Why |
|---|---|
| Personality / culture-fit scoring | Violates composition-only principle |
| Skill quality (“are they good?”) | We don’t measure ability |
| Ghosting prediction | No chat graph |
| Idea / market judging | Wrong job (“Should I join?”) |
| GitHub / LinkedIn intel | No import facts |
| Predictive ML | Not needed for explainable risks |
| Mentor / sponsor matching | Future catalogs |

**FLAG (needs engine evolution later — not in v1.0):** real availability windows, idea→capability inference, collaboration history.

Keeping these out is a strength for Shipaton MVP.

---

# Freeze

Decision Engine `v1.0.0` is a versioned dependency. App integration: **bug fixes only** without formal Product + Eng review.
