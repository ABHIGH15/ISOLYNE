# Researcher Protocol — Formation Trial v0.1

## Before the session

1. Open `app/protocol/trial` on the test device.
2. Confirm the Reveal screen is showing (Situation + Action).
3. Expand the Researcher panel at the bottom. Verify the timer is running.

---

## Golden Rule: No Mid-Trial Adjustments

**Do not modify anything after participant 1.**
Even if the first person says: "I don't understand." Do not fix the code. Run all 5 with the exact same build. If you change it, you are testing five different products.

---

## Giving the phone

Hand the phone to the participant.

Say exactly this:

> "This is a tool for teams. Tell me what you think is happening."

**Then remain silent.**

Do NOT say:
- "This is about leadership"
- "Press the button"
- "It detects risks"
- "Read the bottom part"
- "It's like a team health check"

---

## During observation

### Emotional Reaction (The Realization Moment)

Watch for physical signs of the "aha" moment:
- Do they lean closer to the screen?
- Do they pause thoughtfully before pressing?
- Do they look back at their teammates?
- Do they murmur something like "actually, yeah..."?

A good Collaboration Intelligence system should create a small realization: *"Oh. We actually haven't decided that."*

### Recognition (0–10 seconds)

Watch for:
- Do they speak first, or stare silently?
- Do they describe the problem unprompted?
- Do their eyes go to the title first or the button first?

**If they describe the problem:** Tap `✓ Understood` in the Researcher panel.

**If they ask a question:** Tap `⚠ Asked Question` in the Researcher panel. Do not answer. Say: "What do you think?"

### Commitment (10–30 seconds)

Watch for:
- Do they tap without hesitation?
- Do they look at you before tapping?
- Do they re-read the consequence text?

**The moment they tap, the system records the timestamp automatically.**

### Resolution (after tap)

Say nothing for 5 seconds.

Watch for:
- Do they nod or accept the new state?
- Do they say "Now what?" (failure signal)
- Do they smile or exhale? (success signal)

---

## Post-trial question

After the resolved screen has been visible for at least 5 seconds, ask exactly this:

> "What just happened?"

Record their exact words in the `Verbal reaction` field.

Then add your own observations in `Researcher notes`:
- Body language
- Hesitation points
- Eye movement
- Emotional state

Tap `Save Trial Result`.

---

## Interpreting results

| Signal | Meaning |
|--------|---------|
| Describes problem in own words within 5s | Recognition: strong |
| Taps immediately, no eye contact with researcher | Commitment: natural |
| Says "okay" or nods after resolution | Resolution: accepted |
| Asks "what does this mean?" | Recognition: failed |
| Looks at you before tapping | Commitment: uncertain |
| Says "now what?" after resolution | Resolution: not understood |

---

## After 5 participants

Fill in `docs/trial-results.md` and make the go/no-go decision.
