import { RealityState } from '../domain/RealityState';
import { AwarenessGap } from '../domain/AwarenessGap';
import { GapDetector } from './GapDetector';

export class EvaluatorPipeline {
  constructor(private detectors: GapDetector[]) {}

  evaluate(state: RealityState): AwarenessGap[] {
    const allGaps: AwarenessGap[] = [];
    
    for (const detector of this.detectors) {
      const result = detector.detect(state);
      if (result) {
        if (Array.isArray(result)) {
          allGaps.push(...result);
        } else {
          allGaps.push(result);
        }
      }
    }
    
    return allGaps;
  }
}
