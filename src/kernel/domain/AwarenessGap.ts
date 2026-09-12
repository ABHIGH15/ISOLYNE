import { TimelineChoice } from './Timeline';

export type GapType = 
  | 'ownership_gap'
  | 'interpretation_gap'
  | 'consensus_gap'
  | 'integration_gap'
  | 'timeline_gap'
  | 'timeline_unresolved';

export interface AwarenessGap {
  id: string;
  type: GapType;
  hiddenReality: string;
  evidence: { actorId: string; choice: string | TimelineChoice; verbatim?: string }[];
  topic?: string;
  squadId?: string;
}
