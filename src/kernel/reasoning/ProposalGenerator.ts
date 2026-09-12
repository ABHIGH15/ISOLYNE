import { AwarenessGap } from '../domain/AwarenessGap';
import { DecisionProposal } from '../domain/DecisionProposal';
import { formatChoice, getTimelineOptions } from '../domain/Timeline';

export class ProposalGenerator {
  generate(gap: AwarenessGap): DecisionProposal {
    const deterministicId = `prop_${gap.id}`;

    if (gap.type === 'ownership_gap') {
      return {
        id: deterministicId,
        gapId: gap.id,
        mode: 'assignment',
        description: 'Who should make the final call when the team is stuck?',
        targetState: 'One person owns final decisions'
      };
    } else if (gap.type === 'interpretation_gap') {
      const uniqueOptions = Array.from(new Set(gap.evidence.map(e => formatChoice(e.choice))));
      return {
        id: deterministicId,
        gapId: gap.id,
        mode: 'definition',
        description: `Let's align on the scope of ${gap.topic ?? 'the project'}. Which definition reflects what we are building?`,
        targetState: 'Team commits to a shared scope definition',
        options: uniqueOptions
      };
    } else if (gap.type === 'consensus_gap') {
      const uniqueOptions = Array.from(new Set(gap.evidence.map(e => formatChoice(e.choice))));
      return {
        id: deterministicId,
        gapId: gap.id,
        mode: 'alignment',
        description: 'Let\'s align the squad. Which direction makes the most sense right now?',
        targetState: 'Team aligns on a single choice',
        options: uniqueOptions
      };
    } else if (gap.type === 'timeline_gap' || gap.type === 'timeline_unresolved') {
      const uniqueOptions = getTimelineOptions(gap.evidence);
      return {
        id: deterministicId,
        gapId: gap.id,
        mode: 'alignment',
        description: gap.type === 'timeline_gap' ? 'When does the team actually need this by? Let\'s align our schedules.' : 'We have ambiguous timelines. Can we agree on an explicit date or time?',
        targetState: 'Team commits to a unified timeline',
        options: uniqueOptions
      };
    } else if (gap.type === 'integration_gap') {
      return {
        id: deterministicId,
        gapId: gap.id,
        mode: 'alignment',
        description: 'How should we resolve this contract mismatch?',
        targetState: 'Provider and consumers share the same contract schema'
      };
    }
    throw new Error(`Unsupported gap type: ${gap.type}`);
  }
}
