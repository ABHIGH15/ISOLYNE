# Phase E — Judge Audit (Shipaton)

**Role:** Judge, not Product Lead  
**Metric:** Does this maximize win probability?  
**Status:** Audit only — **no implementation in this document**  
**Product / Engine / UX:** Frozen  

Demo hero punchline (Three Generals):

> You’ll have three captains and no ship.

---

## 1. Judge Experience Audit

**Weaknesses only.** Strengths are assumed accepted from Phases C–D.

### First 5 seconds

| Question | Honest answer | Weakness |
|---|---|---|
| Do I immediately understand what SquadRadar does? | Mostly — the north-star question is on Radar. | Subcopy + “Nearby / 120 m away” still reads like a **venue networking map**, not a decision tool. |
| Is the opening visually distinctive? | Dark brand + question helps. | Team list UI is familiar “card feed” grammar; a tired judge may file it under “another student social app” before the Premortem. |
| Different from “another networking app”? | Premortem would prove it — but Premortem is not yet on screen. | Differentiation is **delayed** until tap. First frame does not scream Premortem. |

### First 30 seconds

| Question | Honest answer | Weakness |
|---|---|---|
| Do I understand the core problem? | After Biggest Risk, yes. | Idea lines on Radar cards can frame the product as **idea matching** before composition risk lands. |
| Is the Premortem memorable? | The punchline is. | Memorability depends on **holding silence**; any rush to tap Why? kills the hero. |
| Is the recommendation decisive? | Skip / Join if… / Join with color is clear. | By the time recommendation appears, scroll stack is long; decisive moment competes with prior blocks. |

### End of demo

| Question | Honest answer | Weakness |
|---|---|---|
| Can I explain SquadRadar in one sentence? | Yes if Premortem + Pass landed. | If Pass is skipped or looks like “paywall demo,” sentence collapses to “risk list app.” |
| Remember Biggest Risk tomorrow? | High odds for Three Generals line. | Other teams (Model Farm, Campus Four) on Radar dilute the single quotable memory if the camera lingers on the list. |
| Recommend for Design or Next Gen? | Architecture/docs favor Next Gen; craft favors Design **if** Biggest Risk frame is gallery-grade. | Repo still looks like an Expo template from the outside (no README, Expo LICENSE). That hurts Next Gen “complete product” scoring more than Design. |

### Silent-demo failure points

1. Location language (“Nearby”, meters) → networking mental model.  
2. Hack Pass footer hint is **meta** (“Purchase is part of the story…”) — judges read engineering notes, not emotion.  
3. CTA “Unlock Hack Pass · **Demo**” signals unfinished product in a submission video.  
4. No branded **end card** in-app; script assumes one — without video editing, ending is just Radar again.  
5. First-Hour Plan is correct but dense; silent “transformation” can feel like a checklist unless the camera holds on “Before code” step 1.

### Emotional audit (purpose gaps)

| Screen | Intended emotion | Gap |
|---|---|---|
| Splash | Curiosity | Fine if held ≥0.8s in video; cold-start spinner after splash can feel like unfinished load. |
| Radar | Hope / agency | Currently closer to **browse** than hope; FREE/PASS badge can feel like SaaS chrome before the story. |
| Biggest Risk | Tension | Strong if silence held; weak if Why? is tapped instantly. |
| Why? / Evidence | Recognition | OK. |
| Suggested Lock | Relief | Free teaser is thin — relief is stronger **after** Pass. Silent story may under-deliver relief until unlock. |
| Recommendation | Confidence | Strong colors; emoji + long scroll may soften “judgment” feel. |
| Hack Pass | “I want that.” | Copy is right; meta footer + “Demo” label leak confidence. |
| First-Hour | Calm / control | Risk of **homework vibe** if over-scrolled. |
| Profile | — | **No emotional job in the demo.** Opening Profile is a judging liability. |

### Screenshot gallery risk (five frames)

If Splash · Radar · Biggest Risk · Recommendation · Hack Pass sit in a Shipaton gallery:

| Frame | Stop-scroll risk |
|---|---|
| Splash | Medium — brand must read at thumbnail size. |
| Radar | **Low–medium** — looks like many apps unless question dominates the crop. |
| Biggest Risk | **High** — this is the only frame that must stop the scroll. Punchline must be fully legible; no chrome. |
| Recommendation | Medium–high if 🔴/🟡 fills the frame. |
| Hack Pass | Medium — “Need prevention?” helps; “Demo” and meta footer hurt. |

---

## 2. README Final Review

**Finding: there is no `README.md`.**

A judge opening GitHub within five minutes currently sees:

- Folder / history cues of an Expo scaffold (`LICENSE` still © Expo / 650 Industries)  
- Dense `docs/` with no front door  
- Package name `squadradar` (good) vs workspace `HACKOS` (confusing)  

### What a judge must learn in ≤5 minutes (target README outline)

1. **What** — one sentence (match Devpost logline)  
2. **Why** — wrong-team problem; Premortem not matching  
3. **Run** — `npm i` · `npm start` · note Expo Go Preview for Hack Pass  
4. **Decision Engine** — `src/decision-engine/` · `npm test` · `npm run decision-engine:eval`  
5. **RevenueCat** — entitlement `hack_pass` · story beat after recommendation · `.env.example`  
6. **What makes it unique** — deterministic Pattern Library + cinematic reveal; free = flinch, Pass = prevention  
7. **Links** — Product Contract, Demo Script, Devpost draft  

**Verdict:** README absence is the single largest **repository** scoring risk. Fix before submission (implementation phase after this audit is accepted).

---

## 3. Demo Timing Breakdown (90s, second-by-second)

**Rule:** One path only — **Three Generals**, start **FREE**, audio muted.  
**Hero budget:** 0:14–0:28 is sacred. Do not steal silence.

| Sec | Camera / action | On-screen | Friction to kill |
|---|---|---|---|
| 0:00–0:01 | Hard cut | Splash / icon on `#07080F` | Don’t linger on Metro / debug |
| 0:01–0:08 | Hold | Radar: **SQUADRADAR** + “Should I join this team?” | Don’t pan; don’t open Profile; crop other teams if needed |
| 0:08–0:11 | Finger moves | Hover Three Generals | No second thoughts / no Model Farm |
| 0:11–0:14 | Tap | Transition to Premortem | One tap only |
| 0:14–0:28 | **Still** | Biggest Risk stage + punchline | **No tap.** Why? visible but untouched |
| 0:28–0:29 | Tap Why? | Evidence begins | |
| 0:29–0:36 | Light scroll if needed | Evidence / recognition | Don’t speed-tap Continue |
| 0:36–0:37 | Continue | Suggested Lock (teaser OK) | |
| 0:37–0:46 | Hold | Lock line readable | |
| 0:46–0:47 | Continue | Recommendation | |
| 0:47–0:56 | Hold | 🔴/🟡 recommendation decisive | Don’t scroll past it instantly |
| 0:56–1:00 | Scroll to gate | Need prevention? / Unlock Hack Pass | Avoid Profile; avoid Restore unless needed |
| 1:00–1:04 | Tap Unlock | Entitlement unlock | Prefer recording without “· Demo” visible if possible |
| 1:04–1:12 | Hold | Outcome appears (prevention beat) | |
| 1:12–1:16 | Continue | First-Hour Plan | |
| 1:16–1:25 | Hold / slow scroll | “Before code” step 1 only | Don’t dump full checklist |
| 1:25–1:30 | Cut or back | Branded close (Radar question or edited end card) | Don’t end mid-scroll on plan |

**Tap budget (ideal):** 1 team + Why? + 2× Continue + Unlock + 1× Continue (+ optional Back) = **≤6 interactions**.  
Any extra Continue, Restore, or tab switch is waste.

**Narration:** Optional. If used, ≤4 sentences from `DEMO_SCRIPT.md`. UI must carry the story without it.

---

## 4. Devpost Consistency Review

| Story beat | Devpost | Demo / app | Consistent? |
|---|---|---|---|
| Wrong-team problem | Strong (Discord / ghosting) | Implied via Radar, not shown | **Partial** — prose carries pain Devpost claims; silent demo does not show Discord |
| Premortem hero | Biggest Risk first | Matches | Yes |
| Lock → Rec → Pass prevention | Yes | Rec then Pass then Outcome/Plan | Yes (Contract diagram lists Pass last; **Devpost + app are the truth**) |
| Free = flinch / Pass = prevention | Explicit | Matches | Yes |
| Not skill-matching / not AI success scores | Explicit | Engine enforces | Yes |
| RevenueCat as journey | Explicit | In-story gate | Yes |
| Technical uniqueness | Decision Engine + Pattern Library | Present in repo | Yes for readers; **invisible without README** |

**Independence test**

- Devpost alone → clear product.  
- Muted demo alone → clear **if** Biggest Risk silence + Pass unlock land; weak on “Discord chaos” origin story.  
- Neither should require the other — **tighten by making Radar less “social map” in screenshots/demo crop**, not by adding features.

**Copy drift to avoid later**

- Don’t say “AI predicts fit.”  
- Don’t call Hack Pass “premium insights.”  
- Don’t lead with architecture in the first Devpost paragraph (current draft is good).

---

## 5. Submission Checklist

See [`SUBMISSION_CHECKLIST.md`](./SUBMISSION_CHECKLIST.md).

---

## 6. Recommended Changes (judging only)

Ship **only** if it raises win odds. No new features.

| # | Change | Why it helps judges | Effort |
|---|---|---|---|
| 1 | **Add `README.md`** (front door) | Repo audit fails today without it | S |
| 2 | **Replace Expo `LICENSE` copyright** with project author | Looks like a finished product, not a template | S |
| 3 | **Record demo per §3**; hold 14s silence on Biggest Risk | Memorability is the contest | M |
| 4 | **Five gallery screenshots** (Splash, Radar crop, Biggest Risk full-bleed, Recommendation, Hack Pass) at submission size | Stop-scroll | M |
| 5 | **Remove or rewrite Hack Pass footer meta line** for humans (“Prevention unlocks your first hour”) | Silent emotional clarity | XS |
| 6 | **Hide “· Demo” on CTA in recorded build** or film real sandbox purchase | Looks complete | S |
| 7 | **Rename GitHub repo** `HACKOS` → `squadradar` if public URL will be judged | Brand coherence | S |
| 8 | **Video end card** (edit or Radar hold on question) | Memory after 50 demos | S |
| 9 | Optional Radar **copy/crop** for gallery: emphasize question, de-emphasize meters | First-5s differentiation | XS–S |
| 10 | Confirm splash holds in first second of export | Brand before list UI | XS |

**Do not ship:** analytics, notifications, onboarding, settings, tabs, AI, Firebase, chat, social, more patterns, more motion.

---

## Acceptance vs criteria

| Criterion | Today | Blocker? |
|---|---|---|
| Understand in &lt;20s | Likely **after** Premortem tap; Radar alone is soft | Soft — fix via demo crop / Radar emphasis, not new features |
| Biggest Risk quotable | Yes (Three Generals) | No — protect silence in video |
| RevenueCat as story | Yes in UX | Soft — remove meta/Demo tells in recording |
| Repo reflects quality | **No** (missing README, Expo LICENSE) | **Yes** |
| Muted demo communicates core | Mostly | Soft — timing + Pass presentation |
| Nothing removable without harm | Product yes; chrome (Profile in demo, meta footer) no | Soft |

---

## Phase E verdict

🟢 **Audits complete. Product stays frozen.**

Submission readiness is blocked primarily by **packaging** (README, license, demo recording discipline, gallery frames)—not by missing features.

Next step after acceptance: implement **only** the recommended changes list above, starting with README + LICENSE + demo capture.
