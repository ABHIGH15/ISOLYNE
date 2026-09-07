import { RealityState } from '../../domain/RealityState';

export interface RealityRepository {
  save(squadId: string, state: RealityState): Promise<void>;
  get(squadId: string): Promise<RealityState | null>;
}
