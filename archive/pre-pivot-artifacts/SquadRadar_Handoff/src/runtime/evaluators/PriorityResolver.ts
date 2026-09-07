import { GhostDecision, DecisionMoment } from '../types';

export class PriorityResolver {
  public static resolve(decisions: GhostDecision[]): DecisionMoment | null {
    if (decisions.length === 0) return null;

    // Sort by urgency: critical > high > medium > low
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
      // expiresAt could be computed based on temporal phase
    };
  }
}
