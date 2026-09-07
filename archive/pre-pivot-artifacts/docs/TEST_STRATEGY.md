# Decision Engine Test Strategy

**Status:** Architecture freeze companion  
**Invariants:** [`DECISION_ENGINE_INVARIANTS.md`](./DECISION_ENGINE_INVARIANTS.md)  
**Architecture:** [`DECISION_ENGINE_ARCHITECTURE.md`](./DECISION_ENGINE_ARCHITECTURE.md)

---

## Goal

Prove the Decision Engine is deterministic, explainable, and safe **before** any SquadRadar UI exists.

Success criterion for Phase A:

> Evaluate mock team JSON from the command line and get a full `DecisionStory` with tests green.

---

## Tooling

| Tool | Role |
|---|---|
| **Vitest** | Unit, integration, golden, property tests |
| **Node CLI** | `npx tsx src/decision-engine/cli.ts <fixture.json>` (or `vitest`-adjacent script) |
| **No Jest RN preset** | Engine tests run in pure Node |

---

## Four test layers

### 1. Unit tests

**Scope:** One function / one pattern at a time.

| Area | Examples |
|---|---|
| Fact extraction | 3 leaders → `leaderCount === 3`; open backend need → fact true |
| Condition ops | `eq`, `gte`, `includes`, `all` / `any` / `not` |
| Single pattern match | Pattern fires only on intended fixture; does not fire on control |
| Message interpolation | `formatMessage` substitutes variables; missing var throws or leaves explicit sentinel (document choice: **throw in dev/test**) |
| Tier field stripping | Free omits plan/outcome/full lock |

**Rule:** Every catalog pattern has at least one positive and one negative match unit test (can share table-driven cases).

---

### 2. Integration tests

**Scope:** Multiple overlapping patterns → Story Composer.

| Case | Expect |
|---|---|
| One critical + one warning | Headline from critical; warning in `supporting` |
| Three criticals (no presenter, no backend, three leaders) | **Cluster synthesis** — single headline via `story.cluster.*`, evidence merged, conservative recommendation |
| Suppression | Higher pattern suppresses lower; suppressed id absent from debug |
| Opposite recommendations in cluster | Conservative wins (`skip` over `join`) |
| Only infos | Soft story; recommendation join allowed |

Integration tests assert **story shape and debug pattern ids**, not pixel UI.

---

### 3. Golden tests

**Scope:** Entire named teams → frozen `DecisionStory` snapshots (MessageRefs + debug ids).

Example fixtures:

- `startup-dreamers.json`
- `three-generals-no-demo.json`
- `ai-only-no-frontend.json`
- `balanced-campus-four.json`

Snapshot includes:

- `engineVersion`, `catalogVersion`
- `headline.messageKey` + `variables`
- `narrative.messageKey`
- evidence keys (ordered)
- recommendation/outcome kinds
- `debug.primaryPatternIds` / `headPatternId`

**Policy:** Updating goldens requires conscious review — treat as product change.

Prefer asserting structured MessageRefs over fully formatted English strings so copy tweaks to `template` text can be intentional. Optionally also assert `formatMessage(headline)` for demo-critical lines.

---

### 4. Property / invariant tests

**Scope:** Random or exhaustive generated inputs within enum bounds.

For many generated `(viewer, team)` pairs:

- Run `evaluateDecision`
- Assert all invariants in `DECISION_ENGINE_INVARIANTS.md` (C1–C10, tone checks where automatable)

Minimum automation:

| Check | Method |
|---|---|
| C1–C6, C10 | Direct asserts on every result |
| C7 | `beforeCode.length > 0` when recommendation is join/join_if OR any critical matched |
| C8–C9 | Compare `projectForTier` free vs pass |
| No empty story | Always defined headline MessageRef |
| Purity | ESLint restricted imports (CI) |

Use `fast-check` **optional** in Phase A; table-driven fuzz of enum combinations is enough for MVP if property lib adds friction. Prefer **fast-check** if install is cheap.

---

## CLI acceptance

```bash
npm run decision-engine:eval -- fixtures/three-generals.json
```

Prints formatted DecisionStory (resolved messages) + JSON debug. Exit 0 on success.

---

## What we do not test in Phase A

- React components
- Expo Router
- AsyncStorage
- RevenueCat
- Firebase
- Visual animation / cinematic reveal timing

---

## Definition of Done (Phase A)

- [ ] `src/decision-engine` exists and is UI-free
- [ ] `evaluateDecision` + `projectForTier` + `formatMessage` exported
- [ ] Seed catalog (≥5 real patterns + `balanced-default`)
- [ ] Unit + integration + golden + invariant tests passing
- [ ] CLI evaluates a fixture end-to-end
- [ ] Invariants + this strategy doc remain accurate

Only then: app integration.
