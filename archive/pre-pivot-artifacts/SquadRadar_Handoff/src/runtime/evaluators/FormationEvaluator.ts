import { Evaluator } from './Evaluator';
import { AwarenessSnapshot, Insight } from '../types';
import { Clock } from '../Clock';
import { evaluateDecision } from '../../decision-engine/evaluate';
import type { DecisionInput, Team } from '../../decision-engine/types';

export class FormationEvaluator implements Evaluator {
  isActive(snapshot: AwarenessSnapshot, clock: Clock): boolean {
    return snapshot.temporal.progressPercent <= 20;
  }

  evaluate(snapshot: AwarenessSnapshot, viewerId: string): Insight[] {
    // If a leadership commitment was already made, the insight disappears!
    if (snapshot.composition.rolesFilled.includes('lead')) {
      return [];
    }

    const squad = snapshot.squad;
    const viewer = squad.members.find(m => m.id === viewerId);
    if (!viewer) return [];

    const legacyTeam: Team = {
      id: squad.id,
      name: squad.name,
      idea: squad.idea,
      members: squad.members.filter(m => m.id !== viewerId),
      needs: [] 
    };
    
    const input: DecisionInput = { viewer, team: legacyTeam };
    const legacyStory = evaluateDecision(input);

    // PRODUCT PRINCIPLE TEST:
    // "If surfacing this decision does not change user action, do not surface it."
    // A perfectly balanced team should resolve to silence.
    if (legacyStory.debug.headPatternId === 'balanced-default') {
      return [];
    }

    return [{
      id: `insight-formation-${squad.id}-${snapshot.timestamp}`,
      type: 'formation_risk',
      severity: legacyStory.recommendation.kind === 'skip' ? 'critical' : 'high',
      facts: {
        viewerRole: viewer.role,
        teamSize: squad.members.length
      },
      legacyStory
    }];
  }
}
