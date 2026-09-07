import { DecisionProposal } from '../types';

export class IntegrationProposalComposer {
  static compose(builderId: string): DecisionProposal {
    return {
      id: `prop_integration_${Date.now()}`,
      gapType: 'integration_gap',
      mode: 'specification',
      proposedBy: builderId,
      proposedAction: 'Create one shared contract before integration.',
      targetState: 'Both systems expect the same thing.',
      createdAt: Date.now()
    };
  }
}
