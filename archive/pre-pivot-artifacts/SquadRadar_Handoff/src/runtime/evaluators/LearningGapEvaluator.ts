import { GapEvaluator, AwarenessGap } from '../GapEvaluator';
import { AwarenessSnapshot } from '../../types';

export class LearningGapEvaluator implements GapEvaluator {
  detect(snapshot: AwarenessSnapshot): AwarenessGap | null {
    // Condition: The event has ended, the project is complete.
    // The team gained knowledge, but it is not captured.
    
    // Simplistic heuristic: Time remaining is <= 0 or event is marked complete.
    if (snapshot.temporal.timeRemainingMs <= 0) {
      return {
        id: `gap_learning_${snapshot.timestamp}`,
        type: 'learning_gap',
        hiddenReality: 'The team gained knowledge that is not captured.',
        evidence: [] // Contains decisions, commitments, outcomes
      };
    }
    
    return null;
  }
}
