import { GapDetector } from './GapDetector';
import { RealityState } from '../domain/RealityState';
import { AwarenessGap } from '../domain/AwarenessGap';

export class OwnershipGapDetector implements GapDetector {
  detect(state: RealityState): AwarenessGap | null {
    if (state.members.length > 1 && !state.ownership.ownerId) {
      return {
        id: `gap_ownership_${Date.now()}`,
        type: 'ownership_gap',
        hiddenReality: 'No person owns final decisions',
        evidence: []
      };
    }
    return null;
  }
}
