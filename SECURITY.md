# Security Policy

## Supported Versions

Currently, Isolyne is in active development for the RevenueCat Shipathon 2026. We support the latest `main` branch.

| Version | Supported          |
| ------- | ------------------ |
| v1.0.x  | :white_check_mark: |

## Core Security Tenets

Isolyne handles sensitive team architectural decisions and internal constraints. Security and privacy are foundational, not afterthoughts.

### 1. Offline-First & Local Storage
All collaboration signals, reality states, and event logs are stored strictly on-device using `AsyncStorage` (and soon, local SQLite/CRDTs). **There is no central Isolyne cloud database.** Your team's decisions never leave your device unless you explicitly export an Alignment Report.

### 2. Bounded LLM Extraction & Fallback
The LLM (Groq/Gemini) is used strictly for extraction, not decision-making. 
* **Prompt Injection Protection:** Inputs are sanitized (newline stripping, length capped to 500 characters) before reaching the model.
* **Context Bounding:** The dynamic context array is capped to 10 topics to prevent unbounded token growth or context poisoning.
* **Telemetry Leakage Prevention:** API keys are injected securely via HTTP headers (`x-goog-api-key`, `Authorization: Bearer`), never via URL query parameters.
* **Offline Degradation:** If network connectivity drops or the user removes their API key, the system cleanly degrades to a local deterministic keyword parser.

### 3. RevenueCat Entitlements
Pro status and exports are gated securely via the RevenueCat SDK, ensuring accurate, receipt-validated access to premium features (Alignment Exports).

## Reporting a Vulnerability

If you discover a vulnerability, please do NOT open a public issue. Email the maintainers directly or use GitHub's private vulnerability reporting feature.

We will acknowledge your report within 48 hours and provide a timeline for the fix.
