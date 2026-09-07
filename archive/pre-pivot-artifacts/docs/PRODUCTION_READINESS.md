# Phase G.1 — Production Readiness Report

**Role:** Founding Engineer (audit only — no fixes applied)  
**Date:** 2026-08-16  
**Constraints:** Product / engine / UX / hero frozen. No features. No redesigns.  
**Parallel track:** Founder runs real user tests ([`USER_TEST_PROTOCOL.md`](./USER_TEST_PROTOCOL.md)).

**Method:** Full codebase review · `tsc --noEmit` (pass) · `npm test` (26/26) · `npx expo-doctor` · `npx expo export --platform web` (succeeds)

---

## Executive summary

SquadRadar builds and exports. Secrets are not committed. The Decision Engine is clean.

Judge confidence is most at risk from **repository packaging**, **Expo peer/version hygiene**, **oversized brand assets**, and a few **accessibility / error-surface gaps** — not from architecture or product scope.

---

## Critical

| Issue | Impact | Recommendation | Priority |
|---|---|---|---|
| **No git history inside a publishable SquadRadar repo** — workspace sits under parent `/Users/abhi/Projects` with `## No commits yet on main` / untracked `HACKOS/` | A judge cloning “the project” may not get a clean, intentional repo (or may get a parent monorepo of unrelated folders) | Initialize / publish a dedicated `squadradar` remote with only this app; first commit README + LICENSE + source | **Critical** |
| **Missing peer deps: `expo-constants`, `expo-linking`** (required by `expo-router`) | May crash outside Expo Go / in production native builds | `npx expo install expo-constants expo-linking` | **Critical** |

---

## High

| Issue | Impact | Recommendation | Priority |
|---|---|---|---|
| **Expo SDK patch drift** — `expo` 57.0.10 vs expected ~57.0.13; `expo-router` / `@expo/metro-runtime` similarly behind | Doctor fails; subtle runtime bugs on submit builds | `npx expo install --fix` / `--check` | **High** |
| **Brand PNGs ~876KB each** (`icon.png`, `splash-icon.png`, `favicon.png`, android foreground) | Slow first paint / large clone / unprofessional asset hygiene | Compress / export optimized icons (target ≪200KB where possible) | **High** |
| **`app.json` top-level `splash` flagged by expo-doctor schema** | Config debt; splash may not follow SDK 57 plugin form | Migrate splash to `expo-splash-screen` plugin config per Expo 57 docs | **High** |
| **Android `backgroundImage` still Expo-template-era asset** alongside branded foreground | Adaptive icon may look inconsistent on Android launchers | Replace `android-icon-background.png` with brand `#07080F` (or solid color only) | **High** |
| **Ghost stage back control is `‹` only** | Sighted users may miss it; VoiceOver OK (has label) but discoverability low | Keep frozen hero — if users miss exit, evidence-driven; otherwise ensure hit target remains ≥44pt (already) | **High** *(UX risk; change only with evidence)* |

---

## Medium

| Issue | Impact | Recommendation | Priority |
|---|---|---|---|
| **Web JS bundle ~2.1MB** (uncompressed export) | Web judges / slow networks feel sluggish | Acceptable for RN-web demo; if web is primary judge path, consider production minify already on + document “use native for best demo” | **Medium** |
| **No offline / network-failure UX** | Purchases fail with generic message; Radar assumes seed data | For Shipaton seed-only demo, low risk; add clear purchase failure copy if store keys used | **Medium** |
| **Recommendation / Outcome use emoji** (🟢🟡🔴) | Screen readers may announce “green circle”; inconsistent with G6 restraint | Prefer color + text only if a11y evidence appears | **Medium** |
| **`RecommendationCard` lacks `accessibilityRole`** | Weaker SR semantics (label present) | Add `accessibilityRole="summary"` or `text` | **Medium** |
| **Evidence / Lock / First-Hour** limited SR structure | Live region only; lists not announced as lists | Add roles/labels if VoiceOver testing fails | **Medium** |
| **Why? a11y string always says “risk”** | Misleading on `STILL TRUE` (Campus Four) | Soften label when kicker ≠ BIGGEST RISK | **Medium** |
| **Profile “Clear Hack Pass” / some buttons** missing explicit `accessibilityLabel` | Relies on visible text (OK) but Clear is low-contrast meta | Explicit labels | **Medium** |
| **`isPurchasesPreviewMode` unused export** | Dead API surface | Remove or use | **Medium** *(Low if ignored)* |
| **Hardcoded avatar colors** in `radarTeams.ts` | Outside token system | Map to tokens if consistency matters | **Medium** *(Low craft)* |
| **Inline style overrides** (`fontSize: 16`, etc.) | Mild token drift | Prefer tokens | **Medium** |

---

## Low

| Issue | Impact | Recommendation | Priority |
|---|---|---|---|
| **`.DS_Store` / parent `HACKOS.zip` / sibling projects** in parent folder | Noise if parent is published | Ensure public remote is HACKOS-only; keep zips out of git | **Low** |
| **Internal storage key `squadradar-hack-pass-demo`** | Not user-visible | Rename when convenient | **Low** |
| **CLI `console.log` in `decision-engine/cli.ts`** | Fine for CLI | Keep | — |
| **No ESLint / Prettier config** | Maintainability | Optional for Shipaton | **Low** |
| **`supportsTablet: true` without tablet layout pass** | Tablet may look sparse | Portrait phone is demo target; OK | **Low** |
| **Empty Radar state exists** but seeds always present | Fine | Keep | — |
| **Loading:** splash + spinner only | Acceptable | — | — |
| **Purchase errors** surface via `note` text | Works | Ensure copy stays human | **Low** |
| **Restore in preview** returns “No Hack Pass found” | Correct | — | — |
| **No secrets in repo**; `.env` gitignored; `.env.example` placeholders | Good | Never commit keys | — |
| **README / LICENSE / metadata** present and branded | Good | Keep README screenshots updated post-G6 | **Low** |

---

## Category notes

### 1. Codebase health
- No TODO/FIXME/debugger in app code.  
- Dead: unused `isPurchasesPreviewMode` export.  
- No commented-out blocks of significance.  
- Engine purity intact (no RN imports).

### 2. UI consistency
- Strong token usage overall.  
- Drift: ad-hoc `fontSize` overrides; seed avatar hex colors; emoji vs G6 quiet language.  
- Corner radii and motion generally consistent.

### 3. Accessibility
- Core flows labeled (Radar cards, Why?, Unlock, Restore, Back).  
- Gaps: Recommendation role; list semantics; Why? wording on soft kicker; emoji announcements.  
- Touch targets generally ≥44 via `hit.min`.  
- Font scaling: not stress-tested.  
- Web keyboard: Pressables focusable; no custom focus ring polish.

### 4. Performance
- `evaluateDecision` in `useMemo` — sync, small input; fine.  
- No obvious render loops.  
- Asset weight is the measurable win (icons).  
- Web bundle size expected for Expo Router web.

### 5. Error handling
- Purchase/restore return messages.  
- AsyncStorage failures swallowed (silent) — acceptable for demo.  
- No offline banner.  
- Empty Radar state implemented.

### 6. Cross-platform
- Web export succeeds.  
- Native iOS/Android **not** built in this audit (no `ios/`/`android/` committed — Expo managed).  
- Absolute ghost back + SafeArea: verify notch devices don’t clip `‹`.  
- Adaptive icon background asset inconsistency (Android).

### 7. Submission readiness
- README, LICENSE (Abhi Kumar), app.json name/bundle IDs, package name `squadradar`: good.  
- **Git publish path unclear** — Critical.  
- Checklist exists; muted demo + user tests still open.  
- Screenshots may predate G6/G trust — refresh before Devpost.

### 8. Security
- No committed API keys.  
- RevenueCat public SDK keys via `EXPO_PUBLIC_*` (expected).  
- No dangerous permissions declared.  
- AsyncStorage for profile/pass flag — fine for this scope.

### 9. Production build
- `tsc`: clean.  
- Vitest: 26/26.  
- `expo export --web`: success.  
- `expo-doctor`: peer deps + version drift + splash schema.

### 10. Competition risk — TOP 10

If a Shipaton judge clones today, confidence drops most from:

1. **Unclear / unclean git repository story** (parent monorepo, no commits)  
2. **Missing `expo-constants` / `expo-linking`** for real builds  
3. **Expo package version drift** vs SDK 57 expected  
4. **Huge uncompressed icon/splash assets**  
5. **Android adaptive icon background still template-like**  
6. **`app.json` splash config not aligned with SDK 57 doctor**  
7. **Web bundle weight** if judged primarily on web  
8. **A11y gaps** on recommendation/emoji if Accessibility-minded judges probe  
9. **Stale screenshots** vs current G6 hero / trust UI  
10. **No recorded muted demo yet** (process, not code — still a confidence gap)

---

## What this audit does *not* recommend

- New features, tabs, onboarding, analytics  
- Engine / Pattern Library changes  
- Hero un-freeze without user evidence  
- Speculative refactors without measurable benefit  

---

## Suggested use with user evidence

| Track | Owner | Output |
|---|---|---|
| Behavior | Founder | [`USER_TEST_PROTOCOL.md`](./USER_TEST_PROTOCOL.md) logs |
| Quality | This report | Critical/High items above |

**Combine later:**

- Outcome A + Critical fixed → ship path (demo → Devpost → submit)  
- Outcome B pattern → one behavior fix only  
- Critical engineering items → fix regardless of A/B (they are reproducible defects / packaging risks)

---

## Production packaging (frozen after G.1 fixes)

Objective hygiene completed (independent of user tests):

- Dedicated git repository initialized for SquadRadar  
- `expo-constants` + `expo-linking` installed  
- Expo SDK packages aligned (`expo-doctor` clean)  
- Splash via `expo-splash-screen` config plugin (no legacy top-level `splash`)  
- Android adaptive icon uses brand `#07080F` (no template background image)  
- Brand PNGs re-encoded / background asset minimized  

Do not reopen packaging unless a reproducible defect or submit-blocker appears.
