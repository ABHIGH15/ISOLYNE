# Experiment 003 — Scope Alignment Recognition

**Objective:** Does the Awareness Engine work outside ownership problems? Is Collaboration Intelligence a reusable primitive, or did we accidentally build a very good leadership reminder?

**Protocol Loop:** `Awareness Gap (Scope) → Decision Proposal → Alignment → Commitment`

---

## 🛑 Golden Rule
**Test the primitive, not the feature.** We are testing whether users can map a completely different failure mode (Scope) onto the same exact Align/Challenge mechanism without confusion.

---

## The Simulation (Frozen Scenario: 4 strangers, 4 ideas)

### Step 1 — Reveal
The participant sees:
```
Current situation:
Four people. Four interpretations.

If nobody aligns:
You may spend the entire event building different products.

Proposal:
Create one shared definition.

[Review proposal]
```

### Step 2 — Alignment
When tapped, they enter the **Align** phase:
```
Scope lock proposed:
Create one shared definition.

Before this locks:
Does this represent what we are building?

[Agree] [Challenge]
```

---

## Metrics to Capture (Raw Data)

*Copy this block for all 5 participants during the trial.*

### Participant X
* **Recognition:** 
  * *Ask:* "What problem is the system pointing out?"
  * *Target:* "We are building different things."
  * *Observation:* 
* **Alignment:** 
  * *Observation:* Do they naturally use the [Agree] / [Challenge] binary for a non-leadership decision, or does the UI feel forced?
  * *Response:* 
* **Resolution:** 
  * *Ask after lock:* "What does the team know now?"
  * *Target:* "Everyone now has the same target."
  * *Response:* 

---

## Rehearsal Synthesis (Simulated 5-Person Test)

We ran 5 simulated personas (Backend, Frontend, UX, PM, AI Hacker) through this protocol to detect obvious flaws before physical testing.

**1. Recognition (Scope vs Leadership):** 
- *Finding:* Execution-focused developers (Backend, Hacker, Freshman) initially felt a slight "bureaucracy/documentation" vibe ("the app wants us to write docs"), though they logically recognized the scope conflict. Product/Design personas saw it instantly as a necessary forcing function.

**2. Alignment Usability:** 
- *Finding:* Junior developers initially viewed the `[Challenge]` as a "blocker" holding them back from coding. Experienced devs and PMs correctly viewed it as surfacing misalignment early (e.g. "failing fast", "uncovering edge cases"). The binary `Agree/Challenge` mechanism worked perfectly to pause the team.

**3. Resolution Awareness:** 
- *Finding:* 5/5 subagents successfully internalized that the scope was now locked. None felt "the app decided our idea"—they accurately reported: "Now everyone has the exact same definition."

---

## The Real Experiment 003 Protocol

**Participants:** Hackathon builders, Startup teams, Students building projects.
**Golden Rule:** No explanation. Script: *"This is a tool for teams. Tell me what you think is happening."*

### Metrics to Capture

#### 1. Divergence Surprise
- **Before seeing Challenge:** *"How confident are you that everyone is imagining the same product?" (Scale: 1 [completely different] — 5 [exactly the same])*
- **After seeing Challenge:** *"Did your confidence change?"*
- **Target Success:** Shift from a 4-5 down to realizing the gap exists ("Actually, I guess we weren't aligned").

#### 2. Recognition
- **Target:** < 15 seconds to realize "We are not building the same thing" (without feeling like they are being asked to write process documentation).

#### 3. Category Transfer
- **Ask:** *"Do you think this is solving the same kind of problem as leadership?"*
- **Target Success:** *"Yes, it is about making sure everyone understands."* (This is the ultimate test of the category).

### Final Classification

- [ ] **Pass — The Primitive is Universal.**
  *(Proceed: Expand the engine to all 8 Moments. We have built a new category of software: Collaboration Intelligence.)*

- [ ] **Fail — The Primitive is Context-Bound.**
  *(Proceed: Restructure the interaction models. What works for leadership does not work for technical scoping.)*
