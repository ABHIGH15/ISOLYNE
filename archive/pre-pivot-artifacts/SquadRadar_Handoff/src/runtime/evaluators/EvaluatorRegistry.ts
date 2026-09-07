import { Evaluator } from './Evaluator';
import { AwarenessSnapshot, Insight } from '../types';
import { Clock } from '../Clock';

export class EvaluatorRegistry {
  private evaluators: Evaluator[] = [];

  public register(evaluator: Evaluator) {
    this.evaluators.push(evaluator);
  }

  public evaluateAll(snapshot: AwarenessSnapshot, viewerId: string, clock: Clock): Insight[] {
    const allInsights: Insight[] = [];
    for (const evaluator of this.evaluators) {
      if (evaluator.isActive(snapshot, clock)) {
        allInsights.push(...evaluator.evaluate(snapshot, viewerId));
      }
    }
    return allInsights;
  }
}
