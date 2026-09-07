# SquadRadar — Shipaton Submission Checklist

**Track:** Next Gen (primary) · Design as craft argument  
**Rule:** Check only items that affect judging. No feature creep.

---

## A. Experience (muted demo)

- [ ] Cold start shows **SquadRadar** splash/brand before Radar list
- [ ] Demo path is **only** Three Generals, starting **FREE**
- [ ] Profile tab never appears in the recording
- [ ] Biggest Risk held in silence **≥12 seconds** (target 0:14–0:28)
- [ ] Punchline fully readable: *You’ll have three captains and no ship.*
- [ ] Recommendation is unambiguous on camera (🟡 Join if…)
- [ ] Hack Pass appears **after** recommendation as prevention, not settings
- [ ] Unlock → Outcome / First-Hour “Before code” visible
- [ ] Total runtime **≤90s** with ≤6 taps
- [ ] Watched once **muted, no captions** — problem, Premortem, recommendation, Pass, transformation all land
- [ ] End frame is branded (Radar question or edited end card)
- [ ] Record using [`DEMO_RECORDING.md`](./DEMO_RECORDING.md)

## B. Gallery screenshots

Web gallery captured in [`docs/screenshots/`](./screenshots/) (prefer native re-shoot for Devpost):

- [x] Radar — `01-radar.png`
- [x] Biggest Risk — `02-biggest-risk.png`
- [x] Evidence + Lock — `03-evidence-lock.png`
- [x] Recommendation — `04-recommendation.png`
- [x] Hack Pass — `05-hack-pass.png` (no “Demo” tell)
- [ ] Side-by-side stop-scroll review before upload
- [ ] Optional: native device re-shoot for final Devpost media

## C. Repository

- [x] `README.md` complete (startup-quality front door)
- [x] `LICENSE` © Abhi Kumar (Expo template removed)
- [x] Dead `App.tsx` template removed
- [x] Package metadata: name, description, license, author
- [x] No secrets in repo
- [x] `npm test` — 24/24 passing
- [ ] Public GitHub branded (`squadradar` preferred over `HACKOS`)
- [ ] GitHub description = SquadRadar logline

## D. Devpost

- [x] Draft ready in [`DEVPOST.md`](./DEVPOST.md)
- [ ] Pasted to Devpost; matches muted demo
- [ ] Screenshots uploaded
- [ ] Video linked

## E. RevenueCat / Shipaton

- [ ] Entitlement `hack_pass` in dashboard
- [ ] Offering/product attached
- [ ] Public SDK keys in local `.env` (never committed)
- [ ] Purchase path verified for submission video
- [ ] Shipaton form fields complete

## F. Freeze integrity

- [x] No new features / tabs / analytics / Firebase / social
- [x] Decision Engine **v1.0.0** behavior unchanged
- [x] Demo Radar seed tuned so Biggest Risk is the quotable punchline (not a cluster count)
- [x] Prototype tells removed from UI

## G. Final gate

- [ ] Muted demo recorded and accepted
- [ ] Judge would remember Biggest Risk tomorrow
- [ ] Nothing removable without making the experience worse
