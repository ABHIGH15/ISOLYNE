import { Evaluator } from './Evaluator';
import { AwarenessSnapshot, Insight } from '../types';
import { Clock } from '../Clock';

export class ScopeGapEvaluator implements Evaluator {
  isActive(snapshot: AwarenessSnapshot, clock: Clock): boolean {
    // Activates if multiple ideas exist and no formal scope lock has been committed.
    return !snapshot.scope.committed && snapshot.scope.competingIdeas > 1;
  }

  evaluate(snapshot: AwarenessSnapshot, viewerId: string): Insight[] {
    return [
      {
        id: `insight_scope_gap_${snapshot.timestamp}`,
        type: 'scope_gap',
        severity: 'critical',
        facts: {
          competingIdeas: snapshot.scope.competingIdeas,
          message: `${snapshot.composition.totalMembers || 4} people. ${snapshot.scope.competingIdeas} interpretations.`
        }
      }
    ];
  }
}
