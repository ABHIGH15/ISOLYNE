import { DecisionProposal } from '../../domain/DecisionProposal';

export interface ProposalRepository {
  save(proposal: DecisionProposal): Promise<void>;
  get(proposalId: string): Promise<DecisionProposal | null>;
}
