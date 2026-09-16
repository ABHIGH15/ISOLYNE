import { RealityState } from '../domain/RealityState';
import { AwarenessGap } from '../domain/AwarenessGap';

export interface GapDetector {
  detect(state: RealityState, now?: string): AwarenessGap | AwarenessGap[] | null;
}
