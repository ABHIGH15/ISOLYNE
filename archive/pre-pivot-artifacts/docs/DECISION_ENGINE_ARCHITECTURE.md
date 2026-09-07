# Decision Engine Architecture

**Status:** Foundation design (no application code)  
**Product source of truth:** [`PRODUCT_CONTRACT.md`](./PRODUCT_CONTRACT.md)  
**Role of this doc:** Engineering architecture for the Shipaton MVP Decision Engine.

---

## 0. Repository gap analysis

### Current state

| Area | Reality |
|---|---|
| App surface | Almost all UX in `app/index.tsx` (~385 lines) |
| Matching | Static `score` / `reasons` on mock teams |
| Domain layer | None |
| Tests | None |
| RevenueCat | Absent (paywall is a dismissible modal) |
| Firebase | Installed, unused |
| Docs | `product.md` / `engineering.md` predate the Product Contract |

### Contract vs code

| Contract requirement | Current support |
|---|---|
| Decision Engine | Missing |
| Team Premortem | Missing (fake FIT %) |
| Suggested Lock / Recommendation | Missing |
| First-Hour Plan | Mentioned in paywall copy only |
| Pure, UI-independent domain | Violated (logic inside React) |
| Deterministic / testable | Not structured for tests |

### Architectural changes required

1. Extract a **pure TypeScript package/module** for the Decision Engine (no React/Expo/RC imports).
2. Replace static team scores with **engine evaluation** at read time.
3. Introduce **typed domain models** shared as engine *inputs*, not UI state shapes.
4. Keep **entitlement projection** outside the engine (application layer).
5. Replace obsolete product docs with the locked Product Contract (done: `PRODUCT_CONTRACT.md`).
6. Add a **test runner** before UI work (Vitest or Jest — see Testing Strategy).
7. Delete or quarantine dead `App.tsx` and unused Firebase when implementation begins (not now).

---

## 1. Proposed folder architecture

Keep Expo Router at the root (`app/`). Put all real logic under `src/`.

```text
HACKOS/
├── app/                          # Expo Router only (thin screens later)
│   ├── _layout.tsx
│   └── index.tsx                 # temporary; migrate off monolith
├── src/
│   ├── decision-engine/          # ★ PURE DOMAIN — zero RN/Expo/RC
│   │   ├── index.ts              # public API: evaluateDecision()
│   │   ├── types.ts              # inputs + outputs
│   │   ├── facts/
│   │   │   ├── extractFacts.ts   # Team+Viewer → FactBag
│   │   │   └── factKeys.ts
│   │   ├── matching/
│   │   │   ├── matchPatterns.ts
│   │   │   └── conditions.ts     # tiny predicate interpreter
│   │   ├── ranking/
│   │   │   └── resolveConflicts.ts
│   │   ├── render/
│   │   │   ├── renderPremortem.ts
│   │   │   └── interpolate.ts    # "{count} members…" slots
│   │   ├── project/
│   │   │   └── projectTier.ts    # free vs pass VIEW of a full result
│   │   ├── patterns/             # declarative catalog (data)
│   │   │   ├── index.ts          # registry
│   │   │   ├── schema.ts
│   │   │   └── catalog/
│   │   │       ├── leadership.ts
│   │   │       ├── pitch-gap.ts
│   │   │       ├── stack-imbalance.ts
│   │   │       └── …
│   │   └── __tests__/
│   │       ├── facts.test.ts
│   │       ├── match.test.ts
│   │       ├── rank.test.ts
│   │       ├── render.test.ts
│   │       ├── projectTier.test.ts
│   │       └── fixtures/
│   ├── domain/                   # app-level aliases if needed (optional)
│   ├── data/                     # mock event graph (teams, members)
│   ├── services/                 # later: purchases, storage (NOT engine)
│   └── features/                 # later: UI feature modules
├── docs/
│   ├── PRODUCT_CONTRACT.md
│   ├── DECISION_ENGINE_ARCHITECTURE.md  # this file
│   └── decision-engine-content.md       # pattern copy KB (author next)
├── package.json
└── tsconfig.json
```

### Why this layout

| Choice | Rationale |
|---|---|
| `src/decision-engine` inside app repo | Shipaton speed; still importable as pure TS |
| Patterns as data modules | Writers edit copy without touching evaluator |
| `projectTier` inside engine package but **after** evaluate | Same pure module, still no RC; RC only chooses tier string |
| No monorepo yet | Premature for 6-week MVP |

### Hard import rule

`src/decision-engine/**` may import only:

- TypeScript / relative engine files
- Later: nothing from `react`, `react-native`, `expo*`, `firebase`, `react-native-purchases`

Enforce with ESLint `no-restricted-imports` when implementation starts.

---

## 2. Decision Engine architecture

### Challenge: Strategy vs Rule Objects vs Decision Trees vs Declarative catalog

| Approach | Verdict |
|---|---|
| **Classic Strategy Pattern** (1 class per rule) | Reject for MVP content. 25–30 patterns are mostly **copy + predicates**. Classes create churn and bury writing. |
| **Decision tree** | Reject. Brittle; adding a pattern rewrites branches. |
| **Heavy rules engines (Rete, etc.)** | Reject. Overkill; hard to explain; slow to ship. |
| **Declarative Pattern Catalog + thin Interpreter** | **Accept.** Patterns are data. Evaluator is small, pure, testable. |
| **Strategy for Fact Providers / future domains** | **Accept later.** Mentor/sponsor catalogs plug in as new *catalogs* + optional fact extractors, not new engine cores. |

**Selected architecture:** Interpreter over a declarative pattern DSL (data-driven rules), not OOP Strategy-per-rule.

**Approved revision:** Public output is a **`DecisionStory`**, composed by a **Story Composer** — not a raw dump of the top-ranked rule.

```text
Facts                → "What do we know?"
    ↓
Rule Evaluation      → "What patterns exist?"
    ↓
Matched Patterns
    ↓
Story Composer       → "What is the most important thing to tell the user?"
    ↓
DecisionStory (FULL TRUTH)
    ↓
Tier Projection      → "What can this user see?"
    ↓
UI (later)           → "How do we reveal it?"
```

```text
┌──────────────────────────────────────────────────────────┐
│ evaluateDecision(input) → DecisionStory (FULL)           │
└──────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────┐
│ 1. extractFacts     │  deterministic FactBag
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│ 2. matchPatterns    │  all patterns where when.* true
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│ 3. composeStory     │  single narrative (cluster if 2+ criticals)
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│ 4. attach debug     │  pattern ids, facts, versions
└─────────────────────┘

projectForTier(story, 'free' | 'pass') → TieredDecisionStory
```

### Multi-critical composition (approved revision)

When **2+ critical** patterns match, do **not** surface “highest priority rule” as the headline.

Story Composer builds one **Critical Cluster** narrative (deterministic): merge evidence/locks, most severe outcome, most conservative recommendation, cluster headline/narrative MessageRefs. Full algorithm: [`DECISION_ENGINE_INVARIANTS.md`](./DECISION_ENGINE_INVARIANTS.md).

### Engine public API (conceptual)

```ts
// Pseudocode — documentation only
evaluateDecision(input: DecisionInput): DecisionStory
projectForTier(story: DecisionStory, tier: 'free' | 'pass'): TieredDecisionStory
formatMessage(ref: MessageRef): string
listPatterns(): PatternMeta[]
ENGINE_VERSION: string
CATALOG_VERSION: string
```

**Critical separation:** RevenueCat never calls into matching. UI calls `evaluateDecision`, then `projectForTier(story, entitlementTier)`.

**Companion freeze docs:** [`DECISION_ENGINE_INVARIANTS.md`](./DECISION_ENGINE_INVARIANTS.md), [`TEST_STRATEGY.md`](./TEST_STRATEGY.md).

---

## 3. Domain model

### Inputs

```ts
// Conceptual types — documentation only

type BuilderStyle = 'executor' | 'explorer' | 'architect' | 'designer' | 'pitcher'
type Goal = 'prize' | 'learn' | 'startup' | 'portfolio'
type Intensity = 'chill' | 'standard' | 'all_nighter'
type Role =
  | 'mobile' | 'frontend' | 'backend' | 'design' | 'ai' | 'product' | 'pitch'

type BuilderProfile = {
  id: string
  name: string
  role: Role
  builderStyle: BuilderStyle
  goal: Goal
  intensity: Intensity
  hour1Ownership: Role
  preferredTeamSize: 2 | 3 | 4 | 5
}

type TeamMember = {
  id: string
  name: string
  role: Role
  builderStyle: BuilderStyle
  goal: Goal
  intensity: Intensity
  hour1Ownership: Role
  isOpenSlot?: boolean  // "needs backend" as vacant seat
}

type Team = {
  id: string
  name: string
  idea: string
  members: TeamMember[]   // includes open slots as synthetic members OR separate needs[]
  needs: Role[]           // open roles still needed
  eventId?: string
}

type DecisionInput = {
  viewer: BuilderProfile
  team: Team
  /** Optional future: locale, experiment flags — ignored in MVP logic */
  options?: { locale?: string; catalogVersion?: string }
}
```

### Facts (derived, never shown raw unless debugging)

Fact extraction is the only place composition math lives.

Examples:

- `leaderCount`, `pitcherCount`, `backendOwners`, `architectCount`, `executorCount`
- `openNeeds: Role[]`
- `viewerAlsoWantsLead: boolean`
- `allPreferPerfectArchitecture: boolean` (if encoded via style/goal)
- `teamSize`, `preferredSizeMismatch`
- `goalDiversityScore`

Facts are a `Readonly<Record<string, FactValue>>` with typed getters in code.

### Pattern definition (catalog entry)

See §5 for schema. Patterns reference facts via a small condition DSL.

### Outputs

```ts
type Severity = 'critical' | 'warning' | 'info'
type Confidence = 'high' | 'medium' | 'low'
type RecommendationKind = 'join' | 'join_if' | 'skip'
type OutcomeKind = 'ready_to_ship' | 'needs_one' | 'dont_join'

type EvidenceItem = {
  /** Resolved string for MVP; also keep key for i18n later */
  text: string
  messageKey: string
  factRefs: string[]   // which facts justified this bullet
}

type SuggestedLockItem = {
  text: string
  messageKey: string
  assigneeHint?: string  // member id or "viewer"
}

type FirstHourPlan = {
  beforeCode: string[]   // resolves Premortem
  then: string[]         // build tasks
}

type PremortemView = {
  patternId: string
  severity: Severity
  confidence: Confidence
  biggestRisk: string
  biggestRiskKey: string
  evidence: EvidenceItem[]
  suggestedLock: SuggestedLockItem[]
  outcomeIfLocked: {
    kind: OutcomeKind
    needsLabel?: string  // e.g. "Backend builder"
  }
  recommendation: {
    kind: RecommendationKind
    joinIfCondition?: string
  }
  firstHourPlan: FirstHourPlan
}

type DecisionResult = {
  engineVersion: string
  catalogVersion: string
  teamId: string
  viewerId: string
  facts: Readonly<Record<string, unknown>>  // debug / analytics; UI should not depend
  primary: PremortemView
  supporting: PremortemView[]  // additional matched risks (Pass depth)
  matchedPatternIds: string[]
}
```

### Tier projection (not a second engine)

```ts
type TieredDecisionView = {
  tier: 'free' | 'pass'
  biggestRisk: string
  evidence: EvidenceItem[]          // free: all or capped? → all (flinch must be real)
  recommendation: PremortemView['recommendation']  // free: kind only; pass: + condition text
  suggestedLockTeaser?: string      // free
  suggestedLock?: SuggestedLockItem[] // pass
  outcomeIfLocked?: PremortemView['outcomeIfLocked'] // pass
  firstHourPlan?: FirstHourPlan     // pass
  supportingSummaries?: { biggestRisk: string; severity: Severity }[] // pass
}
```

---

## 4. Rule evaluation flow

```text
DecisionInput
    │
    ├─► validateInput (throw typed DomainError on broken data)
    │
    ├─► extractFacts(viewer, team) → FactBag
    │
    ├─► for pattern in catalog (filter schemaVersion compatible):
    │       if matches(pattern.when, facts, input) → MatchedPattern
    │
    ├─► if matched.length === 0 → emit built-in fallback pattern
    │       id: "balanced-default"
    │       severity: info
    │       biggestRisk: soft positive / low residual risk copy
    │       recommendation: join
    │       (still fixable locks: freeze MVP, assign presenter if missing, etc.)
    │
    ├─► resolveConflicts(matched) → { primary, supporting }
    │
    ├─► render(primary, facts, input) → PremortemView
    │       render each supporting (for Pass)
    │
    └─► DecisionResult
```

### Condition DSL (minimal)

Avoid Turing-complete expressions. Support only:

```ts
type Condition =
  | { fact: string; op: 'eq' | 'neq' | 'gte' | 'lte' | 'gt' | 'lt'; value: number | string | boolean }
  | { fact: string; op: 'includes'; value: string }
  | { fact: string; op: 'isTrue' } | { fact: string; op: 'isFalse' }

type When = {
  all?: Condition[]
  any?: Condition[]
  not?: Condition[]
}
```

**Challenge note:** A full JSONLogic engine is tempting; reject for MVP. Fewer operators ⇒ fewer bugs and easier golden tests.

### Explanation text generation

| Approach | Verdict |
|---|---|
| LLM inside engine | Forbidden by Product Contract / engineering ethics for core path |
| Bare UI strings from engine | **Rejected (approved revision)** — UI owns rendering |
| **MessageRef: messageKey + template + variables** | **Accept** |

```ts
type MessageRef = {
  messageKey: string
  template: string
  variables: Record<string, string | number | boolean>
}
```

- Engine emits MessageRefs only (DecisionStory fields).
- Pure `formatMessage(ref)` resolves `{var}` slots for CLI/tests.
- UI/i18n may ignore `template` later and resolve via `messageKey` + `variables`.

---

## 5. Pattern schema improvements

Recommended schema for content + engine (TypeScript object or JSON later):

```yaml
id: arch-debate-no-executor
schemaVersion: 1
revision: 3                 # content revision (changelog for writers)
catalog: composition        # composition | mentor | sponsor | ... (future)
priority: 80                # tie-break after severity + confidence

severity: critical          # critical | warning | info
confidence: high            # high | medium | low

when:
  all:
    - { fact: architectCount, op: gte, value: 2 }
    - { fact: executorCount, op: eq, value: 0 }
  any: []

# Copy: prefer message keys; English default inline for MVP speed
messages:
  biggestRisk:
    key: pattern.arch-debate-no-executor.biggestRisk
    default: >
      You'll probably spend more time debating architecture than building.
  evidence:
    - key: pattern.arch-debate-no-executor.evidence.leaders
      default: "{architectCount} members prefer architecting over shipping."
      factRefs: [architectCount]
    - key: pattern.arch-debate-no-executor.evidence.no_executor
      default: "Nobody selected Executor / fast-prototype ownership."
      factRefs: [executorCount]
  suggestedLock:
    - key: …
      default: "Pick one decision owner; others defer for the weekend."
    - key: …
      default: "Assign one Executor to freeze MVP in the first 15 minutes."
  joinIfCondition:
    key: …
    default: "they name a single Product Owner and freeze a one-sentence MVP"
  outcomeNeedsLabel:
    key: …
    default: "Executor / shipper"

outcomeIfLocked: needs_one      # or ready_to_ship | dont_join
recommendation: join_if         # join | join_if | skip

firstHour:
  beforeCode:
    - "Decide one Product Owner"
    - "Freeze MVP to one sentence"
    - "Ban architecture bikeshedding until after first demo cut"
  then:
    - "Executor scaffolds the runnable shell"
    - "Others support only the frozen MVP slice"

# Optional suppressions
suppresses: []                  # pattern ids dominated by this one
tags: [leadership, ship-vs-polish]
```

### Improvements vs earlier draft

| Field | Why |
|---|---|
| `schemaVersion` / `revision` | Version content independently of engine |
| `catalog` | Future mentor/sponsor without core fork |
| `messages.*.key` + `default` | i18n-ready without blocking English MVP |
| `factRefs` | Explainability + tests (“evidence cites facts”) |
| `suppresses` | Cleaner conflict resolution |
| `tags` | Analytics later |
| Removed user-facing `confidence` | Remains internal only |

### Localization later

1. MVP: `default` English strings.
2. Later: `MessageResolver.resolve(key, locale, params)` injected into `renderPremortem`.
3. Engine never imports i18n libraries; resolver is an interface.

```ts
interface MessageResolver {
  resolve(key: string, params: Record<string, string | number>, locale?: string): string
}
```

Default resolver returns `default` from the pattern.

---

## 6. Conflict resolution algorithm

### Ranking key (total order)

For each matched pattern, compute sort key descending:

1. **severity** — `critical` (3) > `warning` (2) > `info` (1)
2. **confidence** — `high` (3) > `medium` (2) > `low` (1)
3. **priority** — numeric, higher wins
4. **id** — lexicographic ascending (stable tie-break)

### Selection

```text
matched = matchAll(patterns, facts)
matched = applySuppressions(matched)  # drop ids listed in winner.suppresses of higher-ranked patterns (iterate carefully)

primary = matched[0] after sort

supporting = next up to K patterns where:
  - severity ∈ {critical, warning}   # info never in supporting for Pass clutter
  - id !== primary.id
  - not mutually exclusive (optional exclusivity groups later)

K = 2 for MVP (Pass can show “Also watch for…”)
```

### Conflicting recommendations

Primary pattern owns:

- `recommendation`
- `outcomeIfLocked`
- `firstHourPlan`
- headline `biggestRisk`

Supporting patterns contribute **additional risks only**, never override Join/Skip.

**Challenge:** Two criticals with opposite recommendations (`join` vs `skip`).

**Resolution:** Ranking still picks one primary. Add lint test: patterns that can co-fire with opposite `recommendation` must declare `exclusivityGroup` or `suppresses`. Content review catches this; engine warns in dev if `primary.recommendation !== supporting[i].recommendation` for critical pairs.

### Fallback

If nothing matches → `balanced-default` (info, join, light locks). Guarantees UI always has a Premortem (decision assistant never blank).

---

## 7. Testing strategy

**Rule:** Unit tests for the engine land **before** Premortem UI.

### Tooling recommendation

- **Vitest** (fast, TS-native) or Jest — either fine; Vitest preferred for pure Node tests without RN jest preset pain.
- No Expo in test path for `src/decision-engine`.

### Test layers

| Layer | What |
|---|---|
| Fact extraction | Given team fixtures → exact FactBag |
| Condition matching | Each operator + `all`/`any`/`not` |
| Pattern match | Each catalog pattern: fires / does not fire on fixtures |
| Conflict resolution | Multi-match fixtures → expected primary id |
| Render | Snapshot or exact string for Biggest Risk + evidence |
| Tier projection | Free omits plan/lock; Pass includes; free still has risk+evidence |
| Invariants | Composition criticism only; every pattern has lock + fixability; recommendation present |
| Golden decisions | 8–12 end-to-end `DecisionInput` → `DecisionResult` fixtures |

### Mandatory tests before UI

1. `extractFacts` for “3 leaders, 0 pitcher, open backend.”
2. Pattern `no-pitcher` wins as primary over `mixed-availability` (info).
3. Viewer-also-wants-lead elevates leadership collision.
4. `projectForTier('free')` never includes `firstHourPlan`.
5. `projectForTier('free')` still includes non-empty `biggestRisk` + evidence.
6. Fallback pattern when team is balanced.
7. No pattern `default` text contains personal attacks (“is a bad leader”).
8. Every catalog pattern has: severity, confidence, lock (≥1), recommendation, beforeCode (≥1).

### Content lint (script later)

CI-friendly checks on catalog:

- Unique `id`
- `schemaVersion` supported
- Message defaults non-empty
- `when` references known facts only

---

## 8. Extension strategy

Design so new products plug in **without changing** `evaluateDecision` core.

### Extension points

| Point | Mechanism |
|---|---|
| New composition rules | Add file under `patterns/catalog/` + register |
| New domains (mentor, sponsor) | New `catalog: 'mentor'` patterns + optional `FactExtractor` |
| Multiplayer | Same `Team` model; members become live users; engine unchanged |
| Analytics | Emit `DecisionResult.matchedPatternIds` + versions to analytics sink **outside** engine |
| AI-assisted copy | Optional post-processor **outside** engine that may rewrite `default` strings but must keep `factRefs`; never inside match/rank |
| Role suggestions | New catalog or supporting patterns; UI surface differs |
| Experiments | `options.experimentFlags` gated in matcher (default ignore) |

### Plugin shape (future)

```ts
type DecisionPlugin = {
  catalog: string
  extractFacts?: (input: DecisionInput, base: FactBag) => FactBag
  patterns: PatternDefinition[]
}

evaluateDecision(input, { plugins?: DecisionPlugin[] })
```

MVP ships **one built-in composition plugin** only. API accepts plugins later without breaking call sites if we add an optional second argument now (forward-compatible).

### What must NOT happen

- Mentors forked into a second scoring system with different result types.
- UI computing risks ad hoc.
- RevenueCat branching inside `matchPatterns`.

---

## 9. Implementation roadmap

Order optimized for risk reduction: **engine truth before UI chrome**.

### Phase A — Foundation (docs + package skeleton)

1. Adopt this architecture + Product Contract (this phase).
2. Author `docs/decision-engine-content.md` (25–30 patterns in schema) — content still highest leverage.
3. Add `src/decision-engine` skeleton + Vitest.
4. Implement types, fact extraction, condition interpreter, rank, render, tier project, fallback.
5. Port first 5 patterns from content doc → catalog modules.
6. Full golden tests green.

**Exit criteria:** `evaluateDecision(json)` works in Node tests with no UI.

### Phase B — Content completion

1. Load remaining patterns (25–30).
2. Content lint + invariant tests.
3. Map mock teams in `src/data` to realistic member compositions that fire memorable primaries.

### Phase C — App integration (still thin UI)

1. Replace static FIT scores with engine results.
2. Wire cinematic Premortem reveal to `projectForTier`.
3. Profile onboarding fields aligned to `BuilderProfile`.
4. Persist profile via AsyncStorage (existing approach OK).

### Phase D — Hack Pass

1. RevenueCat entitlement → `'free' | 'pass'` only.
2. Pass unlocks lock/plan/checklists via projection (engine already complete).
3. Restore purchases.

### Phase E — Polish + Shipaton package

1. Motion, copy pass, demo storyboard.
2. README, LICENSE cleanup, remove unused Firebase if still unused.
3. Video: Biggest Risk → Why → Recommendation → Pass Plan.

### Explicit non-goals until A–D done

Firebase multiplayer, LLM matching, Health Timeline, new pillars.

---

## Challenge summary (engineering answers)

| Question | Answer |
|---|---|
| Is Decision Engine architecture correct? | Yes if **declarative catalog + pure interpreter**; wrong if Strategy-per-rule or UI-coupled scoring. |
| Strategy / trees / rules? | **Declarative patterns**; Strategy only for future fact-provider plugins. |
| Versioning? | `ENGINE_VERSION` + `CATALOG_VERSION` + per-pattern `schemaVersion`/`revision`. |
| priority × severity × confidence? | Sort: **severity → confidence → priority → id**. |
| Conflicting rules? | One primary owns decision; supporting are extra risks; use `suppresses` / exclusivity for opposite recommendations. |
| Explanation text? | Pattern templates + fact interpolation + message keys. |
| Localization? | `MessageResolver` interface; English defaults in MVP. |
| UI independence? | Dedicated `src/decision-engine` with restricted imports; JSON in → result out. |
| Add rules without engine edits? | Register new catalog files; no evaluator changes. |
| Tests before UI? | Facts, match, rank, render, tier, goldens, content invariants. |

---

## Technical risks & mitigations

| Risk | Mitigation |
|---|---|
| Soft/HR-sounding copy slips in | Content lint + principle tests; peer edit Biggest Risk lines |
| Rule explosion / contradictory Join vs Skip | exclusivity + suppresses + conflict warnings |
| Leaking Pass fields on free tier | Single `projectForTier`; UI forbidden from reading `DecisionResult.primary.firstHourPlan` directly |
| Fact key sprawl | Central `factKeys.ts`; conditions cannot invent keys |
| Premature plugin abstraction | Optional plugins arg stub; one catalog in MVP |
| Monolith `app/index.tsx` gravity | Phase C extracts Premortem UI only after engine green |
| Docs drift | Product Contract locked; this file owns engine design |

---

## Future extension map (no core rewrite)

```text
evaluateDecision
   ├── catalog: composition   (MVP)
   ├── catalog: mentor        (later plugin)
   ├── catalog: sponsor       (later plugin)
   └── analytics sink         (outside)
```

Same `DecisionResult` shape; different `catalog` + facts.

---

## Document control

| Doc | Role |
|---|---|
| `PRODUCT_CONTRACT.md` | Immutable product language |
| `DECISION_ENGINE_ARCHITECTURE.md` | Engineering foundation (this file) |
| `DECISION_ENGINE_INVARIANTS.md` | Behavioral guarantees (freeze) |
| `TEST_STRATEGY.md` | Four-layer test strategy (freeze) |
| `decision-engine-content.md` | Later: full 25–30 pattern copy KB |
| `product.md` / `engineering.md` | Redirect stubs |

**Architecture status:** FROZEN after invariants + test strategy. Phase A implementation lives in `src/decision-engine`.

