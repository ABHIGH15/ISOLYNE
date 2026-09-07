import { GhostDecision, DecisionMoment } from '../types';
import { Clock } from '../Clock';

/**
 * Replaces the old PriorityResolver. 
 * Determines which of the composed Ghost Decisions actually becomes 
 * the single Decision Moment presented to the user.
 */
export class MomentSelectionPolicy {
  public static select(decisions: GhostDecision[], clock: Clock): DecisionMoment | null {
    if (decisions.length === 0) return null;

    // Policy rules:
    // 1. Urgency wins
    // 2. Cooldowns (not implemented here but would be)
    // 3. Suppression of duplicates

    const urgencyWeight = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1
    };

    const sorted = [...decisions].sort((a, b) => {
      return urgencyWeight[b.urgency] - urgencyWeight[a.urgency];
    });

    const topDecision = sorted[0];

    return {
      id: `moment-${topDecision.id}`,
      ghostDecision: topDecision,
      resolved: false,
      commitments: []
      // expiresAt could be computed based on event progress
    };
  }
}
