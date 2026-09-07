import { GapEvaluator, AwarenessGap } from '../GapEvaluator';
import { AwarenessSnapshot } from '../../types';

export class OwnershipGapEvaluator implements GapEvaluator {
  detect(snapshot: AwarenessSnapshot): AwarenessGap | null {
    // If a leadership commitment is already made, no gap.
    if (snapshot.composition.rolesFilled.includes('lead')) {
      return null;
    }
    
    // In actual implementation, we might check time passed or specific signals.
    // Assuming a gap exists if no lead is present in the early stages:
    if (snapshot.temporal.progressPercent <= 20) {
      return {
        id: `gap_ownership_${snapshot.timestamp}`,
        type: 'ownership_gap',
        hiddenReality: 'No decision owner exists.',
        evidence: [] // In real implementation, pull from snapshot signals
      };
    }
    
    return null;
  }
}
