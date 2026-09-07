# Decision Engine Invariants

**Status:** Architecture freeze companion  
**Package:** `src/decision-engine`  
**Product:** [`PRODUCT_CONTRACT.md`](./PRODUCT_CONTRACT.md)

These are behavioral guarantees. If a change violates an invariant, it is a bug — not a product tweak.

---

## Layer contract (one question each)

| Layer | Question | Must not |
|---|---|---|
| Facts | What do we know? | Decide what to tell the user |
| Rules | What patterns exist? | Rank, narrate, or gate entitlement |
| Story Composer | What is the most important thing to tell the user? | Know about RevenueCat or UI |
| Tier Projection | What can this user see? | Re-run matching or invent new risks |
| UI (later) | How do we reveal it? | Recompute composition logic |

If any layer answers two questions, refactor.

---

## Output contract: `DecisionStory` (not raw `DecisionResult`)

The public evaluation API returns a **DecisionStory**:

| Field | Role |
|---|---|
| `headline` | Single cinematic Biggest Risk (MessageRef) |
| `narrative` | One short supporting sentence tying the cluster together (MessageRef) |
| `evidence` | Ordered evidence bullets (MessageRef[]) |
| `suggestedLock` | Immediately fixable moves (MessageRef[]) |
| `outcome` | `ready_to_ship` \| `needs_one` \| `dont_join` (+ optional needs label MessageRef) |
| `recommendation` | `join` \| `join_if` \| `skip` (+ optional condition MessageRef) |
| `firstHourContext` | `beforeCode` + `then` (MessageRef[]) |
| `supporting` | Secondary risks that **reinforce** the story (not competing headlines) |
| `debug` | pattern ids, facts, versions — for tests/analytics only |

UI reveals the story. It does not stitch unrelated findings.

---

## Message contract

User-visible copy is **never** a bare string inside domain logic.

Every message is:

```ts
{
  messageKey: string
  template: string
  variables: Record<string, string | number | boolean>
}
```

- Engine emits MessageRefs.
- A pure `formatMessage(ref)` helper may resolve templates for CLI/tests (still no React).
- UI/i18n may replace resolution later using `messageKey` + `variables` only.

---

## Composition & tone invariants

1. **Composition only** — Never criticize a named person as deficient (“Rahul is a bad leader”). Locks may assign roles by name as operational moves.
2. **Fixable** — Every story with severity ≥ warning includes ≥1 Suggested Lock that is actionable in ~30 seconds.
3. **Decision complete** — Every story includes a recommendation kind.
4. **Evidence non-empty** — Every non-fallback story has ≥1 evidence item; each evidence item cites ≥1 fact key in debug metadata.
5. **Lock requires evidence** — `suggestedLock.length > 0` ⇒ `evidence.length > 0`.
6. **No impossible pairs** — See Consistency invariants below.
7. **Fallback always exists** — If no patterns match, emit `balanced-default` story (never empty output).

---

## Consistency invariants (property tests)

| ID | Invariant |
|---|---|
| C1 | `recommendation.kind === 'join'` ⇒ `outcome.kind !== 'dont_join'` |
| C2 | `outcome.kind === 'dont_join'` ⇒ `recommendation.kind === 'skip'` |
| C2b | `recommendation.kind === 'skip'` ⇒ `outcome.kind === 'dont_join'` |
| C3 | `recommendation.kind === 'join_if'` ⇒ condition MessageRef present |
| C4 | `outcome.kind === 'needs_one'` ⇒ needs label MessageRef present |
| C5 | Evidence array never empty for matched (non-empty catalog hit) stories |
| C6 | Suggested lock never present without evidence |
| C7 | `firstHourContext.beforeCode` non-empty whenever tier would expose plan (full story always has beforeCode for non-info OR for any story that recommends join/join_if) |
| C8 | Free projection never includes full `suggestedLock` array, `firstHourContext`, or `outcome` detail beyond what Product Contract allows — see Tier invariants |
| C9 | Pass projection includes full lock + outcome + firstHourContext |
| C10 | `supporting[*].headline` must not equal primary `headline` (no duplicate competing titles) |

---

## Tier invariants

Aligned with Product Contract:

| Beat | Free | Pass |
|---|---|---|
| Headline + narrative | Yes | Yes |
| Evidence | Yes | Yes |
| Recommendation kind | Yes | Yes + condition text when `join_if` |
| Suggested Lock | Teaser only (≤1 MessageRef) | Full |
| Outcome | Hidden | Yes |
| FirstHourContext | Hidden | Yes |
| Supporting | Hidden | Yes (reinforce) |

Engine evaluates **full truth** first. Tier projection only hides fields.

---

## Conflict → Story Composer (multi-critical)

**Do not** treat “highest priority critical” as the user-facing story when **2+ critical** patterns match.

### Deterministic Critical Cluster algorithm

1. `matched = all patterns where when.* holds`
2. `criticals = matched.filter(severity === critical)` sorted by `(confidence ↓, priority ↓, id ↑)`
3. `warnings = matched.filter(severity === warning)` same sort
4. `infos = matched.filter(severity === info)` same sort

**Case A — 0 criticals**  
Primary pattern = best warning, else best info, else `balanced-default`.  
Story fields render from that single pattern.  
Supporting = next warnings (max 2).

**Case B — 1 critical**  
Primary = that critical.  
Supporting = top warnings (max 2) that do not share `exclusivityGroup` conflict.

**Case C — 2+ criticals (cluster)**  
Story Composer builds one **synthesized** DecisionStory:

| Field | Rule |
|---|---|
| `headline` | Cluster headline MessageRef: key `story.cluster.headline`, variables include `criticalCount` and `riskClauses` (ordered short labels from each critical’s `clusterLabel` or truncated biggestRisk template) |
| `narrative` | Cluster narrative MessageRef: key `story.cluster.narrative`, explains these risks compound before join |
| `evidence` | Concatenate evidence from criticals in sort order; dedupe by `messageKey`; cap at 6 |
| `suggestedLock` | Concatenate locks from criticals in sort order; dedupe by `messageKey`; cap at 5 |
| `outcome` | **Most severe** among criticals: `dont_join` > `needs_one` > `ready_to_ship` |
| `recommendation` | **Most conservative** among criticals: `skip` > `join_if` > `join` |
| `join_if` condition | If result is `join_if`, use condition from the critical that contributed that recommendation (first in sort order with `join_if`); if multiple skips, no condition |
| `firstHourContext.beforeCode` | Merge `beforeCode` from criticals in sort order; dedupe; cap at 6 |
| `firstHourContext.then` | Merge `then` from criticals; dedupe; cap at 6 |
| `supporting` | Remaining criticals’ **short labels** as reinforcing items (not alternate Biggest Risks), plus top warnings, max 3 total supporting entries |
| `debug.primaryPatternIds` | All critical ids in cluster (ordered) |
| `debug.headPatternId` | First critical id (anchor for analytics) |

### Severity of outcome / recommendation (total orders)

```text
outcome:     dont_join (3) > needs_one (2) > ready_to_ship (1)
recommend:   skip (3) > join_if (2) > join (1)
confidence:  high (3) > medium (2) > low (1)
severity:    critical (3) > warning (2) > info (1)
```

### Suppression

If pattern A lists `suppresses: [B]` and A ranks above B in its severity band, drop B before composition.

---

## Purity invariants

1. No imports from `react`, `react-native`, `expo*`, `@react-native-async-storage/*`, `firebase`, `react-native-purchases`.
2. `evaluateDecision(input)` is synchronous and deterministic for the same catalog version.
3. Same input + same catalog ⇒ deep-equal DecisionStory debug ids and MessageRef keys/variables (templates stable).

---

## Version invariants

Every DecisionStory includes:

- `engineVersion`
- `catalogVersion`

Golden tests pin both.

---

## Failure mode

Invalid input (missing team members array, unknown enums) ⇒ throw typed `DecisionEngineError` with code. Do not return a partial story.
