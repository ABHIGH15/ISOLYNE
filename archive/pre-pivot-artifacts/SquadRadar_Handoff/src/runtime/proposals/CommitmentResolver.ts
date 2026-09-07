import { Commitment } from '../types';
import { AlignmentTracker } from './AlignmentTracker';

export class CommitmentResolver {
  static resolve(tracker: AlignmentTracker, clockTime: number): Commitment | null {
    if (!tracker.isFullyAligned) {
      return null;
    }

    return {
      id: `cmt_${tracker.proposal.id}`,
      proposalId: tracker.proposal.id,
      ownerId: tracker.proposal.proposedBy,
      type: 'role', // Derived from proposal context in the future
      action: tracker.proposal.proposedAction,
      timestamp: clockTime
    };
  }
}
