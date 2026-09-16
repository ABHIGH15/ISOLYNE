import { GapDetector } from './GapDetector';
import { RealityState } from '../domain/RealityState';
import { AwarenessGap } from '../domain/AwarenessGap';
import { TimelineChoice, truncate, TOLERANCE_MS } from '../domain/Timeline';

export class ExecutionGapDetector implements GapDetector {
  detect(state: RealityState, now?: string): AwarenessGap | null {
    if (!now) return null;
    const nowTime = new Date(now).getTime();

    let earliestStaleDecision: { actorId: string; topic: string; choice: TimelineChoice; verbatim?: string } | null = null;
    let earliestDeadline = Infinity;

    for (const dec of state.decisions) {
      if (typeof dec.choice === 'object' && dec.choice !== null && 'granularity' in dec.choice) {
        const choice = dec.choice as TimelineChoice;
        if (!choice.resolved_datetime || choice.confidence === 'low') continue;

        const bucketDeadline = truncate(choice.resolved_datetime, choice.granularity);
        // Add the length of the granularity to get the end of the bucket (e.g., 'Friday' ends at Friday 23:59:59)
        const granDuration = choice.granularity === 'day' ? 24 * 60 * 60 * 1000 :
                             choice.granularity === 'half_day' ? 12 * 60 * 60 * 1000 :
                             choice.granularity === 'hour' ? 60 * 60 * 1000 : 60 * 1000;
        const effectiveDeadline = bucketDeadline + granDuration;

        if (nowTime > effectiveDeadline) {
          if (effectiveDeadline < earliestDeadline) {
            earliestDeadline = effectiveDeadline;
            earliestStaleDecision = {
              actorId: dec.actorId,
              topic: dec.topic,
              choice,
              verbatim: dec.verbatim
            };
          }
        }
      }
    }

    if (earliestStaleDecision) {
      const { topic, choice, actorId } = earliestStaleDecision;
      const safeTopic = topic.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const actorName = actorId === 'team_commitment' ? 'The team' : actorId;
      
      return {
        id: `gap_execution_${safeTopic}`,
        type: 'execution_gap',
        hiddenReality: `${actorName} committed to ${topic} by ${choice.raw_text}, but the deadline has passed with no update.`,
        evidence: [earliestStaleDecision],
        topic
      };
    }

    return null;
  }
}
