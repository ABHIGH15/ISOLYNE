import { Evaluator } from './Evaluator';
import { AwarenessSnapshot, Insight } from '../types';
import { Clock } from '../Clock';

export class ScopeEvaluator implements Evaluator {
  isActive(snapshot: AwarenessSnapshot, clock: Clock): boolean {
    return false;
  }
  evaluate(snapshot: AwarenessSnapshot, viewerId: string): Insight[] {
    return [];
  }
}
