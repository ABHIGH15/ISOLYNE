import { Commitment } from '../../../domain/Commitment';

export interface CommitmentRepository {
  save(commitment: Commitment): Promise<void>;
  getBySquad(squadId: string): Promise<Commitment[]>;
}
