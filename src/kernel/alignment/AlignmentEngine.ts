import { Signal } from '../domain/Signal';
import { DecisionProposal } from '../domain/DecisionProposal';

export class AlignmentEngine {
  process(signal: Signal, proposal: DecisionProposal): { status: 'aligned' | 'divergent' | 'pending' } {
    if (signal.type === 'alignment_agree') {
      return { status: 'aligned' };
    }
    if (signal.type === 'alignment_challenge') {
      return { status: 'divergent' };
    }
    return { status: 'pending' };
  }
}
