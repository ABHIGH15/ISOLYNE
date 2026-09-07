# Engineering rules

**Product source of truth:** [`PRODUCT_CONTRACT.md`](./PRODUCT_CONTRACT.md)  
**Architecture source of truth:** [`DECISION_ENGINE_ARCHITECTURE.md`](./DECISION_ENGINE_ARCHITECTURE.md)  
**Invariants:** [`DECISION_ENGINE_INVARIANTS.md`](./DECISION_ENGINE_INVARIANTS.md)  
**Tests:** [`TEST_STRATEGY.md`](./TEST_STRATEGY.md)  
**Pattern Library:** [`PATTERN_LIBRARY.md`](./PATTERN_LIBRARY.md)  
**Product QA:** [`PRODUCT_QA.md`](./PRODUCT_QA.md)  
**Phase B:** [`PHASE_B_CINEMATIC_REVEAL.md`](./PHASE_B_CINEMATIC_REVEAL.md)  
**Phase C craft:** [`PHASE_C_CRAFT.md`](./PHASE_C_CRAFT.md)  
**Phase D:** [`PHASE_D_COMPETITION.md`](./PHASE_D_COMPETITION.md) · [`DEMO_SCRIPT.md`](./DEMO_SCRIPT.md) · [`DEVPOST.md`](./DEVPOST.md)  
**Phase E / submission:** [`JUDGE_AUDIT.md`](./JUDGE_AUDIT.md) · [`SUBMISSION_CHECKLIST.md`](./SUBMISSION_CHECKLIST.md)  
**Phase F / excellence:** [`PHASE_F_PRODUCT_EXCELLENCE.md`](./PHASE_F_PRODUCT_EXCELLENCE.md) · [`FOUNDER_ACCEPTANCE_TEST.md`](./FOUNDER_ACCEPTANCE_TEST.md) · [`PASS_2_SILENCE.md`](./PASS_2_SILENCE.md)  
**Phase G / trust:** [`PHASE_G_PRODUCT_TRUST.md`](./PHASE_G_PRODUCT_TRUST.md) · [`HERO_FREEZE.md`](./HERO_FREEZE.md) · [`USER_TEST_PROTOCOL.md`](./USER_TEST_PROTOCOL.md) · [`PRODUCTION_READINESS.md`](./PRODUCTION_READINESS.md)

Decision Engine is frozen at **v1.0.0**. Do not change engine behavior during UI work without formal review.

## Standing rules

- **Phase F:** Think like a design critic. Codebase is finished unless a bug. Every change must clearly raise Shipaton win odds.
- Strict TypeScript; domain logic lives in `src/decision-engine` and stays free of React, Expo, Firebase, and RevenueCat imports.
- Decision Engine is deterministic, explainable, and unit-tested before Premortem UI.
- Criticize team composition, never people. Every Premortem must be fixable in ~30 seconds.
- Do not claim the product predicts success or measures personal ability.
- Keep location approximate and opt-in when Event Mode exists.
- Use deterministic mock event data until production backends are intentional.
- Never put Firebase, RevenueCat, or AI API credentials in the client or repository.
- Entitlement gating is `projectForTier` after `evaluateDecision` — not inside rule matching.
