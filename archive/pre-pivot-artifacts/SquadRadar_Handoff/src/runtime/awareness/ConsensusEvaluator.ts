import { Alignment, Builder, DecisionProposal } from '../types';
import { AlignmentState } from './AlignmentState';
import { AwarenessGap } from './AwarenessGap';

export class ConsensusEvaluator {
  static evaluate(
    proposal: DecisionProposal,
    alignments: Alignment[],
    members: Builder[]
  ): { state: AlignmentState; gap: AwarenessGap | null } {
    const agrees = alignments.filter(a => a.response === 'agree').length;
    const challenges = alignments.filter(a => a.response === 'challenge').length;
    const missing = members.length - (agrees + challenges);

    let status: AlignmentState['status'] = 'aligned';
    if (challenges > 0) status = 'divergent';
    else if (missing > 0) status = 'pending';

    const state: AlignmentState = {
      proposalId: proposal.id,
      status,
      agrees,
      challenges,
      missing,
      totalMembers: members.length
    };

    let gap: AwarenessGap | null = null;

    // Detect rich authority conflicts
    const competingClaims = alignments
      .filter(a => a.response === 'challenge' && a.reason)
      .map(a => `${a.builderId}: "${a.reason}"`);

    if (competingClaims.length > 0) {
      gap = {
        type: 'authority_conflict',
        severity: 'critical',
        description: 'The issue is not missing leadership. The issue is conflicting ownership models.',
        competingClaims
      };
    }
    // Case A: Silent Team (Unknown awareness. Silence ≠ Agreement)
    else if (missing === members.length || (missing > 0 && agrees === 0 && challenges === 0)) {
      gap = {
        type: 'silent_team',
        severity: 'high',
        description: 'We do not know if the team is aligned. Silence ≠ Agreement.'
      };
    }
    // Case B: Majority Disagreement
    else if (challenges > agrees) {
      gap = {
        type: 'majority_disagreement',
        severity: 'critical',
        description: 'Alignment incomplete. Multiple ownership assumptions exist.'
      };
    }
    // Catch-all for unresolved friction
    else if (status === 'divergent') {
      gap = {
        type: 'unresolved_friction',
        severity: 'medium',
        description: 'Alignment incomplete. A challenge exists.'
      };
    }

    return { state, gap };
  }
}
