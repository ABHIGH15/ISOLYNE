# SquadRadar Product Contract

**Status:** LOCKED  
**Audience:** Engineering, design, Shipaton submission  
**Rule:** Do not introduce new product ideas, pillars, or alternate user flows unless they solve a clear engineering problem.

---

## Mission

Help builders avoid joining the wrong hackathon team.

## North Star

> **Should I join this team?**

Every implementation decision must increase confidence in answering that question.

## Canonical product flow

```text
Builder Profile
    ↓
Decision Engine
    ↓
Team Premortem
    ↓
Suggested Lock
    ↓
Recommendation
    ↓
First-Hour Plan
    ↓
Hack Pass (RevenueCat)
```

Nothing competes with this flow.

## Product language

| Term | Meaning |
|---|---|
| Decision Engine | Pure domain system: inputs → premortem → lock → outcome → recommendation → plan |
| Team Premortem | Headline risk + evidence for a specific team composition |
| Suggested Lock | Immediately fixable role/ownership assignments (~30 seconds) |
| Recommendation | `join` \| `join_if` \| `skip` |
| First-Hour Plan | Coordination steps that resolve the Premortem, then build tasks |
| Hack Pass | Confidence / prevention unlock via RevenueCat (not “more features”) |

## Immutable principles

1. Expose failure modes — do not predict success.
2. Decision assistant — not a report generator.
3. Wow = uncomfortable, specific recommendation.
4. Criticize **composition**, never people.
5. Every Premortem must be fixable in ~30 seconds.
6. Free creates the flinch; Pass removes it.
7. Intelligence = writing + deterministic rules (no AI-success claims).
8. One demo story: Premortem → decide → plan.
9. Cinematic reveal: one line → Why? → evidence → lock → outcome.
10. First-Hour Plan starts by resolving the Premortem.
11. Immediate fixability — empowering, not HR judgment.

## Free vs Hack Pass

| Beat | Free | Hack Pass |
|---|---|---|
| Biggest Risk | Yes | Yes |
| Evidence (Why?) | Yes | Yes |
| Soft recommendation | Yes | Full conditions |
| Suggested Lock | Teaser (1 line) | Full |
| Outcome if locked | — | Ready / Needs… / Don’t join |
| First-Hour Plan | — | Full |
| Pitch / demo / submit checklists | — | Yes |

## Explicitly out of MVP scope

Health Timeline, dual Fit/Chemistry reports, AI “predicts success,” precise background GPS, Firebase requirement, GitHub import as a pillar.
