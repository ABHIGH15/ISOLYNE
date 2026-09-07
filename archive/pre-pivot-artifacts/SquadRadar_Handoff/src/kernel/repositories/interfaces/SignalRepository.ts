import { Signal } from '../../../domain/Signal';

export interface SignalRepository {
  save(signal: Signal): Promise<void>;
  getBySquad(squadId: string): Promise<Signal[]>;
}
