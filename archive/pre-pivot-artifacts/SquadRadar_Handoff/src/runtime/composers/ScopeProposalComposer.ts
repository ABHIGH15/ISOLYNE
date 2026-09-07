import { DecisionProposal } from '../types';

export class ScopeProposalComposer {
  static compose(builderId: string): DecisionProposal {
    return {
      id: `prop_scope_${Date.now()}`,
      gapType: 'interpretation_gap',
      mode: 'definition',
      proposedBy: builderId,
      proposedAction: 'Create one shared definition.',
      targetState: 'Target aligned.',
      createdAt: Date.now()
    };
  }
}
