# Phase 1 Reboot: World-Class LLM Intelligence

Re-engineering the Intelligence Layer (Phase 1) to meet global hackathon standards instead of prototype standards.

## The Strategy

The current implementation (`src/services/llmParser.ts`) uses basic prompting with `JSON.parse`. We will advance this to an enterprise-grade standard.

### Proposed Changes

#### 1. Gemini Schema Enforcement
We will upgrade the Gemini API call to use strict JSON Schema (`responseSchema`) validation at the inference level. This guarantees zero parsing errors natively from the model.

#### 2. System Instructions Separation
We will separate the "persona" into the `systemInstruction` field and keep the `contents` purely for the user's data, which dramatically improves few-shot adherence in Gemini 3.6 Flash.

#### 3. Enterprise Reliability (Resilience)
We will implement an Exponential Backoff Retry wrapper. In a live hackathon demo, if the WiFi drops for a split second, the app shouldn't instantly fallback to the dumb keyword parser if a quick 500ms retry would succeed.

#### 4. UI Precision State (1.3 "LLM is thinking")
We will enhance `StatementChannel.tsx` so the "thinking" state is highly precise and communicates to the user exactly what Isolyne is doing (e.g., "Parsing decision...", "Extracting topic...").

## User Review Required
No breaking changes. This strictly upgrades the resilience of the existing pipeline.

## Verification Plan
### Automated Tests
Run `vitest` against `src/services/__tests__/llmParser.test.ts` to ensure edge cases (garbled input, fallback degradation) remain robust.

### Manual Verification
Type "let's use zustand" into the app and ensure it resolves to Topic: State Management, Choice: Zustand, flawlessly with the new schema engine.
