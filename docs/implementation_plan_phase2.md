# Phase 2: Multiplayer & Demo Craft (Deep Atomic Plan)

We need the demo video to look like absolute magic. Currently, we have a visible "Demo Controls" bar that completely breaks the fourth wall.

## Web Discovery & Strategy
I researched best practices for React Native real-time sync (Supabase Broadcast channels vs. Local Illusion). Here is the plan to achieve a world-class demo.

### Proposed Changes

#### 1. The "Magic" Invisible Trigger (Illusion of Multiplayer)
I will completely remove the visible "Demo Controls" UI. Instead, I will implement a hidden gesture: **Long-pressing the "ISOLYNE" header for 1.5 seconds**. 
When triggered, the app will smoothly slide down a beautiful, native-looking "Bob is typing..." notification pill, wait 2.5 seconds, and then seamlessly inject the conflicting signal into the stream. To the audience, it looks like a genuine, live cross-device event.

#### 2. Cinematic Incoming Toast
I will upgrade the "Bob is typing" UI from a basic text string into a beautiful, animated notification pill with an avatar, matching the cinematic design system we built in Phase 3.

#### 3. Task 2.2 Stretch Goal: True Cross-Device Sync (Optional)
If you want to actually hand a second phone to a judge and have them trigger the gap live, we need a real WebSocket.
*Option:* If you provide a Supabase URL and Anon Key, I will build a `Broadcast` channel listener to sync the CQRS kernel across devices in under 50ms. 
*Recommendation:* For a recorded Devpost video, the "Magic Trigger" (Step 1) is indistinguishable from reality and guarantees 100% reliability on stage.

## User Review Required
Do you want me to build the **Magic Invisible Trigger (Illusion)**, or do you want to pause and provision a **Supabase Project for True Sync**?

## Verification Plan
I will launch a UI Subagent to audit the gesture recognizer and ensure the hidden trigger fires exactly as intended without interfering with normal scrolling.
