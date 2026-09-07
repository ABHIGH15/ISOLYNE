import { GapEvaluator, AwarenessGap } from '../GapEvaluator';
import { AwarenessSnapshot } from '../../types';

export class PivotGapEvaluator implements GapEvaluator {
  detect(snapshot: AwarenessSnapshot): AwarenessGap | null {
    // Condition: Time remaining: 8 hours (e.g. ~33% left of 24h)
    // Completed: 40%, Remaining: 60%
    // If progressPercent (40) < expected progress for time elapsed (66%)
    // The current plan cannot mathematically finish.
    
    // Simplistic heuristic for the experiment:
    // We assume 24 hours total, 8 hours left means 16 hours elapsed (66%).
    const EXPECTED_PROGRESS = 66; 
    
    if (snapshot.temporal.timeRemainingMs <= 8 * 60 * 60 * 1000) {
      if (snapshot.temporal.progressPercent < 50) { // arbitrary threshold for mathematically impossible
        return {
          id: `gap_pivot_${snapshot.timestamp}`,
          type: 'pivot_gap',
          hiddenReality: 'Current plan and available time are no longer aligned.',
          evidence: []
        };
      }
    }
    
    return null;
  }
}
