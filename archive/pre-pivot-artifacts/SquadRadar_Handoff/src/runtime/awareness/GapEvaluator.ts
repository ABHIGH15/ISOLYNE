import { AwarenessSnapshot, Signal } from '../types';
import { AwarenessGapType } from './gaps/AwarenessGapType';

export type AwarenessGap = {
  id: string;
  type: AwarenessGapType;
  hiddenReality: string;
  evidence: Signal[];
};

export interface GapEvaluator {
  detect(snapshot: AwarenessSnapshot): AwarenessGap | null;
}
