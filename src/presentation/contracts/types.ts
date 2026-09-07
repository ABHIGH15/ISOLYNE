export type GapSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface EvidenceView {
  actorId: string;
  choice: string;
  verbatim?: string;
}

export interface GapView {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: GapSeverity;
  evidence: EvidenceView[];
  topic?: string;
}

export interface ProposalView {
  id: string;
  gapId: string;
  actionText: string;
  description: string;
  options: string[];
}

export interface RadarState {
  status: 'clear' | 'attention';
  gap?: GapView;
  proposal?: ProposalView;
}

export interface DecisionRecordView {
  id: string;
  topic: string;
  choice: string;
  status: 'locked' | 'disputed' | 'superseded';
  actorId: string;
  isTeamCommitment: boolean;
}

export interface TimelineEventView {
  id: string;
  timestamp: string;
  description: string;
  type: 'statement' | 'divergence' | 'resolution';
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
}
