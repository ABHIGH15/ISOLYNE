# Devpost — SquadRadar (Shipaton 2026)

## One sentence (logline)

SquadRadar helps hackathon builders avoid joining the wrong team by exposing composition risks before they commit—and unlocking a role-aware first-hour plan when they need prevention.

## One paragraph

Finding teammates at a live hackathon is broken: Discord spam, ghosting, and no way to know if a squad will actually ship. SquadRadar is a decision assistant, not a social network. Tap a nearby team and see a Team Premortem—the Biggest Risk first, then evidence, a concrete ownership lock, and a Join / Join if… / Skip recommendation. Free shows the flinch. Hack Pass (RevenueCat) unlocks prevention: full locks, residual outcome, and a first-hour plan. Built for students competing in Shipaton’s Next Gen track: explainable rules, not black-box “AI success scores.”

## Full description

### The problem

Solo builders waste nights joining teams that thrash on leadership, ship with no presenter, or staff five open roles for a 36-hour event. Existing tools optimize for matching skills. They don’t answer the real question: **Should I join this team?**

### What we built

SquadRadar surfaces a **Team Premortem** before you commit:

1. **Biggest Risk** — one memorable sentence (the hero moment)  
2. **Why?** — evidence from real roster composition  
3. **Suggested Lock** — an ownership fix you can do in 30 seconds  
4. **Recommendation** — Join / Join if… / Skip  
5. **Hack Pass** — prevention: outcome if locked + first-hour plan  

### How it works (technical)

- **Decision Engine v1.0** — pure TypeScript, UI-independent, deterministic Pattern Library  
- Facts → rules → Story Composer → DecisionStory → Free/Pass projection  
- Expo / React Native presentation layer renders the story with cinematic progressive disclosure  
- **RevenueCat** powers the Hack Pass entitlement (`hack_pass`) so monetization is part of the decision journey  

### RevenueCat

Hack Pass is not “more features in settings.” After the Premortem creates doubt, Pass unlocks **prevention**: full Suggested Lock, Outcome if Locked, and First-Hour Plan. Purchases and restores go through RevenueCat. Free users still get Biggest Risk + Evidence + soft Recommendation—so collaboration isn’t paywalled; confidence is deepened.

### What’s frozen / intentional

We do **not** score personality, skill quality, or idea viability. We criticize composition, never people. Unsupported modes are listed in the Pattern Library coverage report—keeping scope sharp for Shipaton.

## Technical architecture (short)

```text
Builder Profile + Team roster
        ↓
Decision Engine (pure TS)
        ↓
DecisionStory
        ↓
projectForTier(free|pass)  ← entitlement from RevenueCat
        ↓
Cinematic Reveal UI
```

## Built with

Expo 57 · React Native · TypeScript · RevenueCat (`react-native-purchases`) · AsyncStorage
