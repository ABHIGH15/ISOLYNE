# Phase G6 — Hero Craft

**Status:** Complete (recommended variant shipped)  
**Scope:** Biggest Risk **stage** only. No product, flow, copy words, or engine changes.

## Objective

Composition pass. Not a redesign.

> If the sentence is removed, the screen should still feel intentionally composed.  
> If everything except the sentence is removed, the sentence should feel even stronger.

Success:

> **Does this make the sentence more unforgettable?**

---

## Variants considered

### Variant A — Absolute chrome + poetry breaks *(shipped)*

- Back reduced to a ghost `‹` (absolute; no “Radar” label on stage)
- Team name removed from stage (returns after Why?)
- Manual line breaks for hero punchlines
- Measure `maxWidth: 340`, left-aligned
- Meta block (hairline + label) with fixed cadence under the sentence
- Why? quieter, farther below
- Scroll locked on stage so the frame holds still

**Rationale:** Removes competition. Treats the sentence as set type. Best match to Pass 1 + G6 criteria.

### Variant B — Centered column

- Same breaks; `alignSelf: 'center'` on measure  
**Rejected:** Centering softens the accusation; feels poster, less documentary.

### Variant C — Larger type (40/48) without composed breaks

**Rejected:** Auto-wrap returns; rhythm is luck. Size without composition is noise.

---

## Shipped craft

| Focus | Change |
|---|---|
| Line rhythm | `composeHeroLines` — presentation-only breaks |
| Measure | `maxWidth: 340` |
| Top chrome | Ghost back only; no team whisper on stage |
| Vertical air | `heroAir` + meta block + Why? distance |
| Effects | None added |

Three Generals stage reads:

```text
You’ll have three
captains
and no ship.

────
BIGGEST RISK

Why?
```

---

## Freeze

After G6, **do not touch the hero** unless real users reveal a genuine problem.

Next: 5 real user tests → demo iteration → submission polish → bug sweep.
