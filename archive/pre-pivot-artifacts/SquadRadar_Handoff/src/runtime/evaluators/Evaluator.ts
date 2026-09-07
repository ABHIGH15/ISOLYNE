import { AwarenessSnapshot, Insight } from '../types';
import { Clock } from '../Clock';

export interface Evaluator {
  isActive(snapshot: AwarenessSnapshot, clock: Clock): boolean;
  evaluate(snapshot: AwarenessSnapshot, viewerId: string): Insight[];
}
