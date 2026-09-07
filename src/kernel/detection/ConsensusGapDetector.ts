import { GapDetector } from './GapDetector';
import { RealityState } from '../domain/RealityState';
import { AwarenessGap } from '../domain/AwarenessGap';

export class ConsensusGapDetector implements GapDetector {
  detect(state: RealityState): AwarenessGap | null {
    const topicDecisions = new Map<string, Array<{actorId: string, choice: string, verbatim?: string}>>();

    for (const dec of state.decisions) {
      if (!topicDecisions.has(dec.topic)) {
        topicDecisions.set(dec.topic, []);
      }
      topicDecisions.get(dec.topic)!.push({ actorId: dec.actorId, choice: dec.choice, verbatim: dec.verbatim });
    }

    for (const [topic, decisions] of topicDecisions.entries()) {
      const uniqueChoices = new Set(decisions.map(d => d.choice));
      if (uniqueChoices.size > 1) {
        // DETERMINISTIC ID: essential for preventing duplicate divergence events
        const safeTopic = topic.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        return {
          id: `gap_consensus_${safeTopic}`,
          type: 'consensus_gap',
          hiddenReality: `Your team is running with different assumptions about ${topic}. Aligning now will save hours of rework.`,
          evidence: decisions,
          topic
        };
      }
    }

    return null;
  }
}
