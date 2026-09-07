import type { BuilderProfile, DecisionStory } from '../decision-engine/types';
import { AwarenessGapType } from './awareness/gaps/AwarenessGapType';

export type Builder = BuilderProfile;
export type CommitmentType = 'role' | 'scope' | 'mentor' | 'freeze' | 'presentation' | 'proposal';
export type ProposalMode = 'assignment' | 'selection' | 'definition' | 'specification' | 'diagnosis' | 'framing' | 'reflection';

export type DecisionProposal = {
  id: string;
  gapType: AwarenessGapType;
  mode: ProposalMode;
  proposedBy: string;
  proposedAction: string;
  targetState: string;
  createdAt: number;
};

export type Commitment = {
  id: string;
  proposalId: string;
  ownerId: string;
  type: 'role' | 'goal' | 'intensity';
  action: string;
  timestamp: number;
};

export type AlignmentState = 'pending' | 'aligned' | 'divergent' | 'expired';

export type Alignment = {
  id: string;
  proposalId: string;
  builderId: string;
  response: 'agree' | 'challenge';
  reason?: string;
  timestamp: number;
};

export type SignalPayload = {
  proposal?: DecisionProposal;
  commitment?: Commitment;
  alignment?: Alignment;
};

export type Squad = {
  id: string;
  eventId: string;
  name: string;
  idea: string;
  members: Builder[];
  commitments: Commitment[];
};

export type Event = {
  id: string;
  name: string;
  startTime: string; // ISO8601
  endTime: string; // ISO8601
};

// Signal versioning & actor tracking added
export type SignalType = 'member_joined' | 'member_left' | 'proposal_made' | 'commitment_made' | 'alignment_made' | 'time_elapsed' | 'stuck_flagged' | 'code_merged';

export type Signal = {
  id: string;
  version: number;
  squadId: string;
  actorId: string; // Who triggered this
  type: SignalType;
  timestamp: string; // ISO8601
  payload?: Record<string, any>;
};

// --- Computed Awareness ---

export type AwarenessSnapshot = {
  timestamp: string;
  squad: Squad;
  event: Event;
  temporal: {
    timeRemainingMs: number;
    elapsedMs: number;
    progressPercent: number;
  };
  composition: {
    totalMembers: number;
    rolesFilled: string[];
    missingRoles: string[]; // derived
  };
  scope: {
    committed: boolean;
    competingIdeas: number;
  };
  integration: {
    mismatchDetected: boolean;
    contractLocked: boolean;
  };
  activity: {
    lastSignalTimestamp: string | null;
    stuck: boolean;
  };
};

// --- Insights & Decisions ---

// A pure observation from an evaluator
export type Insight = {
  id: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  facts: Record<string, any>;
  // Temporary bridge
  legacyStory?: DecisionStory;
};

export type GhostDecisionCategory = 'leadership' | 'scope' | 'integration' | 'stuck' | 'pivot' | 'demo' | 'submission';
export type Urgency = 'critical' | 'high' | 'medium' | 'low';

export type ActionOption = {
  id: string;
  label: string;
  actionType: CommitmentType;
  actionValue?: string;
};

// The translated observation, ready for UI
export type GhostDecision = {
  id: string;
  insightId: string;
  category: GhostDecisionCategory;
  title: string;
  foresight: string;
  urgency: Urgency;
  options: ActionOption[];
};

export type DecisionMoment = {
  id: string;
  ghostDecision: GhostDecision;
  expiresAt?: string;
  resolved: boolean;
  commitments: string[]; 
};
