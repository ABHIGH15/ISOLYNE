import { GapEvaluator, AwarenessGap } from '../GapEvaluator';
import { AwarenessSnapshot } from '../../types';

export class InterpretationGapEvaluator implements GapEvaluator {
  detect(snapshot: AwarenessSnapshot): AwarenessGap | null {
    // Activates if multiple ideas exist and no formal scope lock has been committed.
    if (!snapshot.scope.committed && snapshot.scope.competingIdeas > 1) {
      return {
        id: `gap_interpretation_${snapshot.timestamp}`,
        type: 'interpretation_gap',
        hiddenReality: 'People mean different things when discussing the scope.',
        evidence: []
      };
    }
    return null;
  }
}
