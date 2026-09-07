import { DecisionProposal } from '../types';

export class ExecutionProposalComposer {
  static compose(builderId: string): DecisionProposal {
    return {
      id: `prop_execution_${Date.now()}`,
      gapType: 'execution_gap',
      mode: 'diagnosis',
      proposedBy: builderId,
      proposedAction: 'Surface the hidden blocker.',
      targetState: 'Blocker classified and next action committed.',
      createdAt: Date.now()
    };
  }
}
