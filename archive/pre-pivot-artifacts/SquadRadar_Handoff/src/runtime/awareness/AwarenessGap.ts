export type GapType = 'silent_team' | 'majority_disagreement' | 'authority_conflict' | 'unresolved_friction';

export interface AwarenessGap {
  type: GapType;
  description: string;
  severity: 'critical' | 'high' | 'medium';
  competingClaims?: string[];
}
