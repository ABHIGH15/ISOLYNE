import { RadarState, GapView, ProposalView, DecisionRecordView, TimelineEventView } from './types';
import { Signal } from '../../kernel/domain/Signal';

export class KernelPresentationAdapter {
  static toRadarState(evaluation: any): RadarState {
    if (!evaluation || !evaluation.selectedGap) {
      return { status: 'clear' };
    }

    const gap = evaluation.selectedGap;
    const proposal = evaluation.proposal;

    const gapView: GapView = {
      id: gap.id,
      type: gap.type,
      title: gap.type === 'consensus_gap' ? 'DRIFT DETECTED' : gap.type.replace('_', ' ').toUpperCase(),
      description: gap.hiddenReality,
      severity: gap.type === 'consensus_gap' ? 'high' : 'medium',
      evidence: gap.evidence || [],
      topic: gap.topic
    };

    let proposalView: ProposalView | undefined;
    if (proposal) {
      proposalView = {
        id: proposal.id,
        gapId: proposal.gapId,
        actionText: proposal.mode === 'alignment' ? 'Resolve' : 'Assign Owner',
        description: proposal.description,
        options: proposal.options || []
      };
    }

    return {
      status: 'attention',
      gap: gapView,
      proposal: proposalView
    };
  }

  static toDecisionRecords(evaluation: any): DecisionRecordView[] {
    if (!evaluation || !evaluation.state || !evaluation.state.decisions) return [];

    const rawDecisions = evaluation.state.decisions;
    const activeGaps = evaluation.gaps || [];

    return rawDecisions.map((d: any, index: number) => {
      const isTeamCommitment = d.actorId === 'team_commitment';
      let status: 'locked' | 'disputed' | 'superseded' = 'locked';
      
      const hasConflict = activeGaps.some((g: any) => 
        g.type === 'consensus_gap' && g.topic === d.topic
      );
      
      if (hasConflict) {
        status = 'disputed';
      }

      return {
        id: `dec_${d.topic}_${d.actorId}_${index}`,
        topic: d.topic,
        choice: d.choice,
        status,
        actorId: d.actorId,
        isTeamCommitment
      };
    });
  }

  static toTimelineEvents(signals: Signal[]): TimelineEventView[] {
    const events: TimelineEventView[] = [];

    for (const sig of signals) {
      if (sig.type === 'decision_stated') {
        events.push({
          id: sig.id,
          timestamp: sig.timestamp,
          type: 'statement',
          description: `${sig.actorId} stated\n${sig.payload?.topic} → ${sig.payload?.choice}`
        });
      } else if (sig.type === 'divergence_detected') {
        events.push({
          id: sig.id,
          timestamp: sig.timestamp,
          type: 'divergence',
          description: `Radar detected\n${sig.payload?.topic} divergence`
        });
      } else if (sig.type === 'alignment_agree' && sig.payload?.type === 'consensus') {
        events.push({
          id: sig.id,
          timestamp: sig.timestamp,
          type: 'resolution',
          description: `Team resolved\n${sig.payload?.topic} → ${sig.payload?.choice}`
        });
      }
    }

    // Return descending chronologically
    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}
