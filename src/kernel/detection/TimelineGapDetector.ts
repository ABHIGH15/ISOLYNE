import { GapDetector } from './GapDetector';
import { RealityState } from '../domain/RealityState';
import { AwarenessGap } from '../domain/AwarenessGap';
import { Granularity, TimelineChoice, coarser, truncate, TOLERANCE_MS } from '../domain/Timeline';



export class TimelineGapDetector implements GapDetector {
  detect(state: RealityState): AwarenessGap | null {
    const timelineDecisions = new Map<string, Array<{ actorId: string; choice: TimelineChoice; verbatim?: string }>>();

    for (const dec of state.decisions) {
      if (typeof dec.choice === 'object' && dec.choice !== null && 'granularity' in dec.choice) {
        if (!timelineDecisions.has(dec.topic)) {
          timelineDecisions.set(dec.topic, []);
        }
        timelineDecisions.get(dec.topic)!.push({ actorId: dec.actorId, choice: dec.choice as TimelineChoice, verbatim: dec.verbatim });
      }
    }

    for (const [topic, decisions] of timelineDecisions.entries()) {
      if (decisions.length < 2) continue;

      const choices = decisions.map(d => d.choice);
      let isUnresolved = false;
      let gapPair: typeof decisions | null = null;

      // Note on timezones: Assuming UTC/local alignment for this hackathon version.
      // Real-world, cross-timezone teams would need explicit TZ resolution anchors.
      
      // Compare all unique pairs
      for (let i = 0; i < choices.length; i++) {
        for (let j = i + 1; j < choices.length; j++) {
          const a = choices[i];
          const b = choices[j];

          if (a.confidence === 'low' || b.confidence === 'low' || !a.resolved_datetime || !b.resolved_datetime) {
            isUnresolved = true;
            continue;
          }

          const gran = coarser(a.granularity, b.granularity);
          const bucketA = truncate(a.resolved_datetime, gran);
          const bucketB = truncate(b.resolved_datetime, gran);
          const tolerance = TOLERANCE_MS[gran];

          if (Math.abs(bucketA - bucketB) > tolerance) {
            gapPair = [decisions[i], decisions[j]];
            break;
          }
        }
        if (gapPair) break;
      }

      if (gapPair) {
        const safeTopic = topic.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        return {
          id: `gap_timeline_${safeTopic}`,
          type: 'timeline_gap',
          hiddenReality: `Your team has conflicting assumptions about ${topic}. One expects "${gapPair[0].choice.raw_text}", another expects "${gapPair[1].choice.raw_text}".`,
          evidence: decisions,
          topic
        };
      } else if (isUnresolved) {
        const safeTopic = topic.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        return {
          id: `gap_timeline_unresolved_${safeTopic}`,
          type: 'timeline_unresolved',
          hiddenReality: `Your team stated a timeline for ${topic}, but it's too ambiguous to confirm alignment.`,
          evidence: decisions,
          topic
        };
      }
    }

    return null;
  }
}
