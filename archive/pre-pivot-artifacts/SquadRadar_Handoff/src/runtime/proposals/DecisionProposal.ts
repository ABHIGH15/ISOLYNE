import { DecisionProposal } from '../types';

export const createDecisionProposal = (
  id: string,
  decisionType: string,
  proposedBy: string,
  proposedAction: string,
  createdAt: number
): DecisionProposal => {
  return {
    id,
    decisionType,
    proposedBy,
    proposedAction,
    createdAt
  };
};
