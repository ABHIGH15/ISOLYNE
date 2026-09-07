import { Signal } from '../domain/Signal';
import { RealityState } from '../domain/RealityState';

export class RealityProjection {
  static replay(signals: Signal[]): RealityState {
    const state: RealityState = {
      members: [],
      ownership: {},
      decisions: []
    };

    for (const signal of signals) {
      if (signal.type === 'member_joined') {
        if (!state.members.includes(signal.actorId)) {
          state.members.push(signal.actorId);
        }
      } else if (signal.type === 'decision_stated') {
        const idx = state.decisions.findIndex(d => d.actorId === signal.actorId && d.topic === signal.payload.topic);
        if (idx >= 0) {
          state.decisions[idx].choice = signal.payload.choice;
          state.decisions[idx].verbatim = signal.payload.verbatim;
        } else {
          state.decisions.push({
            actorId: signal.actorId,
            topic: signal.payload.topic,
            choice: signal.payload.choice,
            verbatim: signal.payload.verbatim
          });
        }
      } else if (signal.type === 'alignment_agree') {
        if (signal.payload?.type === 'ownership') {
          state.ownership.ownerId = signal.payload.ownerId;
        } else if (signal.payload?.type === 'consensus' || signal.payload?.type === 'definition' || signal.payload?.type === 'interpretation') {
          const { topic, choice } = signal.payload;
          state.decisions = state.decisions.filter(d => d.topic !== topic);
          state.decisions.push({ actorId: 'team_commitment', topic, choice, verbatim: `Team aligned on ${choice}` });
        }
      }
    }

    return state;
  }
}
