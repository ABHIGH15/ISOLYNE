# CI Kernel v0.1 Specification
STATUS: FROZEN

This document serves as the engineering contract for the Collaboration Intelligence (CI) Kernel. It defines how intelligence moves through the system.

## 1. Kernel Purpose

The Collaboration Intelligence Kernel detects gaps between actual shared reality and perceived shared reality, then facilitates explicit synchronization.

## 2. Core Invariant

The entire engine operates on:
**Actual Shared Reality ≠ Perceived Shared Reality**
The kernel exists only to reduce this difference.

## 3. Kernel Pipeline

Intelligence flows strictly through this frozen lifecycle:

```text
                    Signal
                       ↓
              Reality Projection
                       ↓
              Awareness Detection
                       ↓
                 Awareness Gap
                       ↓
                Repair Proposal
                       ↓
               Alignment Process
                       ↓
               Commitment State
                       ↓
             Collaboration Memory
```

## 4. Signal Contract

Signals are pure observations. They are not commands.

```typescript
type Signal = {
  id: string;
  squadId: string;
  actorId: string;
  type: string;
  timestamp: string;
  payload: any;
};
```
**Allowed Examples:** `member_joined`, `scope_changed`, `decision_challenged`, `blocker_reported`, `integration_started`, `reflection_created`
**Forbidden Examples:** `create_task`, `assign_employee`, `rank_member`

## 5. Reality Projection

The kernel maintains the `RealityState`, not a `TaskState`. It answers: *"What does the team currently believe?"*

```typescript
type RealityState = {
  members: any[];
  assumptions: any[];
  decisions: any[];
  commitments: any[];
  blockers: any[];
  unresolvedGaps: any[];
};
```

## 6. Awareness Gap Contract

Every detector returns an Awareness Gap describing the unshared reality.

```typescript
type AwarenessGap = {
  id: string;
  type: string;
  hiddenReality: string;
  evidence: Signal[];
  confidence: number;
  status: 'detected' | 'acknowledged' | 'resolved';
};
```
*Example:* `type: "ownership_gap"`, `hiddenReality: "No person currently owns final decisions"`

## 7. Proposal Contract

Proposal ≠ instruction. A proposal is a synchronization mechanism.

```typescript
type DecisionProposal = {
  gapId: string;
  mode: 
    | 'assignment'
    | 'definition'
    | 'selection'
    | 'specification'
    | 'diagnosis'
    | 'reframe'
    | 'framing'
    | 'reflection';
  description: string;
  targetState: string;
};
```

## 8. Alignment Contract

Alignment answers: *"Does the team share the same interpretation?"*
**States:** `pending`, `aligned`, `divergent`

## 9. Commitment Contract

Commitment represents a synchronized state, not a task.
**Bad Example:** "Build API"
**Good Example:** "Backend owns API contract decisions"

## 10. Memory Rules

Memory stores: `Reality discovered + Context + Lesson`
Memory NEVER stores: `Person failed`, `Person was slow`, `Person caused issue`

## 11. Non-Goals

The kernel is NOT:
- A project manager
- A task tracker
- An employee monitor
- Productivity analytics
- A team ranking system
- A communication replacement
