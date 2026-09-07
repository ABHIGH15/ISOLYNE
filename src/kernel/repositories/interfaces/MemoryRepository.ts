import { CollaborationMemory } from '../../domain/CollaborationMemory';

export interface MemoryRepository {
  save(memory: CollaborationMemory): Promise<void>;
  getBySquad(squadId: string): Promise<CollaborationMemory[]>;
}
