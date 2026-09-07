# Experiment 001 — Leadership Gap Results

**Objective:** When a human encounters a moment of coordination uncertainty, does this intervention create a useful behavioral shift?

**Scenario:** 4 strangers, 0 owners. "Everyone can build — but nobody owns the final decision."

---

## 🛑 Golden Rule
**Do not modify the application between participants.** Participant 1 is not a bug report; they are a measurement.

---

## Raw Data

### Participant 1
* **Background:** 19-year-old CS Freshman
* **Recognition:**
  * Time: 5-6s
  * Interpretation: Team is looping between building a React web app or an AI Discord bot and nobody wants to just pick one.
* **Action:**
  * Clicked? (Yes/No): Yes
  * Time to click: ~15s (after hesitating and asking question)
  * Confidence/hesitation (Good/Bad): Good hesitation (anxious about taking pressure, but desperate to open VS Code).
* **Questions asked:**
  * Yes/No: Yes
  * What question?: "Wait, if I tap this, does it ping my team's group chat and tell them I'm the boss now?"
* **Emotional reaction:**
  * [x] "Actually, yeah..."
  * [ ] Confusion
  * [ ] Indifference
  * [ ] Resistance
  * [x] Other: Heavy awkward sigh, nervous laugh. Squinted closely. Felt "called out."
* **Resolution explanation:** 
  *(Prompt: "What just happened?")* "I just became the project manager... it locked in a decision and maybe sent a notification to the other three people... forced us out of the planning phase."
* **Product Pull:** 
  *(Prompt: "If this appeared automatically during your next hackathon, would you want it?")* Yes. Terrifying/passive-aggressive, but would want it to save the half-day wasted on being too polite to shoot down bad ideas.
* **Researcher notes:** Incredible recognition. The hesitation was purely social (fear of stepping on upperclassmen toes), not confusion. The question directly highlighted the need for an alignment layer.

### Participant 2
* **Background:** 22-year-old Backend Developer
* **Recognition:**
  * Time: 2s
  * Interpretation: "Too many cooks, no head chef death spiral. Watching a team waste half a day arguing while zero lines get pushed."
* **Action:**
  * Clicked? (Yes/No): Yes
  * Time to click: <5s
  * Confidence/hesitation (Good/Bad): Good (split-second thought about Jira tickets, then smashed it).
* **Questions asked:**
  * Yes/No: No
  * What question?: N/A
* **Emotional reaction:**
  * [x] "Actually, yeah..."
  * [ ] Confusion
  * [ ] Indifference
  * [ ] Resistance
  * [x] Other: Exhaled hard, sarcastic "thank god", shoulders physically dropped.
* **Resolution explanation:** "Endless debate is officially over, and I'm the benevolent dictator now. Making the final call on spec so we can open PRs."
* **Product Pull:** "Hell yes... If you waste three hours on 'what exactly is our MVP?', you're already dead in the water."
* **Researcher notes:** Immediate adoption. Protocol perfectly matched the pain point of forced consensus.

### Participant 3
* **Background:** UX Design Student
* **Recognition:**
  * Time: 6s
  * Interpretation: "App knows exactly the dynamic... flat hierarchy of builders stuck in an infinite loop of 'what if we add this feature?'"
* **Action:**
  * Clicked? (Yes/No): Yes
  * Time to click: ~15s (after asking question)
  * Confidence/hesitation (Good/Bad): Good (split-second imposter syndrome about dictating to 3 engineers).
* **Questions asked:**
  * Yes/No: Yes
  * What question?: "Wait, if I tap this, does it notify my team? Does it lock them out of something?"
* **Emotional reaction:**
  * [x] "Actually, yeah..."
  * [ ] Confusion
  * [ ] Indifference
  * [ ] Resistance
  * [x] Other: Slumped shoulders in relief, nervous laugh, leaned back, pointed at screen ("Oof, dragged").
* **Resolution explanation:** "I just became the project manager. Gave my 3 engineers psychological permission to stop worrying about the big picture... traded chaotic democracy for a functional dictatorship."
* **Product Pull:** Mixed feelings but ultimately yes. "Harsh truth we usually don't have the guts to say out loud to each other."
* **Researcher notes:** Again, the question asked was about the mechanism of team alignment, not confusion about the decision itself.

### Participant 4
* **Background:** PM Enthusiast (Business Major)
* **Recognition:**
  * Time: 3s
  * Interpretation: Diagnosing classic "Friday 11 PM churn" where everyone is polite but no one steps on toes. Forcing a RACI matrix onto a flat hierarchy.
* **Action:**
  * Clicked? (Yes/No): Yes
  * Time to click: ~10s
  * Confidence/hesitation (Good/Bad): Good (Ego wanted to smash it, PM training made them pause).
* **Questions asked:**
  * Yes/No: Yes
  * What question?: "Wait, if I hit this, what does their screen show? Do they get a notification... or do they have to approve it?"
* **Emotional reaction:**
  * [x] "Actually, yeah..."
  * [ ] Confusion
  * [ ] Indifference
  * [ ] Resistance
  * [x] Other: Leaned in, sharp validated laugh. Nodding vigorously.
* **Resolution explanation:** "Bypassed the storming phase and manufactured instant alignment. Resolved the consensus-trap."
* **Product Pull:** Yes, but only if it manages team psychology. Warned that hackathon engineers hate feeling "managed" unilaterally. Needs a team approval step.
* **Researcher notes:** Participant explicitly requested the "Agree/Challenge" layer that is planned for the next phase.

### Participant 5
* **Background:** Solo AI Hacker
* **Recognition:**
  * Time: 2s
  * Interpretation: Deadlock resolution protocol for human wetware. Four devs proposing new architectures, failing to achieve consensus.
* **Action:**
  * Clicked? (Yes/No): Yes
  * Time to click: 5s
  * Confidence/hesitation (Good/Bad): Good (Hesitated because they hate managing people, but hate circular whiteboard debates more).
* **Questions asked:**
  * Yes/No: No
  * What question?: N/A
* **Emotional reaction:**
  * [x] "Actually, yeah..."
  * [ ] Confusion
  * [ ] Indifference
  * [ ] Resistance
  * [x] Other: Sharp heavy sigh, rubbed nose, leaned over phone. Massive relief masked as irritation.
* **Resolution explanation:** "Force-pushed to main on our team dynamic... established a BDFL."
* **Product Pull:** Yes. "Hackathons die because of 3 AM democratic consensus. Every team of strangers devolves into a polite, passive-aggressive stalemate."
* **Researcher notes:** Perfectly understood. Zero friction.

---

## Synthesis & Classification

**Recognition Success:** 5 / 5
**Commitment Success:** 2 / 5 (3 asked questions before committing)
**Resolution Success:** 5 / 5
**Product Pull:** 5 / 5

*Researcher Note on "Questions Asked":* While 3/5 participants asked a question, failing the strict `askedQuestion === true` metric, **not a single participant asked what the problem meant or what they were supposed to do.** All 3 asked the exact same variant of: *"Does this notify my team? / Do they have to approve?"* This does not invalidate the protocol; it violently demands the next feature.

### Final Decision (Choose One)

- [x] **A — Protocol Works**
  *(Proceed: Build `Reveal → Align → Commit` layer)*

- [ ] **B — Language Problem**
  *(Proceed: Keep architecture, rewrite framing, re-test)*

- [ ] **C — Concept Problem**
  *(Proceed: Return to theory, question the category)*
