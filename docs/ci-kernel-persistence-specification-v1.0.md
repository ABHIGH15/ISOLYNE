# CI Kernel Persistence Specification v1.0
STATUS: FROZEN

This document defines how the Collaboration Intelligence (CI) Kernel persists shared reality. The system transitions from ephemeral, in-memory execution to a durable, event-sourced architecture.

## 1. Event Sourcing Rules
The **Signal Log** is the absolute source of truth. The kernel must be able to reconstruct the `RealityState` at any point by replaying the Signal Log.
- Signals are immutable.
- A `RealityProjection` derives state purely by folding over historical signals.
- If a projection gets destroyed, the reality is not lost; it is rebuilt from the signals.

## 2. Persistence Boundaries
The CI Kernel must remain completely agnostic to the underlying database (e.g., PostgreSQL). All persistence operations happen through strict Repository boundaries.
- The Core Domain never imports repositories.
- The `PersistentCIKernel` acts as the orchestrator, bridging Domain Logic and Repositories.

## 3. Repository Contracts
- **SignalRepository:** `save(signal)`, `getBySquad(squadId)`
- **RealityRepository:** `save(squadId, state)`, `get(squadId)`
- **GapRepository:** `save(gap)`, `getActive(squadId)`, `resolve(gapId)`
- **ProposalRepository:** `save(proposal)`, `get(proposalId)`
- **CommitmentRepository:** `save(commitment)`, `getBySquad(squadId)`
- **MemoryRepository:** `save(memory)`, `getBySquad(squadId)`

## 4. Memory Lifecycle
Memory must preserve context, otherwise it decays into generic platitudes.
`CollaborationMemory` strictly requires:
- `squadId`
- `gapType`
- `context`
- `realityDiscovered`
- `lesson`

## 5. Permanently Forbidden Data
To prevent the system from degrading into traditional task management or surveillance, the following fields are permanently banned from the database schema:
❌ **Commitments:** `status`, `deadline`, `priority`, `assignee`
❌ **Signals:** `lines_of_code`, `hours_worked`
❌ **Builders:** `score`, `rank`, `rating`
