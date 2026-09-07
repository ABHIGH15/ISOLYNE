import { Squad, Signal, Commitment } from './types';
import type { BuilderProfile } from '../decision-engine/types';

/**
 * Event-sourced projection of a Squad.
 */
export class SquadState {
  private initial: Squad;
  private log: Signal[] = [];

  constructor(initial: Squad) {
    this.initial = {
      ...initial,
      members: [...initial.members],
      commitments: [...initial.commitments]
    };
  }

  public append(signal: Signal): void {
    this.log.push(signal);
  }

  /**
   * Projects the event log onto the initial state to return the current squad reality.
   */
  public getProjection(): Squad {
    const squad: Squad = { ...this.initial };

    // Create mutable arrays for the projection
    squad.members = [...squad.members];
    squad.commitments = [...squad.commitments];
    // In a real full-schema update we would add proposals and alignments arrays to the Squad type.
    // For now, they live in the event log and can be derived by the Awareness Engine.

    for (const signal of this.log) {
      if (signal.type === 'member_joined' && signal.payload?.builder) {
        squad.members.push(signal.payload.builder as BuilderProfile);
      }
      if (signal.type === 'member_left' && signal.payload?.builderId) {
        squad.members = squad.members.filter((m) => m.id !== signal.payload!.builderId);
      }
      if (signal.type === 'commitment_made' && signal.payload?.commitment) {
        squad.commitments.push(signal.payload.commitment as Commitment);
      }
      // 'proposal_made' and 'alignment_made' are stored in the log and processed by the Tracker.
    }

    return squad;
  }
}
