import { Signal } from '../domain/Signal';
import { RealityState } from '../domain/RealityState';

export class RealityProjection {
  private state: RealityState = {
    members: [],
    ownership: {}
  };

  apply(signal: Signal): RealityState {
    if (signal.type === 'member_joined') {
      if (!this.state.members.includes(signal.actorId)) {
        this.state.members.push(signal.actorId);
      }
    }
    return this.state;
  }

  setOwnership(ownerId: string) {
    this.state.ownership.ownerId = ownerId;
  }

  getState(): RealityState {
    return this.state;
  }
}
