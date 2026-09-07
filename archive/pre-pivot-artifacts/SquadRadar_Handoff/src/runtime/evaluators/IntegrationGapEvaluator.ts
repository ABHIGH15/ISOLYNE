import { GapEvaluator, AwarenessGap } from '../GapEvaluator';
import { AwarenessSnapshot } from '../../types';

export class IntegrationGapEvaluator implements GapEvaluator {
  detect(snapshot: AwarenessSnapshot): AwarenessGap | null {
    if (snapshot.integration.mismatchDetected && !snapshot.integration.contractLocked) {
      return {
        id: `gap_integration_${snapshot.timestamp}`,
        type: 'integration_gap',
        hiddenReality: 'Assumptions differ across boundaries.',
        evidence: []
      };
    }
    return null;
  }
}
