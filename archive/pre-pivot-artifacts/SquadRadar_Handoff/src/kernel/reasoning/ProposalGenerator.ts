import { AwarenessGap } from '../domain/AwarenessGap';
import { DecisionProposal } from '../domain/DecisionProposal';

export class ProposalGenerator {
  generate(gap: AwarenessGap): DecisionProposal {
    if (gap.type === 'ownership_gap') {
      return {
        id: `prop_${Date.now()}`,
        gapId: gap.id,
        mode: 'assignment',
        description: 'Create ownership alignment',
        targetState: 'One person owns final decisions'
      };
    }
    throw new Error('Unsupported gap type');
  }
}
