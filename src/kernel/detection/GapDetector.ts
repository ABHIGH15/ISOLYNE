import { RealityState } from '../domain/RealityState';
import { AwarenessGap } from '../domain/AwarenessGap';

export interface GapDetector {
  detect(state: RealityState): AwarenessGap | AwarenessGap[] | null;
}
