# Collaboration Intelligence Domain Model v1.0
STATUS: FROZEN

This document is the architectural constitution for the Collaboration Intelligence Kernel. It defines the core data model.

The database must not answer: *"Who completed what task?"*
It must answer: *"What reality did this team discover, when did they discover it, and how did it change their behavior?"*

---

## 1. Forbidden Concepts

The following concepts are explicitly banned from this architecture. Building them would destroy the category and pull the system into traditional project management or surveillance software.

❌ **Task management** (No assigning tickets, no burndown charts)
❌ **Performance scoring** (No grading engineers on speed or quality)
❌ **Individual ranking** (No leaderboards, no "top contributor" badges)
❌ **Productivity monitoring** (No measuring lines of code or commits per hour)
❌ **Employee surveillance** (No "time-in-seat" or activity heatmaps)

---

## 2. The Core Data Flow

```text
                 Event
                   |
                   v
                 Squad
                   |
                   v
            Reality Signals
                   |
                   v
             Awareness Gap
                   |
                   v
            Repair Proposal
                   |
                   v
           Alignment Session
                   |
                   v
              Commitment
                   |
                   v
         Collaboration Memory
                   |
                   v
       Future Team Intelligence
```

---

## 3. Entity Definitions

### Layer 1: Identity Model

**Builder**
Represents a human participating temporarily. *No performance scores allowed.*
```typescript
type Builder = {
  id: string;
  name: string;
  capabilities?: string[];
  preferences?: {
    workingStyle: string;
    communicationStyle: string;
  };
};
```

**Event**
The temporary collaboration container (e.g., Hackathon, Startup Sprint).
```typescript
type Event = {
  id: string;
  name: string;
  type: string;
  startTime: string;
  endTime: string;
};
```

**Squad**
The temporary team operating within an Event.
```typescript
type Squad = {
  id: string;
  eventId: string;
  members: Builder[];
  currentState: string;
};
```

### Layer 2: Reality Engine Model

**Signal**
Raw observations of behavior, time, or state changes used to detect gaps.

**AwarenessGap**
The most important entity. The system revolves around detecting missing shared reality.
```typescript
type AwarenessGap = {
  id: string;
  gapType: 
    | 'ownership_gap'
    | 'consensus_gap'
    | 'interpretation_gap'
    | 'integration_gap'
    | 'execution_gap'
    | 'pivot_gap'
    | 'meaning_gap'
    | 'learning_gap';
  discoveredAt: string;
  hiddenReality: string;
  evidence: Signal[];
  status: 'detected' | 'acknowledged' | 'resolved';
};
```

### Layer 3: Proposal Model

**DecisionProposal**
The engine does not command; it proposes reality repair.
```typescript
type DecisionProposal = {
  id: string;
  gapId: string;
  mode: 
    | 'assignment'
    | 'alignment'
    | 'definition'
    | 'specification'
    | 'diagnosis'
    | 'reframe'
    | 'framing'
    | 'reflection';
  description: string;
  targetState: string;
};
```

### Layer 4: Alignment Model

**AlignmentSession**
The mechanism to force explicit shared agreement, rather than implicit assumption.
```typescript
type AlignmentSession = {
  id: string;
  proposalId: string;
  participants: string[];
  responses: AlignmentResponse[];
  state: 'pending' | 'aligned' | 'divergent';
};

type AlignmentResponse = {
  builderId: string;
  response: 'agree' | 'challenge';
  reason?: string;
  timestamp: string;
};
```

### Layer 5: Commitment Model

**Commitment**
A commitment is not a task. It is a lock on shared reality (e.g., "We agree backend owns authentication decisions").
```typescript
type Commitment = {
  id: string;
  alignmentSessionId: string;
  ownerId: string;
  type: string;
  statement: string;
  createdAt: string;
};
```

### Layer 6: Learning Intelligence Model

**CollaborationMemory**
Extracts the resolution of a Reality Gap so future teams do not reset to zero. Memory is stored as systemic lessons, never as individual critiques.
```typescript
type CollaborationMemory = {
  id: string;
  sourceEventId: string;
  gapType: string;
  context: string;
  realityDiscovered: string;
  repair: string;
  lesson: string;
  createdAt: string;
};
```
