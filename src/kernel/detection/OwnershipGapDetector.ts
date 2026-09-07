import { GapDetector } from './GapDetector';
import { RealityState } from '../domain/RealityState';
import { AwarenessGap } from '../domain/AwarenessGap';

export class OwnershipGapDetector implements GapDetector {
  detect(state: RealityState): AwarenessGap | null {
    if (state.members.length > 1 && !state.ownership.ownerId) {
      return {
        id: `gap_ownership_${state.members.join('_')}`,
        type: 'ownership_gap',
        hiddenReality: 'The project decisions are floating without an owner. Assigning one ensures it won\'t block the team.',
        evidence: []
      };
    }
    return null;
  }
}
