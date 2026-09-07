export type GapType = 
  | 'ownership_gap'
  | 'interpretation_gap'
  | 'consensus_gap'
  | 'integration_gap';

export interface AwarenessGap {
  id: string;
  type: GapType;
  hiddenReality: string;
  evidence: any[];
  topic?: string;
  squadId?: string;
}
