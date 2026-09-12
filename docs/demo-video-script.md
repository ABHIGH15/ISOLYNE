# 🎬 Project Isolyne — 90-Second Demo Video Script (Next Gen Track)

> **Format:** Recorded mobile walkthrough · Total duration: ~85–90 seconds · **Legible Muted First** (all beats readable via high-contrast on-screen text).

---

## 🎯 North-Star Hook (First 15 Seconds)
* **Visual:** Split screen / fast cuts of natural language inputs in the Decisions channel.
* **0:00 - 0:05:** Alice types `"Going with Postgres for the database"`.
* **0:05 - 0:10:** Switch 'Posting as' to Bob. Bob types `"Setting up Firebase for speed."` 
* **0:10 - 0:15:** The app is quickly backgrounded to the home screen. A few seconds later, a local push notification fires: **⚠️ Isolyne: Drift Detected**. 
* **0:15 - 0:20:** User taps the notification, deep-linking straight into the pulsing red Radar alert.

*(Note for recording: Because there is no backend syncing devices yet, this push is triggered via a simulated 4-second local delay after foreground detection. It demonstrates the exact UX of an asynchronous teammate conflict, without claiming live multi-device sync.)*
* **On-Screen Text (Large, Bold):**  
  `Your teammate is building on Firebase.`  
  `You're building on Postgres.`  
  `Neither of you knows.`
* **Voiceover / Subtitle:** *"Teams don't argue at hackathons... they just build on different assumptions."*

---

## Act 1: The Disagreement Detector (0:15 – 0:35)

| Time | Visual / Screen | Action / Interaction | On-Screen Caption |
|---|---|---|---|
| **0:15** | Project Home (`/`) | Pan over clean dark-mode UI. Title displays active workspace: **Shipaton 2026**. | **ISOLYNE**<br>*The disagreement detector for teams that move too fast to argue.* |
| **0:22** | Projects Ledger (`/projects`) | Shows isolated squad workspaces (*Shipaton 2026*, *HackMIT*). Tap back to active workspace. | *Offline-first local workspaces. Zero login required.* |
| **0:28** | Decisions Feed (`/decisions`) | Feed displays the exact statements Alice and Bob just made. | *No tickets to file. Just state what you're building in plain English.* |

---

## Act 2: Pure Extraction, Not Hallucination (0:35 – 0:55)

| Time | Visual / Screen | Action / Interaction | On-Screen Caption |
|---|---|---|---|
| **0:35** | Statement Channel | Tap Send (`↑`) on a new statement: `"Let's stick to full CRUD for MVP"`. | *A bounded LLM extracts the assumption in 700ms...* |
| **0:43** | Candidate Card | Card appears: **SCOPE** → **Full CRUD**. Tap **"Lock decision"**. | *...but the deterministic CQRS kernel makes the alignment math.* |
| **0:48** | Radar Screen (`/radar`) | Pulse continues on the Database conflict. Tap **"View Evidence"**. | **VERBATIM EVIDENCE**<br>*Always trace the conflict back to exactly what was said.* |

---

## Act 3: 1-Tap Alignment (0:55 – 1:15)

| Time | Visual / Screen | Action / Interaction | On-Screen Caption |
|---|---|---|---|
| **0:55** | Radar Gap Card | Shows verbatim quotes: Alice (*"Postgres"*) vs. Bob (*"Firebase"*). | *Catch the drift before the 3 AM integration emergency.* |
| **1:02** | 1-Tap Resolution | Tap **"PostgreSQL"** resolution chip. | *One tap aligns the entire squad.* |
| **1:08** | Radar Clears | Alert snaps back to calm green **ALL CLEAR**. | *Shared reality is restored.* |

---

## Act 4: The Moment of Doubt & Paywall (1:15 – 1:30)

| Time | Visual / Screen | Action / Interaction | On-Screen Caption |
|---|---|---|---|
| **1:15** | Timeline Screen (`/timeline`) | Scroll chronological event ledger. | *Safety and drift detection are 100% free forever.* |
| **1:20** | Home → Pro Upgrade | Tap **"Upgrade to Isolyne Pro"**. Native RevenueCat Paywall slides up cleanly. | **REVENUECAT INTEGRATION**<br>*Pro monetizes the permanent collaboration record.* |
| **1:26** | Dismiss / End Card | Dismiss Paywall back to Home. Screen fades to branded closing frame. | **Isolyne**<br>*The disagreement detector for teams that move too fast to argue.* |

---

## 🎁 Optional Bonus Beat: Passive Capture Proof-of-Concept (Discord Bot)
> *Technical proof-of-concept / future direction — not a shipped mobile app feature.*

| Time | Visual / Screen | Action / Interaction | On-Screen Caption |
|---|---|---|---|
| **Bonus** | Real Discord Desktop / Web Channel (`#general`) | Terminal runs `npm start` in `discord-bot/`. Two Discord users post conflicting messages in chat: `Alice: Postgres for the database` then `Bob: Mongo for the database`. | **PASSIVE CAPTURE PROOF-OF-CONCEPT**<br>*Detection logic isn't locked to the mobile app UI.* |
| **Bonus** | Discord Bot Reply In-Thread | **Isolyne Radar Bot** immediately replies in-thread:<br>`Isolyne detected a gap: @Alice said Postgres, @Bob said Mongo — same topic (database), different choices.`<br>`> Your team is running with different assumptions about database...` | **REUSED PURE DETECTION KERNEL**<br>*Catches silent divergence where teams already chat.* |
| **Bonus** | Voiceover / Script Note | *"Proof that Isolyne's detection logic isn't trapped in the app: a standalone companion bot running the same pure kernel in live Discord channels."* | *Working prototype: passive capture without workflow disruption.* |

---

## 🎨 Branded End-Card Specification (Final Frame: 1:26 – 1:30)

* **Background:** Deep obsidian dark mode (`#07080F`).
* **Center Motif:** Concentric Isolyne Radar rings with subtle cyan-emerald glow (`#22C55E` / `#00F0FF`).
* **Typography:**
  * **Title:** `ISOLYNE` (Tracked uppercase, bold display).
  * **Tagline:** *"The disagreement detector for teams that move too fast to argue."*
  * **Footer:** `Built for RevenueCat Shipaton 2026 · Next Gen Track`
