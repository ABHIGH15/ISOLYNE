# Phase C — Craft

**Mission:** Judges remember the Biggest Risk three days later.  
**Constraint:** No new features, screens, architecture, or RevenueCat.

## Emotion arc

```text
Anxiety ("I might waste 24 hours")
  → Recognition ("Oh — here's why")
  → Relief ("We can fix it")
  → Clarity ("I know what to do")
```

## Brand

Night venue. Quiet urgency. One sentence owns the stage.

Tokens: `src/presentation/theme/tokens.ts`

| Token | Role |
|---|---|
| `color.risk` | Biggest Risk emphasis |
| `color.join / caution / skip` | Decisive recommendation |
| `type.risk` | Stage typography for the punchline |
| `motion.discloseMs` | Only progressive disclosure |

## Biggest Risk = moment

At step 0 (Pass 1 recomposition):
- **The sentence is the artwork.** Label is metadata below a hairline.
- Chrome collapses (whisper back + team)
- No card chrome, no accent rail, no lavender CTA
- Coral only as a short rule under the punchline
- Empty space is tension — `space.heroAir`
- User earns the next beat with a quiet text **Why?**

## Screenshot targets

1. Biggest Risk stage  
2. Suggested Lock (green ownership)  
3. Recommendation banner (🟢 / 🟡 / 🔴)

## Motion rule

If an animation doesn’t answer a question, delete it.
