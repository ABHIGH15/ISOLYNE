# Phase 4: Content & Microcopy (Empathetic UX)

Following B2B SaaS best practices ("From Barrier to Bridge"), we are transforming Isolyne's error and alert messaging from robotic status updates into empathetic, actionable insights.

## Web Discovery & Strategy
I researched B2B SaaS microcopy patterns. Best practices dictate:
1. Avoid robotic/blaming language (e.g. "Two members are working from incompatible decisions").
2. Focus on the solution/benefit (e.g. "Aligning now prevents rework later").
3. Use actionable buttons instead of generic prompts.

### Proposed Changes

#### 1. Empathetic Divergence Alerts (The "Barrier to Bridge")
I will rewrite the `hiddenReality` strings across all three kernel detectors:
- **Consensus Gap:** `"Your team is running with different assumptions about ${topic}. Aligning now will save hours of rework."`
- **Ownership Gap:** `"The ${topic} decision is floating without an owner. Assigning one ensures it won't block the team."`
- **Integration Gap:** `"There's a disconnect in the contract with ${providerActor}. Let's sync up to prevent integration bugs."`

#### 2. Empathetic Proposals (Actionable Next Steps)
I will update `ProposalGenerator.ts`:
- Change `"Which should the team use?"` to `"Let's align the squad. Which direction makes the most sense right now?"`

#### 3. Actionable Buttons
I will verify the resolution buttons in `app/index.tsx` are descriptive. (They currently say "Resolve" and "Discuss", which are good, but we will ensure they feel cooperative).

## User Review Required
No breaking changes. This strictly upgrades the emotional resonance of the application's core feature (the alerts).

## Verification Plan
I will run the `kernel.test.ts` suite to ensure the new strings don't break any deterministic IDs or payload structures.
