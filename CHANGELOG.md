# Isolyne Dev Log (Build in Public)

Use this document to log your Phase completions. You can share this file directly with the Shipaton judges in your Devpost submission or on your repo!

## Phase 0: RevenueCat Integration Complete
- Installed `react-native-purchases` and `react-native-purchases-ui`.
- Connected to RevenueCat using API Key configured via environment variables.
- Configured Entitlement check for `isolyne_pro`.
- Implemented the official RevenueCat Paywall UI (`<RevenueCatUI.Paywall />`) to dynamically pull our Lifetime, Yearly, and Monthly products directly from the dashboard!

## Phase 1: Intelligence Layer Robustness Complete
- Upgraded the Statement Channel by replacing the mocked parser with a live LLM integration (Gemini 3.6 Flash).
- Enforced strict JSON structure out of the LLM (`{ actor, topic, choice }`) to cleanly map natural language into our CQRS event log. 
- Built graceful fallback paths: if the user types something unparseable, or if the network drops, it degrades cleanly to local keyword detection without freezing.
- Added a new interpretation boundary test suite and re-ran the full 10-case reliability suite. (Pass!)

## Phase 2 (Part 1): Demo Multiplayer Simulation
- Removed the manual identity-switcher to prevent the demo from looking like a "puppet show".
- Built a native "Demo Simulator" mode: with one tap, the app simulates an incoming conflicting decision from a teammate ("Bob is typing...").
- Hooked this simulation up to seamlessly insert the conflicting signal into the CQRS log, forcing the Isolyne Kernel to calculate a Gap dynamically on camera without manual data entry.

## Phase 3: Visual & Interaction Design (The Hook)
- Extracted and strictly enforced a dark-mode minimalist design system (`theme/tokens.ts`).
- Created the interactive Radar visual identity (`RadarMotif.tsx`). It features a slow, calming concentric sweep during "ALL CLEAR", and snaps into an aggressive pulsating alert when a gap is detected.
- Added smooth expandable evidence views to the radar cards to "show your work" on the LLM's logic.
- Built bespoke empty states for the Decisions and Timeline views.
- Wired up `expo-haptics` across the app (Heavy for locks/resolutions, Medium for challenges, Light for toggles, Error/Success/Warning for LLM boundaries).
- Built a native onboarding overlay (`OnboardingModal.tsx`) to teach the "Silence is a Feature" philosophy on first launch.
- Used generative AI to create a beautiful, cinematic custom iOS App Icon matching the radar motif, and set it as the default Expo asset.

## Phase 1 (Reboot): Enterprise Intelligence Layer
- Re-architected the Gemini REST API integration to use strictly enforced JSON Schemas (`responseSchema`) instead of relying on prompt engineering and `JSON.parse`.
- Isolated context via `systemInstruction` arrays for flawless few-shot parsing.
- Built a custom `fetchWithRetry` wrapper with Exponential Backoff + Jitter to guarantee reliability under adverse network conditions (e.g. conference WiFi).
- Overhauled the UI inference states in `StatementChannel.tsx` to precisely display "Isolyne is extracting decision logic..." instead of a generic loading spinner.
- Performed a deep security and resilience audit on the LLM Parser. Fixed all issues:
  - Migrated the API key from a URL query parameter to the `x-goog-api-key` header to prevent telemetry leakage.
  - Upgraded the model endpoint to `gemini-1.5-flash` to fix the non-existent `3.6` routing bug.
  - Sanitized the input against basic prompt injection (newline removal, max length 500) and capped the dynamic context array to 10 topics to prevent unbounded token growth.
  - Added an `AbortController` (8s timeout) and `Retry-After` header parsing to `fetchWithRetry` to handle captive portals and hard rate limits smoothly.
  - Implemented strict case-insensitive schema validation at runtime to prevent React render crashes if the LLM hallucinates nulls or incorrect types.
  - Hardened the `fallbackParser` to return `null` on casual conversation, fixing a critical bug where empty chatter was logged as architectural decisions if the network was down.

## Phase 2: Multiplayer & Demo Craft
- Replaced the fourth-wall-breaking "Demo Controls" UI with the "Magic Trigger" illusion.
- Holding the `ISOLYNE` header for 1.5 seconds now seamlessly triggers a live simulated incoming cross-device signal.
- Styled the "Bob is typing..." indicator into a stunning, native-style toast pill with an avatar and subtle elevation shadow.

## Phase 4: Content & Microcopy
- Transitioned all divergence alerts (Consensus, Ownership, Integration) from robotic system-speak to empathetic, human-centered language.
- Replaced developer jargon like "immutable record" with collaborative terms like "shared history".
- Embedded dynamic resolution phrasing (e.g. "Let's align the squad. Which direction makes the most sense right now?").
