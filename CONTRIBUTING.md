# Contributing to Isolyne

We love pull requests from everyone. By participating in this project, you agree to abide by the standard Contributor Covenant Code of Conduct.

## Getting Started

1. Ensure you have the latest Node.js installed.
2. Clone the repository and run `npm install`.
3. Run `npm test` to verify the CQRS invariant tests pass.

## Architecture Rules

Isolyne relies on strict, deterministic event sourcing. If you are adding a new detector to the Kernel:
- **Do not use LLMs for detection.** The LLM is strictly used for extraction (`src/services/llmParser.ts`).
- **All detectors must be mathematically deterministic.** Look at `src/kernel/detection/` for examples of pure TypeScript gap detection.
- **Always update the test suite.** Any new detector requires at least one invariant test asserting no false positives.

## Submitting a PR

1. Ensure `tsc --noEmit` and `npm test` pass cleanly.
2. Add a description of the problem and the solution.
3. If this modifies the presentation layer, include screenshots.

Thank you for contributing!
