import { AwarenessGap } from '../domain/AwarenessGap';
import { DecisionProposal } from '../domain/DecisionProposal';

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
      const uniqueOptions = Array.from(new Set(gap.evidence.map(e => e.choice)));
      return {
        id: deterministicId,
        gapId: gap.id,
        mode: 'definition',
        description: `Let's align on the scope of ${gap.topic ?? 'the project'}. Which definition reflects what we are building?`,
        targetState: 'Team commits to a shared scope definition',
        options: uniqueOptions
      };
    } else if (gap.type === 'consensus_gap') {
      const uniqueOptions = Array.from(new Set(gap.evidence.map(e => e.choice)));
      return {
        id: deterministicId,
        gapId: gap.id,
        mode: 'alignment',
        description: 'Let\'s align the squad. Which direction makes the most sense right now?',
        targetState: 'Team aligns on a single choice',
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
