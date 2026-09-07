import { GapEvaluator, AwarenessGap } from '../GapEvaluator';
import { AwarenessSnapshot } from '../../types';

export class ExecutionGapEvaluator implements GapEvaluator {
  detect(snapshot: AwarenessSnapshot): AwarenessGap | null {
    if (!snapshot.activity.lastSignalTimestamp) return null;
    
    const lastSignalTime = new Date(snapshot.activity.lastSignalTimestamp).getTime();
    // In a real clock environment we'd pass clock.now(), but assuming basic Date.now() for the interface change
    const timeSinceLast = Date.now() - lastSignalTime; 
    
    // Threshold: 3 hours
    const THREE_HOURS_MS = 3 * 60 * 60 * 1000;
    
    if (timeSinceLast > THREE_HOURS_MS && !snapshot.activity.stuck) {
      return {
        id: `gap_execution_${snapshot.timestamp}`,
        type: 'execution_gap',
        hiddenReality: 'Progress stopped and blocker is unknown.',
        evidence: []
      };
    }
    
    return null;
  }
}
